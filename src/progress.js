import { MODULES } from './data/modules.js';
const validIds = new Set(MODULES.flatMap(m => m.lessons.map(l => l.id)));
export function loadCompleted(storage) {
  try {
    const values = JSON.parse((storage || window.localStorage).getItem('tia_completed') || '[]');
    return new Set(Array.isArray(values) ? values.filter(id => validIds.has(id)) : []);
  } catch { return new Set(); }
}
export function saveCompleted(completed, storage) {
  try { (storage || window.localStorage).setItem('tia_completed', JSON.stringify([...completed])); return true; }
  catch { return false; }
}
