// Web (and static rendering): browser localStorage when it exists, memory otherwise.
const memory = new Map<string, string>();
const ls = typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;

export const kv = {
  get: (k: string) => (ls ? ls.getItem(k) : memory.get(k) ?? null),
  set: (k: string, v: string) => (ls ? ls.setItem(k, v) : void memory.set(k, v)),
  remove: (k: string) => (ls ? ls.removeItem(k) : void memory.delete(k)),
};

export const authStorage = {
  getItem: (k: string) => kv.get(k),
  setItem: (k: string, v: string) => kv.set(k, v),
  removeItem: (k: string) => kv.remove(k),
};
