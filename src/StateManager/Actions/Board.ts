import FlowApp from '../../Interfaces/FlowApp';
import { IWorldCoords } from '../../Interfaces/Viewport';
import BoardElement from '../../Interfaces/BoardElement';
import { ShiftModeState } from '../../Interfaces/Board';
import Group from '../../Interfaces/Group';

export default class BoardActions {
  constructor(public app: FlowApp) {}

  public createNewMemoOnBoard() {
    // todo: UP NEXT #2: pipe board actions through stateManager^
  }

  public selectElementById(id: string) {
    const el = this.app.board.getElementById(id);
    if (el instanceof BoardElement) {
      const selected = this.app.board.selection.selectElement(el);
      console.log('selected', selected, selected.createdTempGroup);
      // TODO: Update state based on selected: SelectionState
    }
  }

  public selectElement(boardElement: BoardElement) {
    const selectionState = this.app.board.selection.selectElement(boardElement);
    console.log('selected', selectionState);
    // TODO: Update state based on selected: SelectionState

    // Single update
    // Note: No update for selection yet
    // selectedElement: Board['selectedBoardElement'] = null;
    // prevSelection: Board['selectedBoardElement'] = null;
    // this.app.stateManager.setState(`/board/${id}`, { selected: true }, {});

    // createdTempGroup: undefined | Group = undefined;
    // this.app.stateManager.setState(`/board/create:${id}`, { x, y, scale, children }, { noOp: true; } );
    // deletedTempGroup: undefined | Group = undefined;
    // this.app.stateManager.setState(`/board/delete:${id}`, {}, { noOp: true; } );

    // Multiple update
    // addedToTempGroup: BoardElement[] = [];
    // this.app.stateManager.setState(`/board/${id}`, { x, y, scale, parent }, { noOp: true; } );
    // removedFromTempGroup: BoardElement[] = [];
    // this.app.stateManager.setState(`/board/${id}`, { x, y, scale, parent }, { noOp: true; } );

    const {
      selectedElement,
      addedToTempGroup,
      removedFromTempGroup,
      createdTempGroup,
      deletedTempGroup,
    } = selectionState;

    if (createdTempGroup && addedToTempGroup && selectedElement instanceof Group) {
      const { id, x, y, scale } = selectedElement;
      this.app.stateManager.setState(
        `/board/create:${id}`,
        { x, y, scale, children: addedToTempGroup.map((el) => el.id) },
        { noOp: true },
      );
    }

    if (deletedTempGroup && addedToTempGroup && selectedElement instanceof Group) {
      const { id } = selectedElement;
      this.app.stateManager.setState(`/board/delete:${id}`, {}, { noOp: true });
    }

    // Add or remove group members for both cases: createdTempGroup or just added to group
    if (addedToTempGroup && selectedElement instanceof Group) {
      addedToTempGroup.forEach((el) => {
        const { id, x, y, scale } = el;
        this.app.stateManager.setState(
          `/board/${id}`,
          { x, y, scale, parent: selectedElement.id },
          { noOp: true, noHistory: true },
        );
      });
    }

    if (removedFromTempGroup && selectedElement instanceof Group) {
      addedToTempGroup.forEach((el) => {
        const { id, x, y, scale } = el;
        this.app.stateManager.setState(
          `/board/${id}`,
          { x, y, scale, parent: undefined },
          { noOp: true, noHistory: true },
        );
      });
    }
  }

  public deselectElements() {
    const deselected = this.app.board.selection.deselectElement();
    console.log('deselected', deselected);
    // TODO: Update state based on selected: SelectionState
  }

  public setShiftModeState(state: ShiftModeState = 'off') {
    this.app.webUi.setShiftModeState(state);
  }

  public deleteSelectedElement() {
    const boardElement = this.app.board.selection.getSelectedElement();
    if (boardElement) {
      this.app.board.deleteBoardElement(boardElement);
    }
  }

  public startDragElement(boardElement: BoardElement, startPoint: IWorldCoords) {
    this.app.board.startDragElement(boardElement, startPoint);
    // no need to update state on startDrag yet
  }

  public stopDragElement(boardElement: BoardElement) {
    this.app.board.stopDragElement(boardElement);
    const { id, x, y } = boardElement;
    this.app.stateManager.setState(
      `/board/${id}`,
      { x, y },
      {
        noOp: true,
      },
    );
  }

  public scaleElementById(id: string, targetScale?: number) {
    this.app.stateManager.setState(`/board/${id}`, { scale: targetScale }, { async: 'animation' });
  }

  public moveElementById(id: string, target: IWorldCoords) {
    const { wX: x, wY: y } = target;
    this.app.stateManager.setState(`/board/${id}`, { x, y }, { async: 'animation' });
  }

  public decreaseSelectedElementScale() {
    const boardElement = this.app.board.selection.getSelectedElement();
    if (boardElement) {
      this.scaleElementById(boardElement.id, boardElement.scale / 1.3);
    }
  }

  public increaseSelectedElementScale() {
    const boardElement = this.app.board.selection.getSelectedElement();
    if (boardElement) {
      this.scaleElementById(boardElement.id, boardElement.scale * 1.3);
    }
  }
}
