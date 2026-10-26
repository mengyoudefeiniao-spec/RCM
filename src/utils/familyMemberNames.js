const clone = value => JSON.parse(JSON.stringify(value));
const identity = member => member?.nationalId ? `national:${member.nationalId}` : member?.id ? `member:${member.id}` : null;
export const familyLanguage = language => language === 'ckb' ? 'ku' : language;

// Only known demonstration names can be repaired automatically. Registered names remain verbatim.
export function createDemoFamilyNameLocalizer(catalogues) {
  const families = new Map();
  for (const [language, entries] of Object.entries(catalogues)) {
    for (const family of entries) {
      if (!families.has(family.rationCardNo)) families.set(family.rationCardNo, new Map());
      const members = families.get(family.rationCardNo);
      for (const member of family.members || []) {
        if (!member.nationalId) continue;
        const key = identity(member);
        if (!members.has(key)) members.set(key, { names: {}, aliases: new Set() });
        const record = members.get(key);
        record.names[familyLanguage(language)] = member.name;
        record.aliases.add(member.name);
      }
    }
  }

  return (family, language) => {
    const catalogue = families.get(family?.rationCardNo);
    if (!catalogue) return family;
    const translate = (name, record) => record?.aliases.has(name)
      ? record.names[familyLanguage(language)] || record.names.en || name : name;
    let changed = false;
    const members = (family.members || []).map(member => {
      if (!member || typeof member !== 'object') return member;
      const name = translate(member.name, catalogue.get(identity(member)));
      if (name === member.name) return member;
      changed = true;
      return { ...member, name };
    });
    const head = [...catalogue.values()].find(record => record.aliases.has(family.headName));
    const headName = translate(family.headName, head);
    return changed || headName !== family.headName ? { ...family, members, headName } : family;
  };
}

// Share member edits by identity without copying one locale's unchanged names over other locales.
export function mergeFamilyUpdate(target, updates, source) {
  const next = { ...target, ...clone(updates) };
  if (Array.isArray(updates.members)) {
    const sourceMembers = new Map((source?.members || []).map(member => [identity(member), member]));
    const targetMembers = new Map((target.members || []).map(member => [identity(member), member]));
    next.members = next.members.map(member => {
      const key = identity(member);
      const original = key && sourceMembers.get(key);
      const localized = key && targetMembers.get(key);
      return original && localized && member.name === original.name
        ? { ...member, name: localized.name } : member;
    });
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'headName')) {
    const head = updates.members?.find(member => member.name === updates.headName);
    const localizedHead = head && identity(head) && next.members?.find(member => identity(member) === identity(head));
    if (localizedHead) next.headName = localizedHead.name;
    else if (updates.headName === source?.headName) next.headName = target.headName;
  }
  return next;
}
