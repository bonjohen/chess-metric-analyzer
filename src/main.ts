/**
 * Main Application Entry Point
 * Initializes the Chess Metric Analyzer application
 */

// Import styles
import './styles/app.css';
import './styles/board.css';
import './styles/arrows.css';
import './styles/overlays.css';

// Import UI components
import { BoardView } from './ui/BoardView';
import { ArrowLayer } from './ui/ArrowLayer';
import { SquareOverlay } from './ui/SquareOverlay';

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Chess Metric Analyzer - Initializing...');

  // Get container elements
  const boardContainer = document.getElementById('chess-board');
  const arrowContainer = document.getElementById('arrow-layer');
  const overlayContainer = document.getElementById('square-overlay');

  if (!boardContainer || !arrowContainer || !overlayContainer) {
    console.error('Required containers not found in DOM');
    return;
  }

  // Initialize board view with starting position
  const startingFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const boardView = new BoardView(boardContainer);
  boardView.render(startingFEN);

  // Initialize arrow layer with mock arrows
  const arrowLayer = new ArrowLayer(arrowContainer);
  arrowLayer.renderMockArrows();

  // Initialize square overlay with mock coloring
  const squareOverlay = new SquareOverlay(overlayContainer);
  squareOverlay.renderMockOverlays();

  console.log('Chess Metric Analyzer - Ready!');
});
