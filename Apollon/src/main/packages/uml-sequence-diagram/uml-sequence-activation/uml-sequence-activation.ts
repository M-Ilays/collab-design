import { ILayer } from '../../../services/layouter/layer';
import { ILayoutable } from '../../../services/layouter/layoutable';
import { UMLElementType } from '../../uml-element-type';
import { SequenceElementType } from '..';
import { DeepPartial } from 'redux';
import { IUMLElement, UMLElement } from '../../../services/uml-element/uml-element';
import { assign } from '../../../utils/fx/assign';
import { IBoundary } from '../../../utils/geometry/boundary';

export class SequenceActivation extends UMLElement {
  type: UMLElementType = SequenceElementType.SequenceActivation;
  bounds: IBoundary = { ...this.bounds, width: 20, height: 100 };
  lifelineId: string = '';

  constructor(values?: DeepPartial<IUMLElement & { lifelineId: string }>) {
    super(values);
    assign<IUMLElement & { lifelineId: string }>(this, values);
  }

  render(canvas: ILayer): ILayoutable[] {
    return [this];
  }
} 