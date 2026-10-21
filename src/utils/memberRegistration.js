// Mock registration archives retain the original upload rather than a preview URL.
// Live API responses may provide the same registrationMaterials object on a member.
import { isPocketBaseSyncEnabled, readPocketBaseValue, writePocketBaseValue } from '../services/pocketBaseSync.js';

function archiveTransaction(mode, run) {
  return new Promise((resolve, reject) => {
    const opening = indexedDB.open('rcm-member-registration', 1);
    opening.onupgradeneeded = () => opening.result.createObjectStore('archives', { keyPath: 'nationalId' });
    opening.onerror = () => reject(opening.error);
    opening.onsuccess = () => {
      const database = opening.result;
      const transaction = database.transaction('archives', mode);
      const request = run(transaction.objectStore('archives'));
      transaction.oncomplete = () => { database.close(); resolve(request.result); };
      transaction.onabort = transaction.onerror = () => { database.close(); reject(transaction.error); };
    };
  });
}

export function saveRegistrationArchive(archive) {
  if (!archive.nationalId) return Promise.reject(new Error('Missing national ID'));
  if (isPocketBaseSyncEnabled()) {
    return writePocketBaseValue(`rcm_registration_${archive.nationalId}`, archive);
  }
  return archiveTransaction('readwrite', store => store.put(archive));
}

export async function getRegistrationArchive(nationalId) {
  if (!nationalId) return Promise.resolve(null);
  if (isPocketBaseSyncEnabled()) {
    const remote = await readPocketBaseValue(`rcm_registration_${nationalId}`);
    if (remote) return remote;
    // Migrate this device's existing archive the first time it is requested.
    const local = await archiveTransaction('readonly', store => store.get(nationalId));
    if (local) await writePocketBaseValue(`rcm_registration_${nationalId}`, local);
    return local;
  }
  return archiveTransaction('readonly', store => store.get(nationalId));
}

export function readRegistrationImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function resolveMemberRegistration(member, family = {}, archive = null) {
  // A household paper card is shared; identity and face images are always personal.
  const stored = archive?.nationalId === member.nationalId ? archive : {};
  const materials = { ...stored, ...member.registrationMaterials };
  const identity = materials.identityInfo || member.identityInfo || {};
  return {
    identity: {
      name: identity.name || member.name,
      nationalId: identity.nationalId || member.nationalId,
      birthDate: identity.birthDate || member.birthDate,
      gender: identity.gender || member.gender,
      phone: identity.phone || member.phone,
      documentType: identity.documentType || member.documentType,
      documentNumber: identity.documentNumber || member.documentNumber || member.nationalId,
      issuingAuthority: identity.issuingAuthority || member.issuingAuthority,
      expiryDate: identity.expiryDate || member.documentExpiryDate
    },
    faceImage: materials.faceImage || member.faceImage || member.facePhoto || '',
    paperCardImage: materials.paperCardImage || member.paperCardImage || family.paperCardImage || '',
    identityFrontImage: materials.identityFrontImage || member.identityFrontImage || '',
    identityBackImage: materials.identityBackImage || member.identityBackImage || '',
    paperCardNo: materials.paperCardNo || family.oldPaperCardNo || '',
    registeredAt: materials.registeredAt || member.registeredAt || '',
    faceVerified: materials.biometricVerified ?? member.faceVerified ?? null,
    verifiedAt: materials.verifiedAt || member.faceVerifiedAt || ''
  };
}
