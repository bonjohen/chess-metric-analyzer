/**
 * ChessGame Model
 * Wrapper around chess.js for game state management
 */

import { Chess } from 'chess.js';

export interface Move {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
  san: string;
  lan: string;
  before: string;
  after: string;
}

export interface MoveHistory {
  moves: Move[];
  currentIndex: number;
}

export class ChessGame {
  private chess: Chess;
  private moveHistory: Move[] = [];

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  /**
   * Get current FEN position
   */
  public getFen(): string {
    return this.chess.fen();
  }

  /**
   * Load a position from FEN
   */
  public loadFen(fen: string): boolean {
    try {
      this.chess.load(fen);
      this.moveHistory = [];
      return true;
    } catch (error) {
      console.error('Invalid FEN:', error);
      return false;
    }
  }

  /**
   * Get all legal moves for the current position
   */
  public getLegalMoves(): string[] {
    return this.chess.moves();
  }

  /**
   * Get legal moves for a specific square
   */
  public getLegalMovesForSquare(square: string): string[] {
    return this.chess.moves({ square: square as any, verbose: false });
  }

  /**
   * Get legal move destinations for a specific square
   */
  public getLegalDestinations(square: string): string[] {
    const moves = this.chess.moves({ square: square as any, verbose: true });
    return moves.map((move: any) => move.to);
  }

  /**
   * Make a move
   */
  public makeMove(from: string, to: string, promotion?: string): Move | null {
    try {
      const beforeFen = this.chess.fen();
      
      const moveResult = this.chess.move({
        from,
        to,
        promotion: promotion as any
      });

      if (!moveResult) {
        return null;
      }

      const afterFen = this.chess.fen();

      const move: Move = {
        from: moveResult.from,
        to: moveResult.to,
        piece: moveResult.piece,
        captured: moveResult.captured,
        promotion: moveResult.promotion,
        san: moveResult.san,
        lan: moveResult.lan,
        before: beforeFen,
        after: afterFen
      };

      this.moveHistory.push(move);
      return move;
    } catch (error) {
      console.error('Invalid move:', error);
      return null;
    }
  }

  /**
   * Undo the last move
   */
  public undoMove(): Move | null {
    const undone = this.chess.undo();
    if (undone) {
      return this.moveHistory.pop() || null;
    }
    return null;
  }

  /**
   * Get move history
   */
  public getMoveHistory(): Move[] {
    return [...this.moveHistory];
  }

  /**
   * Get move history in PGN format
   */
  public getPgn(): string {
    return this.chess.pgn();
  }

  /**
   * Check if the game is over
   */
  public isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  /**
   * Check if in check
   */
  public isInCheck(): boolean {
    return this.chess.isCheck();
  }

  /**
   * Check if in checkmate
   */
  public isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  /**
   * Check if in stalemate
   */
  public isStalemate(): boolean {
    return this.chess.isStalemate();
  }

  /**
   * Get the current turn
   */
  public getTurn(): 'w' | 'b' {
    return this.chess.turn();
  }

  /**
   * Reset to starting position
   */
  public reset(): void {
    this.chess.reset();
    this.moveHistory = [];
  }
}

