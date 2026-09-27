import { DeepPartial } from 'redux';
import { SequenceElementType } from '..';
import { ILayer } from '../../../services/layouter/layer';
import { ILayoutable } from '../../../services/layouter/layoutable';
import { IUMLElement, UMLElement } from '../../../services/uml-element/uml-element';
import { assign } from '../../../utils/fx/assign';
import { IBoundary } from '../../../utils/geometry/boundary';
import { UMLElementType } from '../../uml-element-type';
import { UMLElementFeatures } from '../../../services/uml-element/uml-element-features';

export interface IUMLSequenceActor extends IUMLElement {}

export class UMLSequenceActor extends UMLElement {
  type: UMLElementType = SequenceElementType.SequenceActor;

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

  constructor(values?: DeepPartial<IUMLSequenceActor>) {
    super(values);
    this.bounds = { ...this.bounds, width: 80, height: 140 };
    assign<IUMLSequenceActor>(this, values);
  }

  render(canvas: ILayer): ILayoutable[] {
    return [this];
  }
}
