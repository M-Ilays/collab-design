import { ILayer } from '../../services/layouter/layer';
import { UMLElement } from '../../services/uml-element/uml-element';
import { ComposePreview } from '../compose-preview';
import { SequenceLifeline } from './uml-sequence-lifeline/uml-sequence-lifeline';
import { SequenceActivation } from './uml-sequence-activation/uml-sequence-activation';
import { SequenceFragment, FragmentType } from './uml-sequence-fragment/uml-sequence-fragment';
import { UMLSequenceActor } from './uml-sequence-actor/uml-sequence-actor';
import { UMLSequenceExit } from './uml-sequence-exit/uml-sequence-exit';
import { computeDimension } from '../../utils/geometry/boundary';


export const composeSequenceDiagramPreview: ComposePreview = (
  layer: ILayer,
  translate: (id: string) => string,
): UMLElement[] => {
  const elements: UMLElement[] = [];

  const sequenceLifeline = new SequenceLifeline({
    name: "Life Line" ,
    
    bounds: { x: 0, y: 0, width: 160, height: 200 },
  });

  elements.push(sequenceLifeline);

  const activation = new SequenceActivation({
    lifelineId: sequenceLifeline.id,
    bounds: { x: 70, y: 50, width: 20, height: 100 },
  });

  elements.push(activation);

  const altFragment = new SequenceFragment({
    fragmentType: FragmentType.Alt,
    condition: 'condition',
    bounds: { x: 100, y: 50, width: 150 , height: 100 },
  });

  elements.push(altFragment);

  const optFragment = new SequenceFragment({
    fragmentType: FragmentType.Opt,
    condition: 'optional',
    bounds: { x: 320, y: 50, width: 150 , height: 100 },
  });

  elements.push(optFragment);

  const loopFragment = new SequenceFragment({
    fragmentType: FragmentType.Loop,
    condition: 'while true',
    bounds: { x: 540, y: 50, width: 150 , height: 100 },
  });

  elements.push(loopFragment);

  const actor = new UMLSequenceActor({
    name: 'Actor',
    bounds: { x: 0,
      y: 0,
      width: computeDimension(1.0, 80),
      height: computeDimension(1.0, 140)}
  });

  elements.push(actor);

  const exit = new UMLSequenceExit({
    bounds: { x: 700, y: 50, width: 40, height: 40 }
  });

  elements.push(exit);

  return elements;
};