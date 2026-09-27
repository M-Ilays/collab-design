import React, { FunctionComponent } from 'react';
import { UMLSequenceExit } from './uml-sequence-exit';
import { ThemedLine } from '../../../components/theme/themedComponents';
import { computeDimension } from '../../../utils/geometry/boundary';

export const UMLSequenceExitComponent: FunctionComponent<Props> = ({ element, fillColor }) => {
  const padding = 0.2; // 20% padding from edges
  const startX = computeDimension(1.0, element.bounds.width * padding);
  const startY = computeDimension(1.0, element.bounds.height * padding);
  const endX = computeDimension(1.0, element.bounds.width * (1 - padding));
  const endY = computeDimension(1.0, element.bounds.height * (1 - padding));

  return (
    <g>
      <rect width="100%" height="100%" fill="none" />
      <g stroke={element.strokeColor || 'black'} strokeWidth={2}>
        <ThemedLine
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          strokeColor={element.fillColor}
        />
        <ThemedLine
          x1={endX}
          y1={startY}
          x2={startX}
          y2={endY}
          strokeColor={element.fillColor}
        />
      </g>
    </g>
  );
};

interface Props {
  element: UMLSequenceExit;
  fillColor?: string;
} 