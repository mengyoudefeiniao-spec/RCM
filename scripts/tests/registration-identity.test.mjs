import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHIP_MATCH_THRESHOLD,
  identityPayloadChecks,
  identityStepCompletion,
  isIdentityComplete,
  isIdentityImage,
  missingIdentitySteps,
  chipMatchPassed
} from '../../src/utils/registrationIdentity.js';

const image = 'data:image/jpeg;base64,' + 'A'.repeat(120);
const chipRead = { readToken: 'tok-1', nationalId: '198004198271' };
const liveness = { image };

test('identity images must be non-trivial image data URLs', () => {
  assert.equal(isIdentityImage(image), true);
  assert.equal(isIdentityImage('https://example.test/id.jpg'), false);
  assert.equal(isIdentityImage('data:image/jpeg;base64,short'), false);
  assert.equal(isIdentityImage(''), false);
  assert.equal(isIdentityImage(undefined), false);
  assert.equal(isIdentityImage('data:image/jpeg;base64,' + 'A'.repeat(10), 5), false);
});

test('all four identity steps must pass before registration can finish', () => {
  const complete = identityStepCompletion({ frontImage: image, backImage: image, chipRead, liveness, nationalId: '198004198271' });
  assert.deepEqual(complete, { front: true, back: true, chip: true, liveness: true });
  assert.equal(isIdentityComplete({ frontImage: image, backImage: image, chipRead, liveness }), true);
  assert.deepEqual(missingIdentitySteps({ frontImage: image, backImage: '', chipRead: null, liveness, nationalId: '198004198271' }), ['back', 'chip']);
});

test('the chip reading is bound to the national ID on the form', () => {
  const state = { frontImage: image, backImage: image, chipRead, liveness, nationalId: '200001010001' };
  assert.equal(identityStepCompletion(state).chip, false);
  assert.equal(isIdentityComplete(state), false);
  assert.deepEqual(missingIdentitySteps(state), ['chip']);
});

test('the live face must match the chip portrait within the threshold', () => {
  assert.equal(CHIP_MATCH_THRESHOLD, 0.8);
  assert.equal(chipMatchPassed(0.99), true);
  assert.equal(chipMatchPassed(0.8), true);
  assert.equal(chipMatchPassed(0.79), false);
  assert.equal(chipMatchPassed(undefined), false);
  assert.equal(chipMatchPassed('0.95'), true);
});

test('server-side payload checks reject incomplete identity payloads', () => {
  assert.deepEqual(identityPayloadChecks({ identityFrontImage: image, identityBackImage: image, readToken: 'tok-1', faceImage: image, livenessCompleted: true, chipMatchScore: 0.99 }), { images: true, chipRead: true, liveness: true, chipMatch: true });
  assert.deepEqual(identityPayloadChecks({ identityFrontImage: image, identityBackImage: '', faceImage: '', chipMatchScore: 0.4 }), { images: false, chipRead: false, liveness: false, chipMatch: false });
});
