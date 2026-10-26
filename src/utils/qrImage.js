import { BrowserQRCodeReader } from '@zxing/browser';

export const MAX_QR_IMAGE_BYTES = 10 * 1024 * 1024;
const acceptedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const imageError = code => Object.assign(new Error(code), { code });
const checkAborted = signal => { if (signal?.aborted) throw imageError('aborted'); };

function loadImage(url, signal) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    const cleanup = () => {
      clearTimeout(timeout);
      image.onload = image.onerror = null;
      signal?.removeEventListener('abort', abort);
    };
    const fail = code => { cleanup(); image.removeAttribute('src'); reject(imageError(code)); };
    const abort = () => fail('aborted');
    const timeout = setTimeout(() => fail('invalid-image'), 15000);
    image.onload = () => { cleanup(); resolve(image); };
    image.onerror = () => fail('invalid-image');
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) { abort(); return; }
    image.src = url;
  });
}

// Read the selected photo locally. Only the decoded voucher is sent to the
// existing order lookup; the image is never uploaded to business storage.
export async function decodeQrImage(file, { signal } = {}) {
  checkAborted(signal);
  const type = String(file?.type || '').toLowerCase();
  if (!file || !file.size || (type ? !acceptedTypes.has(type) : !/\.(jpe?g|png|webp)$/i.test(file.name || ''))) throw imageError('invalid-image');
  if (file.size > MAX_QR_IMAGE_BYTES) throw imageError('image-too-large');

  const url = URL.createObjectURL(file);
  let image;
  let canvas;
  try {
    image = await loadImage(url, signal);
    checkAborted(signal);
    const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
    if (!longestSide) throw imageError('invalid-image');
    canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw imageError('invalid-image');
    const reader = new BrowserQRCodeReader();
    // Screenshots and phone photos benefit from different sampling scales.
    // Bound each canvas to keep decoding memory reasonable on mobile devices.
    const sizes = [...new Set([2048, 4096, 1024].map(size => Math.min(size, longestSide)))];
    for (const size of sizes) {
      await new Promise(resolve => setTimeout(resolve, 0));
      checkAborted(signal);
      const scale = size / longestSide;
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.globalCompositeOperation = 'source-over';
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (let inverted = 0; inverted < 2; inverted += 1) {
        if (inverted) {
          context.globalCompositeOperation = 'difference';
          context.fillStyle = '#fff';
          context.fillRect(0, 0, canvas.width, canvas.height);
        }
        try {
          const text = reader.decodeFromCanvas(canvas).getText();
          if (text?.trim()) { checkAborted(signal); return text; }
        } catch (error) {
          if (error.code === 'aborted') throw error;
        }
      }
    }
    throw imageError('no-qr');
  } finally {
    image?.removeAttribute('src');
    if (canvas) { canvas.width = 0; canvas.height = 0; }
    URL.revokeObjectURL(url);
  }
}
