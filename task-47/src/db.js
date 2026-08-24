// Minimal promise-based IndexedDB wrapper for a single object store holding
// queued form submissions awaiting sync.

const DB_NAME = "offline-form-db";
const DB_VERSION = 1;
const STORE_NAME = "submissions";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addSubmission(entry) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(entry);
    tx.oncomplete = () => resolve(entry);
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateSubmission(id, patch) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const existing = getReq.result;
      if (!existing) return resolve(null);
      const updated = { ...existing, ...patch };
      store.put(updated);
      resolve(updated);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function removeSubmission(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllSubmissions() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result.sort((a, b) => a.createdAt - b.createdAt));
    req.onerror = () => reject(req.error);
  });
}
