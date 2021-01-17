import FlowApp from '../../Interfaces/FlowApp';
import Viewport from '../../Interfaces/Viewport';
import { StateUpdateRequest } from '../StateUpdateRequest';
import { PublicViewportState } from '../Representations/Viewport';
import { AsyncId } from '../index';

export default class ViewportOperations {
  constructor(public app: FlowApp) {}

  animate(stateUpdate: StateUpdateRequest, asyncId: AsyncId) {
    this.app.viewport
      .animateViewport(stateUpdate.slice as PublicViewportState)
      .then((viewportProps) =>
        this.app.stateManager.setState('viewport', viewportProps, { async: 'animated', asyncId }),
      );
  }

  update(
    property: Extract<keyof Viewport, string>,
    value: PublicViewportState[keyof PublicViewportState],
    stateUpdate: StateUpdateRequest,
  ) {
    if (Object.prototype.hasOwnProperty.call(this.app.viewport, property)) {
      this.app.viewport[property] = value;
    }
    return value;
  }
}
