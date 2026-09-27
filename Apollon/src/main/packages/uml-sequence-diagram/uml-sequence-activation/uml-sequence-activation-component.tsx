import React, { FunctionComponent } from 'react';
import { SequenceActivation } from './uml-sequence-activation';
import { ThemedRect } from '../../../components/theme/themedComponents';

interface Props {
  element: SequenceActivation;
  fillColor?: string;
}

export const SequenceActivationComponent: FunctionComponent<Props> = ({ element, fillColor }) => {
  return (
    <g>
      <ThemedRect
        x={0}
        y={0}
        width="100%"
        height="100%"
        fillColor={fillColor || element.fillColor}
        strokeColor={element.strokeColor}
        fillOpacity={0.3}
      />
    </g>
  );
}; 