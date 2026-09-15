import React, { useState } from 'react';
import { getThemeVar } from '../styles/themeManager.js';

/**
 * In-diagram note editor for a table/group header. Writes the note into the
 * settings bracket (`note: '...'`) via a `sourceEdit` operation. Saving an empty
 * value removes the note.
 *
 * Props:
 *   position   { x, y }
 *   target     { kind: 'table'|'group', name }
 *   currentNote string
 *   onApply(ops)
 *   onClose()
 */
const NoteEditorPopover = ({ position, target, currentNote = '', onApply, onClose }) => {
  const [text, setText] = useState(currentNote || '');

  const save = () => {
    onApply([{ op: 'setNote', kind: target.kind, name: target.name, note: text }]);
    onClose();
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 10000 }}>
      <div
        onClick={stop}
        data-tooltip
        style={{
          position: 'absolute',
          left: Math.min(position.x, window.innerWidth - 300),
          top: Math.min(position.y, window.innerHeight - 200),
          width: '280px',
          background: getThemeVar('editorBackground'),
          color: getThemeVar('foreground'),
          border: `1px solid ${getThemeVar('panelBorder')}`,
          borderRadius: '6px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          padding: '10px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 'bold', opacity: 0.7, marginBottom: '6px' }}>
          Nota de {target.kind === 'group' ? 'grupo' : 'tabla'} · {target.name}
        </div>
        <textarea
          autoFocus
          value={text}
          placeholder="Escribe una nota…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) save();
          }}
          rows={4}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            resize: 'vertical',
            fontSize: '12px',
            fontFamily: 'inherit',
            padding: '6px',
            background: getThemeVar('inputBackground'),
            color: getThemeVar('inputForeground'),
            border: `1px solid ${getThemeVar('panelBorder')}`,
            borderRadius: '4px',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
          <button
            onClick={onClose}
            style={{
              fontSize: '11px',
              padding: '5px 10px',
              cursor: 'pointer',
              background: 'transparent',
              color: getThemeVar('foreground'),
              border: `1px solid ${getThemeVar('panelBorder')}`,
              borderRadius: '4px',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={save}
            style={{
              fontSize: '11px',
              padding: '5px 10px',
              cursor: 'pointer',
              background: getThemeVar('buttonBackground'),
              color: getThemeVar('buttonForeground'),
              border: 'none',
              borderRadius: '4px',
            }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditorPopover;
