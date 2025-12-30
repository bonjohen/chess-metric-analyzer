/**
 * MoveHistory Component
 * Displays the list of moves in algebraic notation
 */

import { Move } from '../models/chessGame';

export class MoveHistory {
  private container: HTMLElement;
  private moves: Move[] = [];
  private onMoveClickCallback?: (index: number) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  /**
   * Update the move history
   */
  public updateMoves(moves: Move[]): void {
    this.moves = moves;
    this.render();
  }

  /**
   * Add a single move to the history
   */
  public addMove(move: Move): void {
    this.moves.push(move);
    this.render();
  }

  /**
   * Clear all moves
   */
  public clear(): void {
    this.moves = [];
    this.render();
  }

  /**
   * Render the move history
   */
  private render(): void {
    if (this.moves.length === 0) {
      this.container.innerHTML = '<p class="empty-state">No moves yet</p>';
      return;
    }

    let html = '<div class="move-history-list">';

    // Group moves by move number (white + black = 1 move number)
    for (let i = 0; i < this.moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = this.moves[i];
      const blackMove = this.moves[i + 1];

      // Skip if white move doesn't exist (shouldn't happen, but TypeScript safety)
      if (!whiteMove) continue;

      html += `<div class="move-pair">`;
      html += `<span class="move-number">${moveNumber}.</span>`;

      // White's move
      html += `<button class="move-item white-move" data-index="${i}">`;
      html += `${whiteMove.san}`;
      if (whiteMove.captured) {
        html += `<span class="capture-indicator">×</span>`;
      }
      html += `</button>`;

      // Black's move (if exists)
      if (blackMove) {
        html += `<button class="move-item black-move" data-index="${i + 1}">`;
        html += `${blackMove.san}`;
        if (blackMove.captured) {
          html += `<span class="capture-indicator">×</span>`;
        }
        html += `</button>`;
      }

      html += `</div>`;
    }

    html += '</div>';
    this.container.innerHTML = html;

    // Attach click handlers
    this.attachEventListeners();

    // Scroll to bottom to show latest move
    this.scrollToBottom();
  }

  /**
   * Attach event listeners to move items
   */
  private attachEventListeners(): void {
    const moveItems = this.container.querySelectorAll('.move-item');
    moveItems.forEach((item) => {
      item.addEventListener('click', () => {
        const index = parseInt((item as HTMLElement).dataset.index || '0');
        this.handleMoveClick(index);
      });
    });
  }

  /**
   * Handle move click
   */
  private handleMoveClick(index: number): void {
    if (this.onMoveClickCallback) {
      this.onMoveClickCallback(index);
    }

    // Highlight selected move
    const moveItems = this.container.querySelectorAll('.move-item');
    moveItems.forEach((item, i) => {
      if (i === index) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  /**
   * Scroll to bottom of move list
   */
  private scrollToBottom(): void {
    this.container.scrollTop = this.container.scrollHeight;
  }

  /**
   * Set callback for move clicks
   */
  public setOnMoveClick(callback: (index: number) => void): void {
    this.onMoveClickCallback = callback;
  }

  /**
   * Get all moves
   */
  public getMoves(): Move[] {
    return [...this.moves];
  }

  /**
   * Get move count
   */
  public getMoveCount(): number {
    return this.moves.length;
  }

  /**
   * Export moves as PGN
   */
  public exportPgn(): string {
    let pgn = '';
    for (let i = 0; i < this.moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = this.moves[i];
      const blackMove = this.moves[i + 1];

      // Skip if white move doesn't exist
      if (!whiteMove) continue;

      pgn += `${moveNumber}. ${whiteMove.san}`;
      if (blackMove) {
        pgn += ` ${blackMove.san} `;
      }
    }
    return pgn.trim();
  }
}

