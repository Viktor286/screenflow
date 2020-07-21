import DevMonitor from '../DevMonitor';
import { ClickEventData, Viewport as PixiViewport } from 'pixi-viewport';

export default class ViewportEvents {
  constructor(public viewport: PixiViewport, public eventMonitor: DevMonitor | null) {
    if (this.eventMonitor instanceof DevMonitor) {
      this.eventMonitor.addDevMonitor('viewportEvents');
    }

    this.initViewportEvents();
  }

  sendToMonitor(eventName: string, msg: string = '') {
    if (this.eventMonitor instanceof DevMonitor) {
      this.eventMonitor.dispatchMonitor('viewportEvents', eventName, msg);
    }
  }

  initViewportEvents() {
    // Activate only required events for optimization purposes

    // Viewport
    this.viewport.on('clicked', (e) => this.viewportClicked(e));
    this.viewport.on('drag-start', (e) => this.viewportDragStart(e));
    this.viewport.on('drag-end', (e) => this.viewportDragEnd(e));
    // viewport.on('frame-end', (e) => this.viewportFrameEnd(e));

    // viewport.on('moved', (e) => this.viewportMoved(e));
    // viewport.on('moved-end', (e) => this.viewportMovedEnd(e));
    // viewport.on('zoomed-end', (e) => this.viewportZoomedEnd(e));
    // viewport.on('mouse-edge-start', (e) => this.viewportMouseEdgeStart(e));
    // viewport.on('mouse-edge-end', (e) => this.viewportMouseEdgeEnd(e));

    // Viewport plugins
    // viewport.on('wheel-scroll', (e) => this.viewportWheelScroll(e));
    // viewport.on('pinch-start', (e) => this.viewportPinchStart(e));
    // viewport.on('pinch-end', (e) => this.viewportPinchEnd(e));
    // viewport.on('bounce-x-start', (e) => this.viewportBounceXStart(e));
    // viewport.on('bounce-x-end', (e) => this.viewportBounceXEnd(e));
    // viewport.on('bounce-y-start', (e) => this.viewportBounceYStart(e));
    // viewport.on('bounce-y-end', (e) => this.viewportBounceYEnd(e));
    // viewport.on('snap-start', (e) => this.viewportSnapStart(e));
    // viewport.on('snap-end', (e) => this.viewportSnapEnd(e));
    // viewport.on('snap-zoom-start', (e) => this.viewportSnapZoomStart(e));
    // viewport.on('snap-zoom-end', (e) => this.viewportSnapZoomEnd(e));
  }

  viewportClicked(e: ClickEventData) {
    const eventName = 'Clicked';
    console.log(`[viewport] ${eventName}`, e);
    this.sendToMonitor(eventName);
  }

  viewportDragStart(e: ClickEventData) {
    const eventName = 'DragStart';
    console.log(`[viewport] ${eventName}`, e);
    this.sendToMonitor(eventName);
  }

  viewportDragEnd(e: ClickEventData) {
    const eventName = 'DragEnd';
    console.log(`[viewport] ${eventName}`, e);
    this.sendToMonitor(eventName);
  }

  // viewportFrameEnd(e: Viewport) {
  //   console.log('[viewport] FrameEnd', e);
  // }
  //
  // viewportMoved(e: Viewport) {
  //   console.log('[viewport] Moved', e);
  // }
  //
  // viewportMovedEnd(e: Viewport) {
  //   console.log('[viewport] MovedEnd', e);
  // }
  //
  // viewportZoomedEnd(e: Viewport) {
  //   console.log('[viewport] ZoomedEnd', e);
  // }
  //
  // viewportMouseEdgeStart(e: Viewport) {
  //   console.log('[viewport] MouseEdgeStart', e);
  // }
  //
  // viewportMouseEdgeEnd(e: Viewport) {
  //   console.log('[viewport] MouseEdgeEnd', e);
  // }
  //
  // // Viewport plugins
  // viewportWheelScroll(e: Viewport) {
  //   console.log('[viewport] WheelScroll', e);
  // }
  //
  // viewportPinchStart(e: Viewport) {
  //   console.log('[viewport] PinchStart', e);
  // }
  //
  // viewportPinchEnd(e: Viewport) {
  //   console.log('[viewport] PinchEnd', e);
  // }
  //
  // viewportBounceXStart(e: Viewport) {
  //   console.log('[viewport] BounceXStart', e);
  // }
  //
  // viewportBounceXEnd(e: Viewport) {
  //   console.log('[viewport] BounceXEnd', e);
  // }
  //
  // viewportBounceYStart(e: Viewport) {
  //   console.log('[viewport] BounceYStart', e);
  // }
  //
  // viewportBounceYEnd(e: Viewport) {
  //   console.log('[viewport] BounceYEnd', e);
  // }
  //
  // viewportSnapStart(e: Viewport) {
  //   console.log('[viewport] SnapStart', e);
  // }
  //
  // viewportSnapEnd(e: Viewport) {
  //   console.log('[viewport] SnapEnd', e);
  // }
  //
  // viewportSnapZoomStart(e: Viewport) {
  //   console.log('[viewport] SnapZoomStart', e);
  // }
  //
  // viewportSnapZoomEnd(e: Viewport) {
  //   console.log('[viewport] SnapZoomEnd', e);
  // }
}
