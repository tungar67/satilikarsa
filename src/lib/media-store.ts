const DB = "gencel-media";
const STORE = "clips";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = work(tx.objectStore(STORE));
        req.onsuccess = () => {
          resolve(req.result);
          db.close();
        };
        req.onerror = () => {
          reject(req.error);
          db.close();
        };
      }),
  );
}

export function putClip(id: string, blob: Blob) {
  return run("readwrite", (store) => store.put(blob, id)).then(() => undefined);
}

export function getClip(id: string) {
  return run<Blob | undefined>("readonly", (store) => store.get(id));
}

export function deleteClip(id: string) {
  return run("readwrite", (store) => store.delete(id)).then(() => undefined);
}

export function clearClips() {
  if (typeof indexedDB === "undefined") return Promise.resolve();
  return run("readwrite", (store) => store.clear()).then(() => undefined);
}
