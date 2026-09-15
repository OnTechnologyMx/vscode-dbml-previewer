import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getThemeVar } from '../styles/themeManager.js';

/**
 * Shared inline SVG icons and button style for the table/group header actions.
 * SVGs use `currentColor` so they inherit the header's text color.
 */

export const PaletteIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

export const NoteIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const headerIconButtonStyle = (color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'none',
  border: 'none',
  color,
  cursor: 'pointer',
  padding: '2px',
  borderRadius: '3px',
  opacity: 0.85,
  lineHeight: 0,
});

/**
 * Note icon button with:
 *  - a green dot badge when a note exists, and
 *  - a styled popover on hover that shows the full note.
 * Clicking opens the note editor (onClick).
 */
export const NoteIconButton = ({ note, color, onClick }) => {
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const hasNote = !!(note && note.trim());

  const showTip = () => {
    if (!hasNote || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ x: r.right, y: r.bottom + 5 });
  };
  const hideTip = () => setPos(null);

  const POPOVER_W = 240;

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', lineHeight: 0 }}
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
    >
      <button
        ref={btnRef}
        onClick={onClick}
        className="nodrag"
        style={{ ...headerIconButtonStyle(color), position: 'relative' }}
        title=""
      >
        <NoteIcon />
        {hasNote && (
          <span
            style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#2ecc71',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.25)',
              zIndex: 100,
            }}
          />
        )}
      </button>

      {/* Rendered through a portal to document.body so it escapes React Flow's
          transformed viewport and stacks above every node (a note popover kept
          inside the node was drawn behind the column rows). */}
      {pos && hasNote && createPortal(
        <div
          className="nodrag nopan"
          style={{
            position: 'fixed',
            top: pos.y,
            left: Math.max(8, Math.min(pos.x - POPOVER_W, window.innerWidth - POPOVER_W - 8)),
            zIndex: 10001,
            width: `${POPOVER_W}px`,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontWeight: 'normal',
            fontSize: '12px',
            lineHeight: 1.4,
            color: getThemeVar('foreground'),
            background: getThemeVar('editorBackground'),
            border: `1px solid ${getThemeVar('panelBorder')}`,
            borderRadius: '6px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            padding: '8px 10px',
            textAlign: 'left',
            pointerEvents: 'none',
          }}
        >
          {note}
        </div>,
        document.body
      )}
    </span>
  );
};

export default { PaletteIcon, NoteIcon, NoteIconButton, headerIconButtonStyle };
