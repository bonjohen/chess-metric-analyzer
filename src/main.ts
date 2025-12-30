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
import { BoardView } from './ui/boardView';
import { ArrowLayer } from './ui/arrowLayer';
import { SquareOverlay } from './ui/squareOverlay';
import { ProfileEditor } from './ui/profileEditor';

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Chess Metric Analyzer - Initializing...');

  // Get container elements
  const boardContainer = document.getElementById('chess-board');
  const arrowContainer = document.getElementById('arrow-layer');
  const overlayContainer = document.getElementById('square-overlay');
  const profileEditorContainer = document.getElementById('profile-editor');
  const propertiesModal = document.getElementById('properties-modal');
  const propertiesBtn = document.getElementById('properties-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');

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

  // Initialize profile editor
  if (profileEditorContainer) {
    const profileEditor = new ProfileEditor(profileEditorContainer);
    profileEditor.render();

    // Set up profile change callback
    profileEditor.setOnProfileChange((profile) => {
      console.log('Profile changed:', profile);
      // TODO: Trigger re-analysis with new profile
    });
  }

  // Set up modal controls
  if (propertiesBtn && propertiesModal && closeModalBtn) {
    propertiesBtn.addEventListener('click', () => {
      propertiesModal.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', () => {
      propertiesModal.style.display = 'none';
    });

    // Close modal when clicking outside
    propertiesModal.addEventListener('click', (e) => {
      if (e.target === propertiesModal) {
        propertiesModal.style.display = 'none';
      }
    });
  }

  console.log('Chess Metric Analyzer - Ready!');
});
