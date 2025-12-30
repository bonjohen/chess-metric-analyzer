/**
 * Main Application Entry Point
 * Initializes the Chess Metric Analyzer application
 */

// Import styles
import './styles/app.css';
import './styles/board.css';
import './styles/arrows.css';
import './styles/overlays.css';

<<<<<<< HEAD
// Import UI components
import { BoardView } from './ui/boardView';
import { ArrowLayer } from './ui/arrowLayer';
import { SquareOverlay } from './ui/squareOverlay';
import { ProfileEditor } from './ui/profileEditor';
=======
// Import application controller
import { App } from './app';
>>>>>>> df38e4d468532a9b40be87ab2e7fa14957137b92

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Chess Metric Analyzer - Starting...');

  try {
    // Initialize the application controller
    // The App class handles all component initialization and coordination
    const app = new App();

    // Expose app instance to window for debugging (optional)
    if (typeof window !== 'undefined') {
      (window as any).chessApp = app;
    }

    console.log('Chess Metric Analyzer - Ready!');
    console.log('App instance available at window.chessApp for debugging');
  } catch (error) {
    console.error('Failed to initialize Chess Metric Analyzer:', error);
  }
});
