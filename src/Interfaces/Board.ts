import FlowApp from './FlowApp';
import BoardElement, { BoardElementContainer } from './BoardElement';
import Memo, { IMemoSettings } from './Memo';
import Group, { IGroupSettings } from './Group';
import Viewport, { IWorldCoords } from './Viewport';
import GraphicsEngine from './GraphicsEngine';

export type BoardElementId = string | undefined;
export type BoardElementType = 'BoardElement' | 'Memo' | 'Group';
export type IBoardImage = {
  data: Blob;
  id: string;
};

export type ShiftModeState = 'off' | 'hold' | 'lock';

// TODO: INFO -- THE CRITICAL CONDITION FOR CURRENT "INTERFACE" METHODS IS
//  THEY SHOULD EVENTUALLY CHANGE ONLY ONE PUBLIC STATE PROPERTY,
//  OFFER GRANULAR CONTROL OVER ITS ENTITIES,
//  SO ACTIONS (CONTROLLERS) WILL DRIVE COMPLEX LOGIC THROUGH STATE UPDATE
//  VEIW (UI) -> CONTROLLER (ACTION) -> MODEL (STATE) -> CONTROLLER (INTERFACE) -> CONTROLLER (ENGINE) -> MODEL (STATE) -> VIEW (GUI)
//  TODO: READ ABOUT ARCHITECTURE PATTERNS VARIATIONS: E.G.

export default class Board {
  public viewport: Viewport;
  public engine: GraphicsEngine;
  public isMemberDragging: boolean | string = false;
  public isMultiSelect: boolean = false;
  public selectedElement: BoardElement | null = null;

  constructor(public app: FlowApp) {
    this.viewport = this.app.viewport;
    this.engine = this.app.engine;

    if (this.app.devMonitor) {
      this.app.devMonitor.addDevMonitor('boardEvents');
    }
  }

  public createBoardElement(
    type: BoardElementType,
    id: BoardElementId,
    settings?: IMemoSettings | IGroupSettings,
  ) {
    switch (type) {
      case 'BoardElement':
        return new BoardElement(this, id);
      case 'Memo':
        return new Memo(this, id, settings as IMemoSettings);
      case 'Group':
        return new Group(this, id, settings as IGroupSettings);
    }
  }

  // // TODO: this is currently a temp shortcut method, we need to add elements properly through the actions (state update)
  // public addNewMemosToBoardFromTextures(textures?: PIXI.Texture[]) {
  //   if (textures && textures.length > 0) {
  //     textures.forEach((texture) => {
  //       this.addElementToBoard(new Memo(texture, this.app));
  //     });
  //   }
  // }

  public addElementToBoard<T extends BoardElement>(boardElement: T): T {
    boardElement.zIndex = 1;
    this.app.viewport.addToViewport(boardElement.container);
    return boardElement;
  }

  // todo: how to make "undo" for "hard" delete of Sprites? never really delete BoardElement?
  //   probably this need two variations: soft/hard deletion
  public deleteBoardElement<T extends BoardElement>(boardElement: T, hard: boolean = false): boolean {
    if (boardElement instanceof Group) {
      boardElement.isTempGroup = false; // keep from rm on deselect. TODO: can we do it some "proper" way?
    }

    boardElement.delete(hard);
    return true;
  }

  public resetBoard() {
    // Looks like in order to fully reset the board we just need to remove all board elements
    const allBoardElements = this.getAllBoardElements();
    allBoardElements.forEach((el) => this.deleteBoardElement(el, true));
    return true;
  }

  public startDragElement(
    boardElement: BoardElement,
    startPoint: IWorldCoords = { wX: boardElement.x, wY: boardElement.y },
  ) {
    if (!this.isMemberDragging) {
      this.isMemberDragging = boardElement.id;
      // this.selection.selectElement(boardElement);
      this.app.viewport.instance.pause = true;
      boardElement.startDrag(startPoint);
    }
  }

  public stopDragElement(boardElement: BoardElement) {
    // Small delay to prevent immediate actions after stopDrag, e.g. removeFromGroup on shift+select
    setTimeout(() => {
      this.isMemberDragging = false;
    }, 500);
    this.app.viewport.instance.pause = false;
    boardElement.stopDrag();
  }

  public getElementById(elementId: string): BoardElement | null {
    const displayObjects = this.app.viewport.instance.children.filter(
      (el) => el instanceof BoardElementContainer && el.boardElement.id === elementId,
    ) as BoardElementContainer[];

    return displayObjects.length > 0 ? displayObjects[0].boardElement : null;
  }

  public getAllBoardElements() {
    // API design: Should we get all elements in a flat way, including inner group members?

    const displayObjects = this.app.viewport.instance.children.filter(
      (el) => el instanceof BoardElementContainer,
    ) as BoardElementContainer[];

    return displayObjects.map((container) => container.boardElement) as BoardElement[];
  }

  public getAllMemos(): Memo[] {
    const displayObjects = this.app.viewport.instance.children.filter(
      (el) => el instanceof BoardElementContainer && el.boardElement instanceof Memo,
    ) as BoardElementContainer[];

    return displayObjects.map((container) => container.boardElement) as Memo[];
  }

  public getAllGroups() {
    const displayObjects = this.app.viewport.instance.children.filter(
      (el) => el instanceof BoardElementContainer && el.boardElement instanceof Group,
    ) as BoardElementContainer[];

    return displayObjects.map((container) => container.boardElement);
  }

  public sendEventToMonitor(boardElement: BoardElement, eventName: string, msg: string = '') {
    if (this.app.devMonitor) {
      this.app.devMonitor.dispatchMonitor('boardEvents', `[${boardElement.id}] ${eventName}`, msg);
    }
  }

  public updateSelectionGraphics() {
    if (this.selectedElement) {
      this.selectedElement.drawSelection();
    }
  }
}
