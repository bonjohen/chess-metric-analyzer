/**
 * BoardView Component
 * Renders the chess board with pieces from FEN
 */

export class BoardView {
  private container: HTMLElement;
  private squares: HTMLElement[][] = [];

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
    const square = this.squares[rank]?.[file];
    if (!square) return;

    console.log(`Square clicked: ${String.fromCharCode(97 + file)}${8 - rank}`);

    // Toggle selection (for visual feedback)
    const wasSelected = square.classList.contains('selected');

    // Clear all selections
    this.squares.forEach(row => {
      row.forEach(sq => sq.classList.remove('selected'));
    });

    // Select this square if it wasn't selected
    if (!wasSelected) {
      square.classList.add('selected');
    }
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
