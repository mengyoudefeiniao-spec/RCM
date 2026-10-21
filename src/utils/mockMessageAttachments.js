import { isPocketBaseSyncEnabled, readPocketBaseFile, savePocketBaseFile } from '../services/pocketBaseSync.js';

function openMessageAttachmentDb() {
  return new Promise((resolve, reject) => {
    const opening = indexedDB.open('rcm-message-attachments', 1);
    opening.onupgradeneeded = () => opening.result.createObjectStore('files', { keyPath: 'id' });
    opening.onerror = () => reject(opening.error);
    opening.onsuccess = () => resolve(opening.result);
  });
}

export async function saveMockMessageAttachment(file) {
  const id = `mail-file-${crypto.randomUUID()}`;
  if (isPocketBaseSyncEnabled()) {
    await savePocketBaseFile(id, file);
    return id;
  }
  const database = await openMessageAttachmentDb();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction('files', 'readwrite');
    transaction.objectStore('files').put({ id, file });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
  return id;
}

export async function getMockMessageAttachment(id) {
  if (isPocketBaseSyncEnabled()) {
    const remote = await readPocketBaseFile(id);
    if (remote) {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(remote.blob);
      });
      return { name: remote.record.file, dataUrl };
    }
  }
  const database = await openMessageAttachmentDb();
  const file = await new Promise((resolve, reject) => {
    const request = database.transaction('files', 'readonly').objectStore('files').get(id);
    request.onsuccess = () => resolve(request.result?.file || null);
    request.onerror = () => reject(request.error);
  });
  database.close();
  if (!file) return null;
  if (isPocketBaseSyncEnabled()) {
    await savePocketBaseFile(id, file);
  }
  const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  return { name: file.name, dataUrl };
}
