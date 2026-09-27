import React from 'react';

export const PreviewMessageArrowComponent = () => (
  <g>
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="10"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#000" />
      </marker>
    </defs>
    <line
      x1={80}
      y1={30}
      x2={140}
      y2={30}
      stroke="#000"
      strokeWidth={2}
      markerEnd="url(#arrowhead)"
    />
  </g>
);