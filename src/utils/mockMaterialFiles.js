// The mock gateway retains actual uploaded bytes locally, keyed by notification.
export function saveMockMaterial(role, notificationId, file) {
  return new Promise((resolve, reject) => {
    const opening = indexedDB.open('rcm-material-uploads', 1);
    opening.onupgradeneeded = () => opening.result.createObjectStore('files', { keyPath: 'id' });
    opening.onerror = () => reject(opening.error);
    opening.onsuccess = () => {
      const database = opening.result;
      const transaction = database.transaction('files', 'readwrite');
      const id = `${role}:${notificationId}:${crypto.randomUUID()}`;
      transaction.objectStore('files').put({ id, file, uploadedAt: new Date().toISOString() });
      transaction.oncomplete = () => { database.close(); resolve(id); };
      transaction.onerror = () => { database.close(); reject(transaction.error); };
    };
  });
}
