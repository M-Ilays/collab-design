import { ILayer } from '../../../services/layouter/layer';
import { ILayoutable } from '../../../services/layouter/layoutable';
// import { UMLElement } from '../../../services/uml-element/uml-element';
import { UMLElementType } from '../../uml-element-type';
import * as Apollon from '../../../typings';
import { SequenceElementType } from '..';
import { DeepPartial } from 'redux';
import { calculateNameBounds } from '../../../utils/name-bounds';
import { IUMLElement, UMLElement } from '../../../services/uml-element/uml-element';
import { assign } from '../../../utils/fx/assign';
import { IBoundary } from '../../../utils/geometry/boundary';
import { UMLElementFeatures } from '../../../services/uml-element/uml-element-features';

export interface ISequenceLifeline extends IUMLElement {}

export class SequenceLifeline extends UMLElement {
  type: UMLElementType = SequenceElementType.SequenceLifeline;

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

  bounds: IBoundary = { ...this.bounds, width: 160, height: 200 };

  constructor(values?: DeepPartial<ISequenceLifeline>) {
    super(values);
    this.bounds = { ...this.bounds, width: 160, height: 200 };
    assign<ISequenceLifeline>(this, values);
  }

  render(canvas: ILayer): ILayoutable[] {
    return [this];
  }

  // render(canvas: ILayer): ILayoutable[] {
  //   this.bounds = calculateNameBounds(this, canvas);
  //   return [this];
  // }
}


