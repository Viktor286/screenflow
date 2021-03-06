import * as PIXI from 'pixi.js';
import { CgEngine } from './GraphicsEngine';
import { Viewport as PixiViewport } from 'pixi-viewport';
import FlowApp from './FlowApp';
import { StageEvent } from './InteractionEvents/StageEvents';
import SlideControls from './InteractionEvents/SlideControls';
import { gsap } from 'gsap';
import BoardElement from './BoardElement';

export interface IWorldCoords {
  wX: number;
  wY: number;
}

export interface IScreenCoords {
  sX: number;
  sY: number;
}

export default class Viewport {
  public readonly instance: PixiViewport;
  public readonly engine: CgEngine;
  public readonly slideControls: SlideControls;
  public readonly zoomScales: number[] = [0.03125, 0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32];
  public readonly fitAreaMarginPercent = 20;

  [key: string]: any;

  constructor(public app: FlowApp) {
    this.engine = app.engine;

    this.instance = new PixiViewport({
      screenWidth: this.app.hostHTMLWidth,
      screenHeight: this.app.hostHTMLHeight,
      worldWidth: this.app.hostHTMLWidth,
      worldHeight: this.app.hostHTMLHeight,
      interaction: this.engine.instance.renderer.plugins.interaction, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    });

    app.engine.addDisplayObject(this.instance);
    this.instance.sortableChildren = true;

    this.slideControls = new SlideControls(this.app, this);
    this.slideControls.addSlideControls();

    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Handler for "pixi engine and Viewport" dimensions dependency on window size
    window.addEventListener('resize', this.resizeViewportHandler);
    // window.addEventListener('orientationchange', this.orientationchangeViewportHandler, false);

    // For preventing page zoom you should prevent wheel event:
    window.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
      },
      { passive: false },
    );
  }

  set x(x: number) {
    this.instance.x = x;
  }

  get x() {
    return this.instance.x;
  }

  set y(y: number) {
    this.instance.y = y;
  }

  get y() {
    return this.instance.y;
  }

  set scale(val: number) {
    this.instance.scale.x = val;
    this.instance.scale.y = val;
  }

  get scale() {
    return this.instance.scale.x;
  }

  set screenWidth(val: number) {
    this.instance.screenWidth = val;
  }

  get screenWidth() {
    return this.instance.screenWidth;
  }

  set screenHeight(val: number) {
    this.instance.screenHeight = val;
  }

  get screenHeight() {
    return this.instance.screenHeight;
  }

  set interactive(val: boolean) {
    this.instance.interactive = val;
  }

  get interactive() {
    return this.instance.interactive;
  }

  public resizeViewportHandler = (): void => {
    // solution ref: https://github.com/davidfig/pixi-viewport/issues/212#issuecomment-608231281
    if (
      this.app.engine.screenWidth !== this.app.hostHTMLWidth ||
      this.app.engine.screenHeight !== this.app.hostHTMLHeight
    ) {
      this.app.engine.renderer.resize(this.app.hostHTMLWidth, this.app.hostHTMLHeight);
      this.instance.resize(this.app.hostHTMLWidth, this.app.hostHTMLHeight);
      this.app.gui.stageBackTile.updateDimensions(this.app.hostHTMLWidth, this.app.hostHTMLHeight);
    }
  };

  public getScreenCoordsFromEvent(e: StageEvent): IScreenCoords {
    return { sX: e.data.global.x, sY: e.data.global.y };
  }

  public getWorldScreenCoordsFromEvent(e: StageEvent): IWorldCoords {
    const screenClick: IScreenCoords = this.getScreenCoordsFromEvent(e);
    return this.screenToWorld(screenClick);
  }

  public getNextScaleStepDown(runAhead: number): number {
    const currentScale = this.instance.scale.x;

    for (let i = 0; i < this.zoomScales.length; i++) {
      const firstStep = this.zoomScales[0];
      if (currentScale <= firstStep) {
        return firstStep;
      }

      const lastStep = this.zoomScales[this.zoomScales.length - 1];
      if (currentScale > lastStep) {
        return this.zoomScales[this.zoomScales.length - (1 - runAhead)];
      }

      if (currentScale === this.zoomScales[i]) {
        return this.zoomScales[i - (1 - runAhead)] || firstStep;
      }

      if (currentScale > this.zoomScales[i] && currentScale < this.zoomScales[i + 1]) {
        if (currentScale - this.zoomScales[i] / 2 < this.zoomScales[i]) {
          // avoid the short jump case when next step less than halfway (without runAhead)
          return this.zoomScales[i - 1] || firstStep;
        }
        return this.zoomScales[i - runAhead] || firstStep;
      }
    }

    return 0;
  }

  public getNextScaleStepUp(runAhead: number): number {
    const currentScale = this.instance.scale.x;

    for (let i = 0; i < this.zoomScales.length; i++) {
      const firstStep = this.zoomScales[0];
      if (currentScale < firstStep) {
        return this.zoomScales[runAhead];
      }

      const lastStep = this.zoomScales[this.zoomScales.length - 1];
      if (currentScale >= lastStep) {
        return lastStep;
      }

      if (currentScale === this.zoomScales[i]) {
        return this.zoomScales[i + (1 + runAhead)] || lastStep;
      }

      const nextStep = this.zoomScales[i + 1];
      if (currentScale > this.zoomScales[i] && currentScale < nextStep) {
        if (currentScale + nextStep / 2 > nextStep) {
          // avoid the short jump case when next step less than halfway (without runAhead)
          return this.zoomScales[i + 2] || lastStep;
        }
        return this.zoomScales[i + (1 + runAhead)] || lastStep;
      }
    }

    return 0;
  }

  public addToViewport(displayObject: PIXI.DisplayObject, index: number = 0): PIXI.DisplayObject {
    return this.instance.addChildAt(displayObject, index);
  }

  public addBoardElementToViewport(boardElement: BoardElement): void {
    this.instance.addChildAt(boardElement.cgObj, 0);
  }

  public removeFromViewport(displayObject: PIXI.DisplayObject): PIXI.DisplayObject {
    return this.instance.removeChild(displayObject);
  }

  public getZoomString(): string {
    return Math.round(this.instance.scale.x * 100).toString();
  }

  public screenToWorld({ sX, sY }: IScreenCoords): IWorldCoords {
    const { x: wX, y: wY } = this.instance.toWorld(sX, sY);
    return { wX, wY };
  }

  public screenCenter(): IScreenCoords {
    return { sX: this.screenWidth / 2, sY: this.screenHeight / 2 };
  }

  public worldScreenCenter(): IWorldCoords {
    return { wX: this.instance.worldScreenWidth / 2, wY: this.instance.worldScreenHeight / 2 };
  }

  // get center()
  // center of screen in world coordinates = worldScreenWidth / 2 - x / scale

  // get worldScreenWidth()
  // worldScreenWidth = screenWidth / scale

  public getScreenCenterInWord(): IWorldCoords {
    return {
      wX: this.instance.worldScreenWidth / 2 - this.instance.x / this.instance.scale.x,
      wY: this.instance.worldScreenHeight / 2 - this.instance.y / this.instance.scale.y,
    };
  }

  public getWorldCoordsFromMouse(): IWorldCoords {
    const { x: wX, y: wY } = this.instance.toLocal(
      this.app.engine.renderer.plugins.interaction.eventData.data.global,
    );
    return { wX, wY };
  }

  public getScreenCoordsFromMouse(): IScreenCoords {
    const { x: sX, y: sY } = this.app.engine.renderer.plugins.interaction.eventData.data.global;
    return { sX, sY };
  }

  public findScaleFit(width: number, height: number) {
    return this.instance.findFit(width, height);
  }

  public viewportPropsConversion(targetPoint?: IWorldCoords, targetScale?: number) {
    if (!targetPoint) {
      targetPoint = this.getScreenCenterInWord();
    }

    if (targetScale === undefined) {
      targetScale = this.scale;
    }

    if (targetScale >= 32) targetScale = 32;
    if (targetScale <= 0.01) targetScale = 0.01;

    return {
      x: (this.screenWidth / targetScale / 2 - targetPoint.wX) * targetScale,
      y: (this.screenHeight / targetScale / 2 - targetPoint.wY) * targetScale,
      scale: targetScale,
    };
  }

  public animateViewport(viewportProps: Partial<Viewport>): Promise<Partial<Viewport>> {
    const { x, y, scale } = viewportProps;

    const animateProps = {
      x,
      y,
      scale,
    };
    return new Promise((resolve) => {
      gsap.to(this, {
        ...animateProps,
        duration: 0.5,
        ease: 'power3.out',
        onStart: () => {
          // this.interactive = false;
        },
        onUpdate: () => {
          this.app.gui.stageBackTile.updateGraphics();
          this.app.board.updateSelectionGraphics();
        },
        onComplete: () => {
          // this.interactive = true;
          setTimeout(() => this.onViewportAnimationEnds()); // send exec to next frame
          resolve({ ...animateProps });
        },
      });
    });
  }

  private onViewportAnimationEnds = (): void => {
    this.app.webUi.updateZoomBtn();
  };
}
