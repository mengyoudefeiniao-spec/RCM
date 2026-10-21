import { useI18n } from 'vue-i18n';
import { warehouseTerms, warehouseDetailMessages } from '../locales/warehouseDetails.js';
import { warehouseEntityAliases } from '../locales/warehouseEntities.js';

const normalize = (value) => String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
const aliases = new Map();
for (const [key, forms] of Object.entries(warehouseTerms)) {
  for (const form of forms) if (form) aliases.set(normalize(form), key);
}
for (const [source, key] of Object.entries(warehouseEntityAliases)) if (!aliases.has(normalize(source))) aliases.set(normalize(source), key);
const registered = new WeakSet();

// Translate display labels only; API identifiers and filter values stay unchanged.
export function useWarehouseI18n() {
  const composer = useI18n({ useScope: 'global' });
  if (!registered.has(composer)) {
    for (const [lang, messages] of Object.entries(warehouseDetailMessages)) composer.mergeLocaleMessage(lang, messages);
    registered.add(composer);
  }
  const w = (source, params = {}) => {
    const key = aliases.get(normalize(source));
    return key ? composer.t(`warehouseDetails.${key}`, params) : (source ?? '');
  };
  const sameLabel = (left, right) => {
    const a = normalize(left), b = normalize(right);
    return a === b || (aliases.has(a) && aliases.get(a) === aliases.get(b));
  };
  return { w, sameLabel };
}
