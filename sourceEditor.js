'use strict';

/**
 * DBML source editor
 * ------------------
 * Pure string transforms used by the extension host to write diagram-driven
 * edits back into the user's `.dbml` file: assigning a color variable, setting
 * a note, and creating/deleting `// @color` palette variables.
 *
 * Everything is applied to the settings bracket `[ ... ]` that sits between a
 * `Table`/`TableGroup` name and its `{` body (both `headercolor`/`color` and
 * `note` are valid there), so the body is never touched. If a declaration can't
 * be located the transform is a safe no-op (returns the text unchanged) rather
 * than risk corrupting the file.
 */

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Split the inner text of a settings bracket on top-level commas, ignoring
 * commas inside '...', "..." or `...` quoted spans.
 * @param {string} inner
 * @returns {string[]} trimmed, non-empty settings
 */
const splitSettings = (inner) => {
  const parts = [];
  let cur = '';
  let quote = null;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (quote) {
      cur += ch;
      if (ch === quote && inner[i - 1] !== '\\') quote = null;
    } else if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      cur += ch;
    } else if (ch === ',') {
      parts.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  return parts.map((s) => s.trim()).filter((s) => s.length > 0);
};

/** Return the lowercased key of a `key: value` setting, or null if unkeyed. */
const settingKey = (part) => {
  const m = part.match(/^([\w-]+)\s*:/);
  return m ? m[1].toLowerCase() : null;
};

/**
 * Set (or remove) a keyed setting in a settings-bracket inner string.
 * @param {string} inner  existing inner text ('' if no bracket)
 * @param {string} key    e.g. 'headercolor', 'color', 'note'
 * @param {string|null} rawValue  already-formatted value, or null to remove
 * @returns {string} new inner text ('' if the bracket becomes empty)
 */
const upsertSetting = (inner, key, rawValue) => {
  const lowerKey = key.toLowerCase();
  const kept = (inner ? splitSettings(inner) : []).filter(
    (p) => settingKey(p) !== lowerKey
  );
  if (rawValue !== null && rawValue !== undefined) {
    kept.push(`${key}: ${rawValue}`);
  }
  return kept.join(', ');
};

/**
 * Locate `keyword name [settings] {` and rewrite its settings bracket with the
 * given key set/removed. Matches optional schema prefix and optional quotes
 * around the name. Case-insensitive on the keyword only.
 * @returns {string} new text, or the original if the declaration isn't found
 */
const editDeclarationSetting = (text, keyword, name, key, rawValue) => {
  const nameEsc = escapeRegExp(name);
  const re = new RegExp(
    `(\\b${keyword}\\s+(?:"[^"]*"\\.|[\\w$]+\\.)?"?${nameEsc}"?[ \\t]*)(\\[[^\\]]*\\])?([ \\t]*\\{)`,
    'i'
  );
  const m = re.exec(text);
  if (!m) return text;

  const before = m[1].replace(/[ \t]*$/, '');
  const inner = m[2] ? m[2].slice(1, -1) : '';

  const newInner = upsertSetting(inner, key, rawValue);
  const newBracket = newInner ? `[${newInner}]` : '';
  // Rejoin with single spaces so the result is always `name [settings] {`
  // (or `name {` when no settings remain), regardless of original spacing.
  const replacement = [before, newBracket].filter(Boolean).join(' ') + ' {';

  return text.slice(0, m.index) + replacement + text.slice(m.index + m[0].length);
};

/** Format a note string as a single-line, single-quoted DBML string literal. */
const quoteNote = (note) =>
  `'${String(note)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, ' ')
    .trim()}'`;

/** Insert a new `// @color name #hex` line, or update the value if it exists. */
const addColorVariable = (text, name, hex) => {
  const nameEsc = escapeRegExp(name);
  const existing = new RegExp(
    `(^[ \\t]*//[ \\t]*@color[ \\t]+${nameEsc}[ \\t]+)#(?:[0-9a-fA-F]{3}){1,2}\\b`,
    'm'
  );
  if (existing.test(text)) {
    return text.replace(existing, `$1${hex}`);
  }

  const line = `// @color ${name} ${hex}`;
  const lines = text.split('\n');
  let insertAt = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^[ \t]*\/\/[ \t]*@color\b/.test(lines[i])) insertAt = i + 1;
  }
  lines.splice(insertAt, 0, line);
  return lines.join('\n');
};

/** Remove a `// @color name #hex` declaration line entirely. */
const deleteColorVariable = (text, name) => {
  const re = new RegExp(
    `^[ \\t]*//[ \\t]*@color[ \\t]+${escapeRegExp(name)}[ \\t]+#(?:[0-9a-fA-F]{3}){1,2}\\b[ \\t]*\\r?\\n?`,
    'm'
  );
  return text.replace(re, '');
};

/**
 * Apply a single operation to the DBML text.
 * Ops:
 *   { op: 'setColor', kind: 'table'|'group', name, varName|null }
 *   { op: 'setNote',  kind: 'table'|'group', name, note|null }
 *   { op: 'addVariable', name, hex }
 *   { op: 'deleteVariable', name }
 */
const applyOp = (text, op) => {
  switch (op && op.op) {
    case 'setColor': {
      const keyword = op.kind === 'group' ? 'TableGroup' : 'Table';
      const key = op.kind === 'group' ? 'color' : 'headercolor';
      // Write the literal hex (op.value) so the .dbml stays standard and portable
      // to other readers; `// @color` swatches are just a picker convenience.
      // (op.varName is still accepted for backward compatibility.)
      const value = op.value ? op.value : (op.varName ? `$${op.varName}` : null);
      return editDeclarationSetting(text, keyword, op.name, key, value);
    }
    case 'setNote': {
      const keyword = op.kind === 'group' ? 'TableGroup' : 'Table';
      const value = op.note && op.note.trim() ? quoteNote(op.note) : null;
      return editDeclarationSetting(text, keyword, op.name, 'note', value);
    }
    case 'addVariable':
      return addColorVariable(text, op.name, op.hex);
    case 'deleteVariable':
      return deleteColorVariable(text, op.name);
    default:
      return text;
  }
};

/** Apply an ordered list of operations, returning the resulting text. */
const applyOps = (text, ops) =>
  (Array.isArray(ops) ? ops : []).reduce((acc, op) => applyOp(acc, op), text);

module.exports = {
  applyOp,
  applyOps,
  // exported for tests
  editDeclarationSetting,
  addColorVariable,
  deleteColorVariable,
  splitSettings,
  quoteNote,
};
