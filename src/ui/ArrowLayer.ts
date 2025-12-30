/**
 * ArrowLayer Component
 * Renders SVG arrows showing candidate moves
 * Thickness = sequence rank (thick=1st, medium=2nd, thin=3rd)
 */

interface Arrow {
  from: { rank: number; file: number };
  to: { rank: number; file: number };
  rank: 1 | 2 | 3; // Sequence rank (thickness)
  ply: 1 | 2 | 3; // Ply depth (opacity)
  isBest?: boolean;
}

export class ArrowLayer {
  private container: HTMLElement;
  private svg: SVGSVGElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.initializeSVG();
  }

  /**
   * Get current square size based on board dimensions
   */
  private getSquareSize(): number {
    const board = this.container.closest('.chess-board') as HTMLElement;
    if (!board) return 75; // fallback
    return board.offsetWidth / 8;
  }

  /**
   * Initialize SVG element
   */
  private initializeSVG(): void {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.setAttribute('preserveAspectRatio', 'none');

    // Define arrowhead marker (fixed size, 50% larger = 30x30)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '30');
    marker.setAttribute('markerHeight', '30');
    marker.setAttribute('refX', '22.5');
    marker.setAttribute('refY', '15');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('markerUnits', 'userSpaceOnUse');

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 30 15, 0 30');
    polygon.setAttribute('fill', '#4a90e2');
    polygon.setAttribute('stroke', 'none');

    marker.appendChild(polygon);
    defs.appendChild(marker);
    this.svg.appendChild(defs);

    this.container.appendChild(this.svg);
  }

  /**
   * Render mock arrows for demonstration
   * Coordinate system: rank 0 = 8th rank (top), rank 7 = 1st rank (bottom)
   *                    file 0 = a-file (left), file 7 = h-file (right)
   *
   * Rank 1 (thickest, 50%): 2 white pawn moves
   * Rank 2 (medium, 25%): 4 black pawn moves
   * Rank 3 (thinnest, 12.5%): 8 white moves (4 knights + 4 pieces freed by pawn moves)
   */
  public renderMockArrows(): void {
    const mockArrows: Arrow[] = [
      // RANK 1 (Thickest): 2 White pawn moves
      { from: { rank: 6, file: 4 }, to: { rank: 4, file: 4 }, rank: 1, ply: 1 }, // e2-e4
      { from: { rank: 6, file: 3 }, to: { rank: 4, file: 3 }, rank: 1, ply: 1 }, // d2-d4

      // RANK 2 (Medium): 4 Black pawn moves
      { from: { rank: 1, file: 4 }, to: { rank: 3, file: 4 }, rank: 2, ply: 1 }, // e7-e5
      { from: { rank: 1, file: 3 }, to: { rank: 3, file: 3 }, rank: 2, ply: 1 }, // d7-d5
      { from: { rank: 1, file: 2 }, to: { rank: 3, file: 2 }, rank: 2, ply: 1 }, // c7-c5
      { from: { rank: 1, file: 5 }, to: { rank: 3, file: 5 }, rank: 2, ply: 1 }, // f7-f5

      // RANK 3 (Thinnest): 8 White moves
      // 4 Knight moves
      { from: { rank: 7, file: 1 }, to: { rank: 5, file: 0 }, rank: 3, ply: 1 }, // Nb1-a3
      { from: { rank: 7, file: 1 }, to: { rank: 5, file: 2 }, rank: 3, ply: 1 }, // Nb1-c3
      { from: { rank: 7, file: 6 }, to: { rank: 5, file: 5 }, rank: 3, ply: 1 }, // Ng1-f3
      { from: { rank: 7, file: 6 }, to: { rank: 5, file: 7 }, rank: 3, ply: 1 }, // Ng1-h3

      // 4 Pieces freed by pawn moves (e2-e4 and d2-d4)
      { from: { rank: 7, file: 5 }, to: { rank: 6, file: 4 }, rank: 3, ply: 1 }, // Bf1-e2 (after e2-e4)
      { from: { rank: 7, file: 5 }, to: { rank: 5, file: 3 }, rank: 3, ply: 1 }, // Bf1-d3 (after e2-e4)
      { from: { rank: 7, file: 3 }, to: { rank: 6, file: 3 }, rank: 3, ply: 1 }, // Qd1-d2 (after d2-d4)
      { from: { rank: 7, file: 2 }, to: { rank: 6, file: 3 }, rank: 3, ply: 1 }, // Bc1-d2 (after d2-d4)
    ];

    this.renderArrows(mockArrows);
  }

  /**
   * Render arrows from data
   */
  public renderArrows(arrows: Arrow[]): void {
    if (!this.svg) return;

    // Update viewBox based on current board size
    const boardSize = this.getSquareSize() * 8;
    this.svg.setAttribute('viewBox', `0 0 ${boardSize} ${boardSize}`);

    // Clear existing arrows
    const existingArrows = this.svg.querySelectorAll('.arrow, .arrow-clickable');
    existingArrows.forEach(arrow => arrow.remove());

    // Render each arrow
    arrows.forEach(arrow => {
      this.drawArrow(arrow);
    });
  }

  /**
   * Draw a single arrow with proper positioning
   * Board coordinates: rank 0 = top (8th rank), rank 7 = bottom (1st rank)
   *                    file 0 = left (a-file), file 7 = right (h-file)
   * Arrow length: 100% of distance between square centers
   * Knight moves: L-shaped (2 squares in one direction, 1 perpendicular)
   */
  private drawArrow(arrow: Arrow): void {
    if (!this.svg) return;

    // Calculate center positions of squares (dynamic square size)
    const squareSize = this.getSquareSize();
    const fromX = (arrow.from.file + 0.5) * squareSize;
    const fromY = (arrow.from.rank + 0.5) * squareSize;
    const toX = (arrow.to.file + 0.5) * squareSize;
    const toY = (arrow.to.rank + 0.5) * squareSize;

    // Check if this is a knight move (L-shaped: 2+1 or 1+2 squares)
    const fileDiff = Math.abs(arrow.to.file - arrow.from.file);
    const rankDiff = Math.abs(arrow.to.rank - arrow.from.rank);
    const isKnightMove = (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);

    let pathData: string;

    if (isKnightMove) {
      // L-shaped path for knight moves
      // Determine which direction has 2 squares
      let midX: number, midY: number;

      if (fileDiff === 2) {
        // Move 2 squares horizontally first, then 1 vertically
        midX = toX;
        midY = fromY;
      } else {
        // Move 2 squares vertically first, then 1 horizontally
        midX = fromX;
        midY = toY;
      }

      pathData = `M ${fromX} ${fromY} L ${midX} ${midY} L ${toX} ${toY}`;
    } else {
      // Straight line for non-knight moves
      pathData = `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }

    // Create arrow path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('class', `arrow rank-${arrow.rank} ply-${arrow.ply}${arrow.isBest ? ' best-move' : ''}`);
    path.setAttribute('marker-end', 'url(#arrowhead)');
    path.setAttribute('fill', 'none');

    this.svg.appendChild(path);
  }

  /**
   * Clear all arrows
   */
  public clear(): void {
    if (!this.svg) return;
    const arrows = this.svg.querySelectorAll('.arrow, .arrow-clickable');
    arrows.forEach(arrow => arrow.remove());
  }
}
