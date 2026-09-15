import { createContext } from 'react';

/**
 * Supplies the in-diagram editing actions (color picker / note editor) and the
 * current color palette to table & group header nodes, without threading them
 * through the positional transformer signature.
 *
 * openColorPicker / openNoteEditor receive:
 *   { kind: 'table' | 'group', name: string, currentVar?: string,
 *     currentNote?: string, position: { x, y } }
 */
export const DiagramActionsContext = createContext({
  palette: [],
  openColorPicker: () => {},
  openNoteEditor: () => {},
});

export default DiagramActionsContext;
