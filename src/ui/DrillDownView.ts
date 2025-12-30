/**
 * DrillDownView Component
 * Displays parent position boards with navigation and breadcrumb trail
 */

export interface Position {
  fen: string;
  move: string | null;
  ply: number;
  metrics?: {
    PV_white: number;
    PV_black: number;
    MS_white: number;
    MS_black: number;
    AT_white: number;
    AT_black: number;
    DF_white: number;
    DF_black: number;
  };
}

export class DrillDownView {
  private container: HTMLElement;
  private positions: Position[] = [];
  private currentIndex = -1;
  private onPositionClickCallback?: (index: number) => void;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render(positions: Position[]): void {
    this.positions = positions;
    this.currentIndex = positions.length - 1;

    this.container.innerHTML = '';

    if (positions.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Render breadcrumb trail
    const breadcrumb = this.createBreadcrumb();
    this.container.appendChild(breadcrumb);

    // Render position boards
    const boardsContainer = document.createElement('div');
    boardsContainer.className = 'drilldown-boards';

    positions.forEach((position, index) => {
      const boardElement = this.createPositionBoard(position, index);
      boardsContainer.appendChild(boardElement);
    });

    this.container.appendChild(boardsContainer);

    // Scroll to current position
    this.scrollToPosition(this.currentIndex);
  }

  private renderEmptyState(): void {
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'Click an arrow to drill down into a position';
    this.container.appendChild(emptyState);
  }

  private createBreadcrumb(): HTMLElement {
    const breadcrumb = document.createElement('div');
    breadcrumb.className = 'breadcrumb';

    this.positions.forEach((position, index) => {
      if (index > 0) {
        const separator = document.createElement('span');
        separator.className = 'breadcrumb-separator';
        separator.textContent = '›';
        breadcrumb.appendChild(separator);
      }

      const crumb = document.createElement('button');
      crumb.className = 'breadcrumb-item';
      crumb.textContent = position.move || 'Start';

      if (index === this.currentIndex) {
        crumb.classList.add('active');
      }

      crumb.addEventListener('click', () => {
        this.handlePositionClick(index);
      });

      breadcrumb.appendChild(crumb);
    });

    return breadcrumb;
  }

  private createPositionBoard(position: Position, index: number): HTMLElement {
    const boardWrapper = document.createElement('div');
    boardWrapper.className = 'drilldown-board-wrapper';
    boardWrapper.dataset.index = index.toString();

    if (index === this.currentIndex) {
      boardWrapper.classList.add('active');
    }

    // Move label
    const moveLabel = document.createElement('div');
    moveLabel.className = 'drilldown-move-label';
    moveLabel.textContent = position.move || 'Starting Position';
    boardWrapper.appendChild(moveLabel);

    // Mini board
    const miniBoard = document.createElement('div');
    miniBoard.className = 'drilldown-mini-board';
    this.renderMiniBoard(miniBoard, position.fen);
    boardWrapper.appendChild(miniBoard);

    // Ply indicator
    const plyLabel = document.createElement('div');
    plyLabel.className = 'drilldown-ply-label';
    plyLabel.textContent = `Ply ${position.ply}`;
    boardWrapper.appendChild(plyLabel);

    // Click handler
    boardWrapper.addEventListener('click', () => {
      this.handlePositionClick(index);
    });

    return boardWrapper;
  }

  private renderMiniBoard(container: HTMLElement, fen: string): void {
    // Parse FEN and render mini board
    const piecePlacement = fen.split(' ')[0];
    if (!piecePlacement) return;

    const rows = piecePlacement.split('/');

    // Create 8x8 grid
    for (let rank = 0; rank < 8; rank++) {
      const row = rows[rank];
      if (!row) continue;

      let file = 0;

      for (const char of row) {
        if (char >= '1' && char <= '8') {
          // Empty squares
          const emptyCount = parseInt(char);
          for (let i = 0; i < emptyCount; i++) {
            const square = this.createMiniSquare(rank, file);
            container.appendChild(square);
            file++;
          }
        } else {
          // Piece
          const square = this.createMiniSquare(rank, file, char);
          container.appendChild(square);
          file++;
        }
      }
    }
  }

  private createMiniSquare(rank: number, file: number, piece?: string): HTMLElement {
    const square = document.createElement('div');
    square.className = 'mini-square';

    // Light or dark square
    const isLight = (rank + file) % 2 === 0;
    square.classList.add(isLight ? 'light' : 'dark');

    // Add piece if present
    if (piece) {
      const pieceElement = document.createElement('div');
      pieceElement.className = 'mini-piece';
      pieceElement.textContent = this.getPieceUnicode(piece);
      square.appendChild(pieceElement);
    }

    return square;
  }

  private getPieceUnicode(piece: string): string {
    const pieces: Record<string, string> = {
      'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    return pieces[piece] || '';
  }

  private handlePositionClick(index: number): void {
    this.highlightPosition(index);

    if (this.onPositionClickCallback) {
      this.onPositionClickCallback(index);
    }
  }

  public highlightPosition(index: number): void {
    this.currentIndex = index;

    // Update breadcrumb
    const breadcrumbItems = this.container.querySelectorAll('.breadcrumb-item');
    breadcrumbItems.forEach((item, i) => {
      if (i === index) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update boards
    const boards = this.container.querySelectorAll('.drilldown-board-wrapper');
    boards.forEach((board, i) => {
      if (i === index) {
        board.classList.add('active');
      } else {
        board.classList.remove('active');
      }
    });

    this.scrollToPosition(index);
  }

  private scrollToPosition(index: number): void {
    const board = this.container.querySelector(`[data-index="${index}"]`);
    if (board) {
      board.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  public setOnPositionClick(callback: (index: number) => void): void {
    this.onPositionClickCallback = callback;
  }

  public clear(): void {
    this.positions = [];
    this.currentIndex = -1;
    this.renderEmptyState();
  }

  public addPosition(position: Position): void {
    this.positions.push(position);
    this.render(this.positions);
  }

  public getPositions(): Position[] {
    return this.positions;
  }

  public getCurrentPosition(): Position | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.positions.length) {
      return this.positions[this.currentIndex] || null;
    }
    return null;
  }
}
