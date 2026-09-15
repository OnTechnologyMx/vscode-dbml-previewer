import React from 'react';
import {
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
  BaseEdge,
  EdgeLabelRenderer,
  useInternalNode,
  Position,
} from '@xyflow/react';

const getPathFunction = (pathStyle) => {
  switch (pathStyle) {
    case 'straight': return getStraightPath;
    case 'smoothstep': return getSmoothStepPath;
    case 'bezier':
    default: return getBezierPath;
  }
};

/** Left/right edge X and horizontal center of a node in absolute coords. */
const sideX = (node) => {
  const x = node.internals.positionAbsolute.x;
  const w = node.measured?.width ?? node.width ?? 0;
  return { left: x, right: x + w, center: x + w / 2 };
};

const CustomEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
  markerEnd,
  markerStart,
}) => {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  // Default to the coordinates React Flow computed from the assigned handles,
  // then override the X/side to whichever pairing is shortest. The Y stays put
  // because each column has handles on both sides at the same row height.
  let sX = sourceX;
  let tX = targetX;
  let sPos = sourcePosition;
  let tPos = targetPosition;
  const sY = sourceY;
  const tY = targetY;

  if (sourceNode && targetNode) {
    const s = sideX(sourceNode);
    const t = sideX(targetNode);
    // Try every source-side / target-side pairing and keep the one whose handles
    // are horizontally closest. Side-by-side tables get facing sides; vertically
    // stacked (aligned) tables get the SAME side — a short hop down one edge
    // instead of looping all the way around to the opposite side.
    const options = [
      { sx: s.right, sp: Position.Right, tx: t.left,  tp: Position.Left },
      { sx: s.left,  sp: Position.Left,  tx: t.right, tp: Position.Right },
      { sx: s.right, sp: Position.Right, tx: t.right, tp: Position.Right },
      { sx: s.left,  sp: Position.Left,  tx: t.left,  tp: Position.Left },
    ];
    let best = options[0];
    let bestDist = Infinity;
    for (const o of options) {
      const dist = Math.abs(o.tx - o.sx);
      if (dist < bestDist) { bestDist = dist; best = o; }
    }
    sX = best.sx; sPos = best.sp;
    tX = best.tx; tPos = best.tp;
  }

  const pathFn = getPathFunction(data?.pathStyle);
  const [edgePath] = pathFn({
    sourceX: sX,
    sourceY: sY,
    sourcePosition: sPos,
    targetX: tX,
    targetY: tY,
    targetPosition: tPos,
  });

  // Position labels ~35% from each endpoint along the straight line
  const startLabelX = tX + (sX - tX) * 0.65;
  const startLabelY = tY + (sY - tY) * 0.65;
  const endLabelX = tX + (sX - tX) * 0.35;
  const endLabelY = tY + (sY - tY) * 0.35;

  const sourceLabel = data?.sourceRelation === '*' ? 'N' : (data?.sourceIsNullable ? '0' : '1');
  const targetLabel = data?.targetRelation === '*' ? 'N' : (data?.targetIsNullable ? '0' : '1');

  const labelColor = data?.refColor || style?.stroke;

  const labelStyle = {
    position: 'absolute',
    fontSize: 11,
    fontWeight: 700,
    fontFamily: 'monospace',
    color: '#ffffff',
    background: labelColor,
    borderRadius: 4,
    padding: '1px 5px',
    lineHeight: '14px',
    pointerEvents: 'none',
    zIndex: data?.isSelected ? 1002 : 1,
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} markerStart={markerStart} />
      {data?.showCardinalityLabels && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${startLabelX}px, ${startLabelY}px)`,
              ...labelStyle,
            }}
            className="nodrag nopan"
          >
            {sourceLabel}
          </div>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${endLabelX}px, ${endLabelY}px)`,
              ...labelStyle,
            }}
            className="nodrag nopan"
          >
            {targetLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;
