import React, { FunctionComponent } from 'react';
import { SequenceFragment, FragmentType } from './uml-sequence-fragment';
import { ThemedRect, ThemedLine } from '../../../components/theme/themedComponents';
import { Text } from '../../../components/controls/text/text';

interface Props {
  element: SequenceFragment;
  fillColor?: string;
}

export const SequenceFragmentComponent: FunctionComponent<Props> = ({ element, fillColor }) => {
  const getFragmentLabel = () => {
    switch (element.fragmentType) {
      case FragmentType.Alt:
        return 'alt';
      case FragmentType.Opt:
        return 'opt';
      case FragmentType.Loop:
        return 'loop';
      default:
        return '';
    }
  };

  return (
    <g>
      <rect width="100%" height="100%" fill="none" />
      <ThemedRect
        x={0}
        y={0}
        width="100%"
        height="100%"
        fillColor={fillColor || element.fillColor}
        strokeColor={element.strokeColor}
        fillOpacity={0.1}
      />
      <ThemedLine
        x1={0}
        y1={0}
        x2={0}
        y2="100%"
        strokeColor={element.strokeColor}
      />
      <ThemedLine
        x1="100%"
        y1={0}
        x2="100%"
        y2="100%"
        strokeColor={element.strokeColor}
      />
      <Text
        fill={element.textColor}
        x={10}
        y={20}
        fontSize={12}
        textAnchor="left"
      >
        {getFragmentLabel()}
      </Text>
      <Text
        fill={element.textColor}
        x={10}
        y={40}
        fontSize={12}
        textAnchor="left"
        opacity={element.name ? 1 : 0.5}
      >
        [{element.name || 'condition not set'}]
      </Text>
    </g>
  );
};