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

export function identityPayloadChecks(data = {}) {
  return {
    images: isIdentityImage(data.identityFrontImage) && isIdentityImage(data.identityBackImage),
    chipRead: Boolean(data.readToken),
    liveness: isIdentityImage(data.faceImage) && data.livenessCompleted === true,
    chipMatch: chipMatchPassed(data.chipMatchScore)
  };
}
