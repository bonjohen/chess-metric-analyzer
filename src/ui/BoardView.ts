/**
 * BoardView Component
 * Renders the chess board with pieces from FEN
 */

export class BoardView {
  private container: HTMLElement;
  private squares: HTMLElement[][] = [];
  private selectedSquare: string | null = null;
  private highlightedSquares: string[] = [];
  private onSquareClickCallback?: (square: string) => void;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Render the board from a FEN string
   */
  public render(fen: string): void {
    // Clear only the squares, preserve overlay and arrow layers
    const existingSquares = this.container.querySelectorAll('.square');
    existingSquares.forEach(square => square.remove());
    this.squares = [];

    // Parse FEN to get piece placement
    const piecePlacement = fen.split(' ')[0];

    if (!piecePlacement) {
      console.error('Invalid FEN: missing piece placement');
      return;
    }

    const ranks = piecePlacement.split('/');

    // Create 8x8 grid of squares
    for (let rank = 0; rank < 8; rank++) {
      this.squares[rank] = [];
      const rankData = ranks[rank];

      if (!rankData) {
        console.error(`Invalid FEN: missing rank ${rank}`);
        continue;
      }

      let file = 0;

      for (const char of rankData) {
        if (char >= '1' && char <= '8') {
          // Empty squares
          const emptyCount = parseInt(char, 10);
          for (let i = 0; i < emptyCount; i++) {
            this.createSquare(rank, file);
            file++;
          }
        } else {
          // Piece
          this.createSquare(rank, file, char);
          file++;
        }
      }
    }
  }

  /**
   * Create a single square element
   */
  private createSquare(rank: number, file: number, piece?: string): void {
    const square = document.createElement('div');
    square.className = 'square';
    square.dataset.rank = rank.toString();
    square.dataset.file = file.toString();

    // Determine square color (light or dark)
    const isLight = (rank + file) % 2 === 0;
    square.classList.add(isLight ? 'light' : 'dark');

    // Add coordinates on edge squares
    if (file === 0) {
      const rankCoord = document.createElement('span');
      rankCoord.className = 'square-coord rank';
      rankCoord.textContent = (8 - rank).toString();
      square.appendChild(rankCoord);
    }
    if (rank === 7) {
      const fileCoord = document.createElement('span');
      fileCoord.className = 'square-coord file';
      fileCoord.textContent = String.fromCharCode(97 + file); // a-h
      square.appendChild(fileCoord);
    }

    // Add piece if present
    if (piece) {
      const pieceElement = document.createElement('div');
      pieceElement.className = 'piece';
      pieceElement.dataset.piece = piece;
      square.appendChild(pieceElement);
    }

    // Add click handler (for future interactivity)
    square.addEventListener('click', () => {
      this.onSquareClick(rank, file);
    });

    // Insert square before overlay/arrow layers (so they stay on top)
    const overlayLayer = this.container.querySelector('#square-overlay');
    if (overlayLayer) {
      this.container.insertBefore(square, overlayLayer);
    } else {
      this.container.appendChild(square);
    }

    if (this.squares[rank]) {
      this.squares[rank][file] = square;
    }
  }

  /**
   * Handle square click
   */
  private onSquareClick(rank: number, file: number): void {
    const squareName = this.coordsToSquare(rank, file);

    if (this.onSquareClickCallback) {
      this.onSquareClickCallback(squareName);
    }
  }

  /**
   * Convert rank/file coordinates to square name (e.g., "e4")
   */
  private coordsToSquare(rank: number, file: number): string {
    return `${String.fromCharCode(97 + file)}${8 - rank}`;
  }

  /**
   * Convert square name to rank/file coordinates
   */
  private squareToCoords(square: string): { rank: number; file: number } {
    const file = square.charCodeAt(0) - 97; // a=0, b=1, etc.
    const rank = 8 - parseInt(square.charAt(1)); // 8=0, 7=1, etc.
    return { rank, file };
  }

  /**
   * Set callback for square clicks
   */
  public setOnSquareClick(callback: (square: string) => void): void {
    this.onSquareClickCallback = callback;
  }

  /**
   * Highlight a square as selected
   */
  public selectSquare(square: string | null): void {
    // Clear previous selection
    this.clearSelection();

    if (square) {
      this.selectedSquare = square;
      const { rank, file } = this.squareToCoords(square);
      const squareElement = this.squares[rank]?.[file];
      if (squareElement) {
        squareElement.classList.add('selected');
      }
    } else {
      this.selectedSquare = null;
    }
  }

  /**
   * Highlight legal move destinations
   */
  public highlightMoves(squares: string[]): void {
    // Clear previous highlights
    this.clearHighlights();

    this.highlightedSquares = squares;
    squares.forEach(square => {
      const { rank, file } = this.squareToCoords(square);
      const squareElement = this.squares[rank]?.[file];
      if (squareElement) {
        squareElement.classList.add('legal-move');

        // Add a move indicator dot
        const hasPiece = squareElement.querySelector('.piece');
        if (hasPiece) {
          squareElement.classList.add('capture-move');
        } else {
          const dot = document.createElement('div');
          dot.className = 'move-indicator';
          squareElement.appendChild(dot);
        }
      }
    });
  }

  /**
   * Clear selection highlighting
   */
  public clearSelection(): void {
    this.squares.forEach(row => {
      row.forEach(sq => sq.classList.remove('selected'));
    });
    this.selectedSquare = null;
  }

  /**
   * Clear move highlighting
   */
  public clearHighlights(): void {
    this.squares.forEach(row => {
      row.forEach(sq => {
        sq.classList.remove('legal-move', 'capture-move');
        const indicator = sq.querySelector('.move-indicator');
        if (indicator) {
          indicator.remove();
        }
      });
    });
    this.highlightedSquares = [];
  }

  /**
   * Get selected square
   */
  public getSelectedSquare(): string | null {
    return this.selectedSquare;
  }

  /**
   * Get square element by coordinates
   */
  public getSquare(rank: number, file: number): HTMLElement | undefined {
    return this.squares[rank]?.[file];
  }

  /**
   * Clear the board (preserve overlay and arrow layers)
   */
  public clear(): void {
    const existingSquares = this.container.querySelectorAll('.square');
    existingSquares.forEach(square => square.remove());
    this.squares = [];
  }
}
