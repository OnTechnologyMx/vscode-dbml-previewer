import React, { useState } from 'react';
import { getThemeVar } from '../styles/themeManager.js';
import { isValidHexColor } from '../utils/colorUtils.js';

/**
 * In-diagram color picker for a table/group header. Lists the declared
 * `$color` variables (assign on click, delete with ×), lets the user clear the
 * color, and create a new variable that is assigned immediately. All actions
 * emit `sourceEdit` operations via onApply and are written back to the .dbml.
 *
 * Props:
 *   position   { x, y }
 *   target     { kind: 'table'|'group', name }
 *   palette    Array<{ name, hex }>
 *   currentVar string|null  currently assigned variable name
 *   onApply(ops)            dispatch source-edit operations
 *   onClose()
 */
const ColorPickerPopover = ({ position, target, palette = [], currentVar, onApply, onClose }) => {
  const [newName, setNewName] = useState('');
  const [newHex, setNewHex] = useState('#3498DB');
  const [error, setError] = useState('');

  const apply = (ops, close = true) => {
    onApply(ops);
    if (close) onClose();
  };

  // Write the literal hex so the .dbml stays portable to other DBML readers.
  const assign = (hex) =>
    apply([{ op: 'setColor', kind: target.kind, name: target.name, value: hex }]);

  const clear = () =>
    apply([{ op: 'setColor', kind: target.kind, name: target.name, value: null }]);

  const deleteVar = (e, varName) => {
    e.stopPropagation();
    // Keep the popover open so the user can keep managing the palette.
    apply([{ op: 'deleteVariable', name: varName }], false);
  };

  const createAndAssign = () => {
    const name = newName.trim();
    if (!/^[\w-]+$/.test(name)) {
      setError('Nombre inválido (letras, números, _ o -).');
      return;
    }
    if (!isValidHexColor(newHex)) {
      setError('Color hex inválido (ej. #3498DB).');
      return;
    }
    apply([
      { op: 'addVariable', name, hex: newHex },
      { op: 'setColor', kind: target.kind, name: target.name, value: newHex },
    ]);
  };

  const stop = (e) => e.stopPropagation();

  const rowBase = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '5px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
      }}
    >
      <div
        onClick={stop}
        data-tooltip
        style={{
          position: 'absolute',
          left: Math.min(position.x, window.innerWidth - 250),
          top: Math.min(position.y, window.innerHeight - 320),
          width: '230px',
          maxHeight: '320px',
          overflowY: 'auto',
          background: getThemeVar('editorBackground'),
          color: getThemeVar('foreground'),
          border: `1px solid ${getThemeVar('panelBorder')}`,
          borderRadius: '6px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          padding: '8px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 'bold', opacity: 0.7, marginBottom: '6px' }}>
          Color de {target.kind === 'group' ? 'grupo' : 'tabla'} · {target.name}
        </div>

        {palette.length === 0 && (
          <div style={{ fontSize: '11px', opacity: 0.6, padding: '4px 8px' }}>
            No hay variables de color. Crea una abajo.
          </div>
        )}

        {palette.map((c) => {
          const active = c.name === currentVar;
          return (
            <div
              key={c.name}
              onClick={() => assign(c.hex)}
              style={{
                ...rowBase,
                background: active ? getThemeVar('buttonBackground') : 'transparent',
                color: active ? getThemeVar('buttonForeground') : getThemeVar('foreground'),
              }}
              title={`Asignar $${c.name} (${c.hex})`}
            >
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '3px',
                  background: c.hex,
                  border: `1px solid ${getThemeVar('panelBorder')}`,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                ${c.name}
              </span>
              {active && <span style={{ fontSize: '11px' }}>✓</span>}
              <span
                onClick={(e) => deleteVar(e, c.name)}
                title={`Borrar variable $${c.name}`}
                style={{
                  fontSize: '14px',
                  lineHeight: 1,
                  padding: '0 2px',
                  opacity: 0.6,
                  cursor: 'pointer',
                }}
              >
                ×
              </span>
            </div>
          );
        })}

        <div
          onClick={clear}
          style={{ ...rowBase, opacity: 0.8, marginTop: '2px' }}
          title="Quitar el color de este encabezado"
        >
          <span
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '3px',
              border: `1px dashed ${getThemeVar('panelBorder')}`,
              flexShrink: 0,
            }}
          />
          <span>Sin color</span>
        </div>

        <div style={{ borderTop: `1px solid ${getThemeVar('panelBorder')}`, margin: '8px 0', paddingTop: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', opacity: 0.7, marginBottom: '6px' }}>
            Nueva variable
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="color"
              value={isValidHexColor(newHex) ? newHex : '#3498DB'}
              onChange={(e) => { setNewHex(e.target.value); setError(''); }}
              style={{ width: '28px', height: '28px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={newName}
              placeholder="nombre"
              onChange={(e) => { setNewName(e.target.value); setError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') createAndAssign(); }}
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: '12px',
                padding: '4px 6px',
                background: getThemeVar('inputBackground'),
                color: getThemeVar('inputForeground'),
                border: `1px solid ${getThemeVar('panelBorder')}`,
                borderRadius: '4px',
              }}
            />
          </div>
          {error && <div style={{ color: '#e74c3c', fontSize: '10px', marginTop: '4px' }}>{error}</div>}
          <button
            onClick={createAndAssign}
            style={{
              marginTop: '6px',
              width: '100%',
              fontSize: '11px',
              padding: '5px',
              cursor: 'pointer',
              background: getThemeVar('buttonBackground'),
              color: getThemeVar('buttonForeground'),
              border: 'none',
              borderRadius: '4px',
            }}
          >
            Crear y asignar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerPopover;
