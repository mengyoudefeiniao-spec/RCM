function base64Of(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('invalid_file'));
    reader.readAsDataURL(blob);
  });
}
export async function callLocalTencent({ credentials, action, params, signal, fetchImpl = fetch }) {
  if (!credentials?.secretId?.trim() || !credentials?.secretKey?.trim()) throw new Error('invalid_credentials');
  const response = await fetchImpl('/__tencent_face/', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...credentials, action, params }), signal });
  if (!response.ok) {
    let data;
    try { data = await response.json(); } catch { data = null; }
    const code = typeof data?.error === 'string' && /^[A-Za-z][A-Za-z0-9._]{0,79}$/.test(data.error) ? data.error : 'request_failed';
    const error = new Error(code);
    if (typeof data?.requestId === 'string' && /^[a-f0-9-]{1,64}$/i.test(data.requestId)) error.requestId = data.requestId;
    throw error;
  }
  return response.json();
}
export async function getActionSequence({ credentials, signal, fetchImpl }) {
  const data = await callLocalTencent({ credentials, action:'GetActionSequence', params:{}, signal, fetchImpl });
  if (!/^(1,2|2,1)$/.test(data.ActionSequence || '')) throw new Error('invalid_response');
  return data.ActionSequence;
}
export async function compareLiveFace({ credentials, referenceImage, video, sequence, signal, fetchImpl }) {
  if (!(referenceImage instanceof Blob) || !['image/jpeg','image/png'].includes(referenceImage.type) || !referenceImage.size || referenceImage.size > 2 * 1024 * 1024) throw new Error('invalid_image');
  if (!(video instanceof Blob) || !video.type.startsWith('video/mp4') || !video.size || video.size > 5 * 1024 * 1024 || !/^(1,2|2,1)$/.test(sequence || '')) throw new Error('invalid_video');
  const [reference, recording] = await Promise.all([base64Of(referenceImage), base64Of(video)]);
  if (reference.length > 3 * 1024 * 1024 || recording.length > 8 * 1024 * 1024) throw new Error('invalid_file');
  const detect = async image => {
    const response = await callLocalTencent({ credentials, action:'DetectFace', params:{ Image:image, MaxFaceNum:2 }, signal, fetchImpl });
    if (!Array.isArray(response.FaceInfos)) throw new Error('invalid_response');
    if (response.FaceInfos.length !== 1) throw new Error('face_count');
  };
  await detect(reference);
  const result = await callLocalTencent({ credentials, action:'LivenessCompare', params:{ LivenessType:'ACTION', ValidateData:sequence, ImageBase64:reference, VideoBase64:recording }, signal, fetchImpl });
  if (result.Result !== 'Success') return { passed:false, image:null, score:null };
  if (typeof result.Sim !== 'number' || !Number.isFinite(result.Sim) || result.Sim < 0 || result.Sim > 100 || typeof result.BestFrameBase64 !== 'string' || !/^[a-z0-9+/=]+$/i.test(result.BestFrameBase64)) throw new Error('invalid_response');
  await detect(result.BestFrameBase64);
  return { passed:result.Sim >= 70, score:result.Sim, image:`data:image/jpeg;base64,${result.BestFrameBase64}` };
}
