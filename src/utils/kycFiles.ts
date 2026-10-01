// File bytes for the local portal. Metadata continues to use the existing KYC store.
function openFiles(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('stocketics-kyc-files', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveKYCFile(file: File): Promise<string> {
  if (!/\.(pdf|jpe?g|png)$/i.test(file.name) || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
    throw new Error('Choose a PDF, JPG or PNG document.');
  }
  if (!file.size || file.size > 10 * 1024 * 1024) throw new Error('Choose a non-empty file under 10 MB.');
  const db = await openFiles();
  const id = `kyc-file-${crypto.randomUUID()}`;
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      tx.objectStore('files').add(file, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    return id;
  } finally { db.close(); }
}

export async function downloadKYCFile(id?: string): Promise<void> {
  if (!id) throw new Error('No saved file is available. Please attach the document again.');
  const db = await openFiles();
  try {
    const file = await new Promise<File | undefined>((resolve, reject) => {
      const request = db.transaction('files').objectStore('files').get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (!file) throw new Error('This document is not saved in this browser. Please attach it again.');
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url; link.download = file.name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  } finally { db.close(); }
}
