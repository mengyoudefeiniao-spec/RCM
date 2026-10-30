// Vite's local development proxy is restricted to a single Huawei FRS endpoint.
export async function checkReferenceImage({ token, projectId, referenceImage, fetchImpl = fetch, signal }) {
  if (!token?.trim() || !/^[a-f0-9]{32}$/i.test(projectId || '')) throw new Error('invalid_config');
  if (!(referenceImage instanceof Blob) || !['image/jpeg', 'image/png'].includes(referenceImage.type) || !referenceImage.size || referenceImage.size >= 8 * 1024 * 1024) throw new Error('invalid_image');
  const form = new FormData();
  form.append('image_file', referenceImage, referenceImage.type === 'image/png' ? 'reference.png' : 'reference.jpg');
  const response = await fetchImpl(`/__huawei_frs/v2/${projectId}/face-detect`, { method:'POST', headers:{ 'X-Auth-Token':token.trim() }, body:form, signal });
  if (!response.ok) throw new Error('reference_upload_failed');
  const data = await response.json();
  if (!Array.isArray(data.faces)) throw new Error('invalid_response');
  if (data.faces.length !== 1) throw new Error('face_count');
  return true;
}

export async function compareLiveFace({ token, projectId, referenceImage, video, action, fetchImpl = fetch, signal }) {
  if (!token?.trim() || !/^[a-f0-9]{32}$/i.test(projectId || '')) throw new Error('invalid_config');
  if (!(referenceImage instanceof Blob) || !['image/jpeg','image/png','image/bmp'].includes(referenceImage.type) || referenceImage.size > 8 * 1024 * 1024) throw new Error('invalid_image');
  if (!(video instanceof Blob) || !video.size || video.size > 8 * 1024 * 1024 || ![1,2,3,4,5].includes(action)) throw new Error('invalid_video');
  async function post(version, operation, body) {
    const response = await fetchImpl(`/__huawei_frs/${version}/${projectId}/${operation}`, { method:'POST', headers:{ 'X-Auth-Token': token.trim() }, body, signal });
    if (!response.ok) {
      let data;
      try { data = await response.json(); } catch { data = null; }
      const error = new Error('huawei_request_failed');
      error.step = operation;
      if (typeof data?.error_code === 'string' && /^FRS\.\d{4}$/.test(data.error_code)) error.code = data.error_code;
      throw error;
    }
    return response.json();
  }
  const videoForm = new FormData();
  videoForm.append('video_file', video, video.type.startsWith('video/mp4') ? 'capture.mp4' : 'capture.webm');
  videoForm.append('actions', String(action));
  const live = (await post('v1', 'live-detect', videoForm))?.['video-result'];
  if (typeof live?.alive !== 'boolean') throw new Error('invalid_response');
  if (!live.alive) return { passed:false, livenessPassed:false, score:null, image:null };
  if (!Array.isArray(live.actions) || !live.actions.some(item => item.action === action) || typeof live.picture !== 'string' || !/^[a-z0-9+/=]+$/i.test(live.picture)) throw new Error('invalid_response');
  const image = `data:image/jpeg;base64,${live.picture}`;
  const liveBlob = await (await fetch(image)).blob();
  for (const blob of [referenceImage, liveBlob]) {
    const form = new FormData(); form.append('image_file', blob, blob.type === 'image/png' ? 'reference.png' : blob.type === 'image/bmp' ? 'reference.bmp' : 'face.jpg');
    const detected = await post('v2', 'face-detect', form);
    if (!Array.isArray(detected.faces)) throw new Error('invalid_response');
    if (detected.faces.length !== 1) throw new Error('face_count');
  }
  const form = new FormData();
  form.append('image1_file', referenceImage, referenceImage.type === 'image/png' ? 'reference.png' : referenceImage.type === 'image/bmp' ? 'reference.bmp' : 'reference.jpg'); form.append('image2_file', liveBlob, 'capture.jpg');
  const compared = await post('v2', 'face-compare', form);
  if (typeof compared.similarity !== 'number' || !Number.isFinite(compared.similarity) || compared.similarity < 0 || compared.similarity > 1) throw new Error('invalid_response');
  return { passed:compared.similarity > 0.93, livenessPassed:true, score:compared.similarity, image };
}
