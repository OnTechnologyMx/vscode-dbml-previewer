import React, { useContext } from 'react';
import { getThemeVar } from '../styles/themeManager.js';
import { parseHeaderColor, getContrastColor } from '../utils/colorUtils.js';
import { DiagramActionsContext } from '../diagramActionsContext.js';
import { PaletteIcon, NoteIconButton, headerIconButtonStyle } from './HeaderIcons.js';

const TableHeaderNode = ({ data }) => {
  const {
    table,
    columnCount = 0,
    tableWidth = 200,
    hasMultipleSchema = false,
    onTableChecksClick,
    onTableIndexesClick,
  } = data;

  const { palette, openColorPicker, openNoteEditor } = useContext(DiagramActionsContext);
  const checks = table.checks || [];
  const indexes = table.indexes || [];

  // Calculate dimensions based on content
  const headerHeight = 42; // Header section height
  const columnHeight = 30; // Height per column
  const tablePadding = 8; // Padding around column area
  // Fixed-height footer for the "View Checks" button when checks are present
  const checksFooterHeight = checks.length > 0 ? 32 : 0;
  // Fixed-height footer for the "View Indexes" button when indexes are present
  const indexesFooterHeight = indexes.length > 0 ? 32 : 0;
  const totalHeight = headerHeight + (columnCount * columnHeight) + (tablePadding * 2) + checksFooterHeight + indexesFooterHeight;

  let title = table.name;
  if (hasMultipleSchema && table.schemaName) {
    title = `${table.schemaName}.${table.name}`;
  }

  // Determine header colors
  const customHeaderColor = parseHeaderColor(table.headerColor);
  const headerBackgroundColor = customHeaderColor || getThemeVar('buttonBackground');
  const headerTextColor = customHeaderColor
    ? getContrastColor(customHeaderColor)
    : getThemeVar('buttonForeground');

  // Match the resolved header color back to a palette variable (if any) so the
  // color picker can show which variable is currently applied.
  const currentVar = (palette.find(
    (p) => (p.hex || '').toLowerCase() === (table.headerColor || '').toLowerCase()
  ) || {}).name || null;

  const handleOpenColor = (e) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    openColorPicker({ kind: 'table', name: table.name, currentVar, position: { x: r.left, y: r.bottom + 6 } });
  };
  const handleOpenNote = (e) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    openNoteEditor({ kind: 'table', name: table.name, currentNote: table.note || '', position: { x: r.left, y: r.bottom + 6 } });
  };

  return (
    <div style={{
      background: getThemeVar('editorBackground'),
      borderRadius: '8px',
      minWidth: `${tableWidth}px`,
      width: `${tableWidth}px`,
      height: `${totalHeight}px`,
      overflow: 'visible',
      position: 'relative'
    }}>
      {/* Table Header */}
      <div style={{
        borderTop: `2px solid ${getThemeVar('panelBorder')}`,
        borderLeft: `2px solid ${getThemeVar('panelBorder')}`,
        borderRight: `2px solid ${getThemeVar('panelBorder')}`,
        background: headerBackgroundColor,
        color: headerTextColor,
        padding: '8px 12px',
        fontWeight: 'bold',
        fontSize: '14px',
        height: `${headerHeight}px`,
        borderRadius: '8px 8px 0 0',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0, marginLeft: '6px' }}>
          <NoteIconButton note={table.note} color={headerTextColor} onClick={handleOpenNote} />
          <button
            onClick={handleOpenColor}
            className="nodrag"
            style={headerIconButtonStyle(headerTextColor)}
            title="Color del encabezado"
          >
            <PaletteIcon />
          </button>
        </div>
      </div>

      {/* Column Area - Visual padding container */}
      {columnCount > 0 && (
        <div style={{
          padding: `${tablePadding}px`,
          borderTop: `1px solid ${getThemeVar('panelBorder')}`,
          borderLeft: `2px solid ${getThemeVar('panelBorder')}`,
          borderRight: `2px solid ${getThemeVar('panelBorder')}`,
          borderBottom: (checks.length > 0 || indexes.length > 0) ? 'none' : `2px solid ${getThemeVar('panelBorder')}`,
          borderRadius: (checks.length > 0 || indexes.length > 0) ? '0' : '0 0 8px 8px',
          background: getThemeVar('editorBackground'),
          height: `${columnCount * columnHeight + (tablePadding * 2)}px`,
          boxSizing: 'border-box'
        }}>
          {/* Column nodes are positioned as children within this padded area */}
        </div>
      )}

      {/* Checks Footer — shows a compact button to open the checks tooltip */}
      {checks.length > 0 && (
        <div style={{
          borderLeft: `2px solid ${getThemeVar('panelBorder')}`,
          borderRight: `2px solid ${getThemeVar('panelBorder')}`,
          borderBottom: indexes.length > 0 ? 'none' : `2px solid ${getThemeVar('panelBorder')}`,
          borderTop: `1px solid ${getThemeVar('panelBorder')}`,
          borderRadius: indexes.length > 0 ? '0' : '0 0 8px 8px',
          background: getThemeVar('editorBackground'),
          height: `${checksFooterHeight}px`,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onTableChecksClick) {
                const rect = e.currentTarget.getBoundingClientRect();
                onTableChecksClick(table, checks, {
                  x: rect.right + 10,
                  y: rect.top,
                });
              }
            }}
            style={{
              background: 'none',
              border: `1px solid ${getThemeVar('panelBorder')}`,
              borderRadius: '4px',
              color: getThemeVar('descriptionForeground'),
              cursor: 'pointer',
              fontSize: '11px',
              padding: '3px 8px',
              width: '100%',
              textAlign: 'left',
            }}
            title="View check constraints"
          >
            ✓ View Checks ({checks.length})
          </button>
        </div>
      )}

      {/* Indexes Footer — shows a compact button to open the indexes tooltip */}
      {indexes.length > 0 && (
        <div style={{
          borderLeft: `2px solid ${getThemeVar('panelBorder')}`,
          borderRight: `2px solid ${getThemeVar('panelBorder')}`,
          borderBottom: `2px solid ${getThemeVar('panelBorder')}`,
          borderTop: `1px solid ${getThemeVar('panelBorder')}`,
          borderRadius: '0 0 8px 8px',
          background: getThemeVar('editorBackground'),
          height: `${indexesFooterHeight}px`,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onTableIndexesClick) {
                const rect = e.currentTarget.getBoundingClientRect();
                onTableIndexesClick(table, indexes, {
                  x: rect.right + 10,
                  y: rect.top,
                });
              }
            }}
            style={{
              background: 'none',
              border: `1px solid ${getThemeVar('panelBorder')}`,
              borderRadius: '4px',
              color: getThemeVar('descriptionForeground'),
              cursor: 'pointer',
              fontSize: '11px',
              padding: '3px 8px',
              width: '100%',
              textAlign: 'left',
            }}
            title="View indexes"
          >
            🔍 View Indexes ({indexes.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default TableHeaderNode;
