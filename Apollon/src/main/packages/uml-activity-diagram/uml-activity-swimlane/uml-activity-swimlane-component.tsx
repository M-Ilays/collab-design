import React, { FunctionComponent } from 'react';
import { UMLActivitySwimlane } from './uml-activity-swimlane';
import { ThemedLine, ThemedRect } from '../../../components/theme/themedComponents';
import { Text } from '../../../components/controls/text/text';

export const UMLActivitySwimlaneComponent: FunctionComponent<Props> = ({ element, fillColor }) => {
  const headerHeight = 40;
  
  return (
    <g>
      <ThemedRect
        x={0}
        y={0}
        width={element.bounds.width}
        height={element.bounds.height}
        fillColor={fillColor || element.fillColor}
      />
      <g stroke={element.strokeColor || 'black'} strokeWidth={1}>
        <rect
          x={0}
          y={0}
          width={element.bounds.width}
          height={headerHeight}
          fill={fillColor || element.fillColor}
        />
        
        <Text
          fill={element.textColor}
          x={element.bounds.width / 2}
          y={headerHeight / 2}
          textAnchor="middle"
          style={{ fontWeight: 'normal' }}
         
          
        >   
          {element.name}
        </Text>
        
        <ThemedLine
          x1={0}
          y1={0}
          x2={0}
          y2={element.bounds.height}
          strokeColor={element.strokeColor}
        />
        
        <ThemedLine
          x1={element.bounds.width}
          y1={0}
          x2={element.bounds.width}
          y2={element.bounds.height}
          strokeColor={element.strokeColor}
        />
        
        <ThemedLine
          x1={0}
          y1={0}
          x2={element.bounds.width}
          y2={0}
          strokeColor={element.strokeColor}
        />
        
        <ThemedLine
          x1={0}
          y1={element.bounds.height}
          x2={element.bounds.width}
          y2={element.bounds.height}
          strokeColor={element.strokeColor}
        />
      </g>
    </g>
  );
};

interface Props {
  element: UMLActivitySwimlane;
  fillColor?: string;
}