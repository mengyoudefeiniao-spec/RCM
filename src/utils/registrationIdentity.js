// Identity-document helpers shared by the registration wizard and the demo API.
export const IDENTITY_IMAGE_MAX_CHARS = 2_400_000;
export const CHIP_MATCH_THRESHOLD = 0.8;

export function isIdentityImage(value, maxChars = IDENTITY_IMAGE_MAX_CHARS) {
  return typeof value === 'string' && value.startsWith('data:image/') &&
    value.length > 64 && value.length <= maxChars;
}

// Every registration identity step must be completed independently; the chip
// reading is also tied to the national ID typed into the form.
export function identityStepCompletion({ frontImage, backImage, chipRead, liveness, nationalId } = {}) {
  return {
    front: isIdentityImage(frontImage),
    back: isIdentityImage(backImage),
    chip: Boolean(chipRead?.readToken) && (!nationalId || chipRead?.nationalId === nationalId),
    liveness: isIdentityImage(liveness?.image)
  };
}

export function isIdentityComplete(state) {
  return Object.values(identityStepCompletion(state)).every(Boolean);
}

export function missingIdentitySteps(state) {
  return Object.entries(identityStepCompletion(state))
    .filter(([, complete]) => !complete)
    .map(([step]) => step);
}

export function chipMatchPassed(score) {
  const value = Number(score);
  return Number.isFinite(value) && value >= CHIP_MATCH_THRESHOLD;
}

// Shared upload helpers: both registration wizards read, downscale and re-wrap
// identity photos before sending them to the demo API.
export function readPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Photos are downscaled before upload so the shared archive record stays small.
export function compressPhoto(dataUrl, maxSize = 1600, quality = 0.82) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext('2d');
      if (!context) return resolve(dataUrl);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      try { resolve(canvas.toDataURL('image/jpeg', quality)); }
      catch { resolve(dataUrl); }
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

export async function dataUrlToFile(dataUrl, name) {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], name, { type: blob.type || 'image/jpeg' });
}

export function identityPayloadChecks(data = {}) {
  return {
    images: isIdentityImage(data.identityFrontImage) && isIdentityImage(data.identityBackImage),
    chipRead: Boolean(data.readToken),
    liveness: isIdentityImage(data.faceImage) && data.livenessCompleted === true,
    chipMatch: chipMatchPassed(data.chipMatchScore)
  };
}
