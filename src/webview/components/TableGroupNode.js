import React, { useState, useContext } from 'react';
import { getThemeVar } from '../styles/themeManager.js';
import { parseHeaderColor, getContrastColor } from '../utils/colorUtils.js';
import { DiagramActionsContext } from '../diagramActionsContext.js';
import { PaletteIcon, NoteIconButton, headerIconButtonStyle } from './HeaderIcons.js';

const TableGroupNode = ({ data, selected }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { tableGroup, tables } = data;
  const { palette, openColorPicker, openNoteEditor } = useContext(DiagramActionsContext);

  if (!tableGroup) {
    return null;
  }

  // Determine group colors
  const customGroupColor = parseHeaderColor(tableGroup.color);
  const groupBackgroundColor = customGroupColor || getThemeVar('buttonBackground');
  const groupTextColor = customGroupColor
    ? getContrastColor(customGroupColor)
    : getThemeVar('buttonForeground');

  const currentVar = (palette.find(
    (p) => (p.hex || '').toLowerCase() === (tableGroup.color || '').toLowerCase()
  ) || {}).name || null;

  const handleOpenColor = (e) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    openColorPicker({ kind: 'group', name: tableGroup.name, currentVar, position: { x: r.left, y: r.bottom + 6 } });
  };
  const handleOpenNote = (e) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    openNoteEditor({ kind: 'group', name: tableGroup.name, currentNote: tableGroup.note || '', position: { x: r.left, y: r.bottom + 6 } });
  };

  const groupStyle = {
    boxSizing: 'border-box',
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: selected
      ? `color-mix(in srgb, ${groupBackgroundColor} 20%, transparent)`
      : isHovered
        ? `color-mix(in srgb, ${groupBackgroundColor} 15%, transparent)`
        : `color-mix(in srgb, ${groupBackgroundColor} 10%, transparent)`,
    border: `2px solid ${groupBackgroundColor}`,
    borderRadius: '8px',
    zIndex: -1,
    transition: 'all 0.2s ease-in-out',
    cursor: 'default',
  };

  const titleStyle = {
    boxSizing: 'border-box',
    position: 'absolute',
    top: '0',
    left: '0',
    transform: 'translate(0, -120%)',
    backgroundColor: groupBackgroundColor,
    color: groupTextColor,
    padding: '16px 12px',
    border: `2px solid ${groupBackgroundColor}`,
    fontSize: '14px',
    fontWeight: 'bold',
    borderRadius: '8px',
    border: 'none',
    width: '100%',
    cursor: 'move',
  };

  const noteStyle = {
    boxSizing: 'border-box',
    color: groupTextColor,
    marginTop: '10px',
    fontSize: '9px',
    fontStyle: 'italic',
    fontWeight: 'normal',
    border: 'none',
    overflow: 'hidden',
  };

  return (
    <div
      style={groupStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={titleStyle} className="dbml-group-drag">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tableGroup.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
            <NoteIconButton note={tableGroup.note} color={groupTextColor} onClick={handleOpenNote} />
            <button
              onClick={handleOpenColor}
              className="nodrag"
              style={headerIconButtonStyle(groupTextColor)}
              title="Color del grupo"
            >
              <PaletteIcon />
            </button>
          </div>
        </div>
        {tableGroup.note && (
          <div style={noteStyle}>
            {tableGroup.note}
          </div>
        )}
      </div>

    </div>
  );
};

export default TableGroupNode;