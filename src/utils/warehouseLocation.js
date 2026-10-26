export function warehousePosition(center) {
  // Only warehouse coordinates are accepted; an outlet address/GPS is a different destination.
  const location = center?.warehouseLocation || center?.warehouseCoords;
  if (!location) return null;
  const latValue = location.lat ?? location.latitude;
  const lngValue = location.lng ?? location.longitude;
  if (!['number', 'string'].includes(typeof latValue) || !['number', 'string'].includes(typeof lngValue)) return null;
  if (latValue == null || lngValue == null || String(latValue).trim() === '' || String(lngValue).trim() === '') return null;
  const lat = Number(latValue), lng = Number(lngValue);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng, source: location.source === 'demo' ? 'demo' : 'record' };
}

export function warehouseNavigationUrl(destination, origin = null) {
  if (!destination) return '';
  const query = new URLSearchParams({ api: '1', destination: `${destination.lat},${destination.lng}`, travelmode: 'driving' });
  if (origin) query.set('origin', `${origin.lat},${origin.lng}`);
  return `https://www.google.com/maps/dir/?${query}`;
}
