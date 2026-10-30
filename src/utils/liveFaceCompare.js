// Vite's local development proxy is restricted to a single Huawei FRS endpoint.
export async function compareLiveFace({ token, projectId, referenceImage, video, action, fetchImpl = fetch, signal }) {
  if (!token?.trim() || !/^[a-f0-9]{32}$/i.test(projectId || '')) throw new Error('invalid_config');
  if (!(referenceImage instanceof Blob) || !['image/jpeg','image/png','image/bmp'].includes(referenceImage.type) || referenceImage.size > 8 * 1024 * 1024) throw new Error('invalid_image');
  if (!(video instanceof Blob) || !video.size || video.size > 8 * 1024 * 1024 || ![3,4].includes(action)) throw new Error('invalid_video');
  async function post(version, operation, body) {
    const response = await fetchImpl(`/__huawei_frs/${version}/${projectId}/${operation}`, { method:'POST', headers:{ 'X-Auth-Token': token.trim() }, body, signal });
    if (!response.ok) throw new Error(`http_${response.status}`);
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
    const form = new FormData(); form.append('image_file', blob, blob.type === 'image/png' ? 'reference.png' : 'face.jpg');
    const detected = await post('v2', 'face-detect', form);
    if (!Array.isArray(detected.faces)) throw new Error('invalid_response');
    if (detected.faces.length !== 1) throw new Error('face_count');
  }
  const form = new FormData();
  form.append('image1_file', referenceImage, 'reference'); form.append('image2_file', liveBlob, 'capture.jpg');
  const compared = await post('v2', 'face-compare', form);
  if (typeof compared.similarity !== 'number' || !Number.isFinite(compared.similarity) || compared.similarity < 0 || compared.similarity > 1) throw new Error('invalid_response');
  return { passed:compared.similarity > 0.93, livenessPassed:true, score:compared.similarity, image };
}
