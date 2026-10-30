export async function compareLiveFace({ token, referenceImage, liveImage, fetchImpl = fetch }) {
  const toBase64 = value => {
    const match = /^data:image\/(?:jpeg|png|webp);base64,([a-z0-9+/=]+)$/i.exec(value || '');
    if (!match) throw new Error('invalid_image');
    return match[1];
  };
  if (!token?.trim()) throw new Error('missing_token');
  const response = await fetchImpl('https://api.verifik.co/v2/face-recognition/compare-live', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.trim()}` },
    body: JSON.stringify({ probe: toBase64(liveImage), gallery: [toBase64(referenceImage)], os: 'DESKTOP', search_mode: 'ACCURATE', liveness_min_score: 0.65, compare_min_score: 0.8 }),
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error(`http_${response.status}`);
  const data = (await response.json())?.data;
  if (typeof data?.score !== 'number' || !Number.isFinite(data.score) || data.score < 0 || data.score > 1 || typeof data?.liveness?.passed !== 'boolean') throw new Error('invalid_response');
  return { passed: data.liveness.passed && data.score >= 0.8, score: data.score, livenessPassed: data.liveness.passed };
}
