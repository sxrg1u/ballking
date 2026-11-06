// Saving and loading via localStorage, plus export/import as text.
import { migrate } from './engine.js';

const KEY = 'ballking-save';

export function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; }
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? migrate(JSON.parse(raw)) : null;
  } catch { return null; }
}

export function wipe() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function exportSave(state) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

export function importSave(text) {
  try { return migrate(JSON.parse(decodeURIComponent(escape(atob(text.trim()))))); } catch { return null; }
}
