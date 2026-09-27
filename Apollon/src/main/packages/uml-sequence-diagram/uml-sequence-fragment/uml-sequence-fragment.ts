import { ILayer } from '../../../services/layouter/layer';
import { ILayoutable } from '../../../services/layouter/layoutable';
import { UMLElementType } from '../../uml-element-type';
import { SequenceElementType } from '..';
import { DeepPartial } from 'redux';
import { IUMLElement, UMLElement } from '../../../services/uml-element/uml-element';
import { assign } from '../../../utils/fx/assign';
import { IBoundary } from '../../../utils/geometry/boundary';
import { UMLElementFeatures } from '../../../services/uml-element/uml-element-features';

export enum FragmentType {
  Alt = 'alt',
  Opt = 'opt',
  Loop = 'loop',
  Par = 'par',
  Break = 'break',
  Critical = 'critical',
  Neg = 'neg',
  Ref = 'ref',
  Seq = 'seq',
  Strict = 'strict',
}

export interface ISequenceFragment extends IUMLElement {
  fragmentType: FragmentType;
  condition?: string;
}

export class SequenceFragment extends UMLElement {
  type: UMLElementType = SequenceElementType.SequenceFragment;
  fragmentType: FragmentType = FragmentType.Alt;
  condition?: string;
  bounds: IBoundary = { ...this.bounds, width: 150, height: 100 };
  name: string = '';

  static override features: UMLElementFeatures = {
    connectable: false,
    droppable: false,
    hoverable: true,
    movable: true,
    resizable: true,
    selectable: true,
    updatable: true,
    alternativePortVisualization: false,
  };

  constructor(values?: DeepPartial<ISequenceFragment>) {
    super(values);
    if (values?.condition) {
      this.name = values.condition;
    }
    assign<ISequenceFragment>(this, values);
  }

  render(canvas: ILayer): ILayoutable[] {
    return [this];
  }
}