import { DeepPartial } from 'redux';
import { ActivityElementType } from '..';
import { ILayer } from '../../../services/layouter/layer';
import { ILayoutable } from '../../../services/layouter/layoutable';
import { IUMLElement, UMLElement } from '../../../services/uml-element/uml-element';
import { assign } from '../../../utils/fx/assign';
import { IBoundary } from '../../../utils/geometry/boundary';
import { UMLElementType } from '../../uml-element-type';
import { UMLElementFeatures } from '../../../services/uml-element/uml-element-features';

export interface IUMLActivitySwimlane extends IUMLElement {}

export class UMLActivitySwimlane extends UMLElement {
  type: UMLElementType = ActivityElementType.ActivitySwimlane;

  static override features: UMLElementFeatures = {
    connectable: false,
    droppable: true,
    hoverable: true,
    movable: true,
    resizable: true,
    selectable: true,
    updatable: true,
    alternativePortVisualization: false,
  };

  constructor(values?: DeepPartial<IUMLActivitySwimlane>) {
    super(values);
    this.bounds = { ...this.bounds, width: 200, height: 600 };
    assign<IUMLActivitySwimlane>(this, values);
  }

  render(canvas: ILayer): ILayoutable[] {
    return [this];
  }
}