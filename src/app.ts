/**
 * Application Controller
 * Coordinates all UI components and manages application state
 */

import { BoardView } from './ui/BoardView';
import { ArrowLayer } from './ui/ArrowLayer';
import { SquareOverlay } from './ui/SquareOverlay';
import { ControlsPanel } from './ui/ControlsPanel';
import { DrillDownView, Position } from './ui/DrillDownView';
import { ProfileEditor } from './ui/ProfileEditor';
import { MoveHistory } from './ui/MoveHistory';
import { ChessGame } from './models/ChessGame';

interface AppState {
  currentFen: string;
  perspective: 'white' | 'black';
  currentProfile: string;
  analysisTree: any | null;
  selectedNode: any | null;
  isAnalyzing: boolean;
  depth: number;
  error: string | null;
  positionHistory: Position[];
}

export class App {
  // UI Components
  private boardView: BoardView;
  private arrowLayer: ArrowLayer;
  private squareOverlay: SquareOverlay;
  private controlsPanel: ControlsPanel;
  private drillDownView: DrillDownView;
  private profileEditor: ProfileEditor;
  private moveHistory: MoveHistory;

  // Chess game
  private chessGame: ChessGame;

  // Application state
  private state: AppState;

  constructor() {
    // Initialize chess game
    this.chessGame = new ChessGame();

    // Initialize state
    this.state = {
      currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      perspective: 'white',
      currentProfile: 'balanced',
      analysisTree: null,
      selectedNode: null,
      isAnalyzing: false,
      depth: 0,
      error: null,
      positionHistory: []
    };

    // Initialize UI components
    const chessBoardElement = document.getElementById('chess-board')!;
    const arrowLayerElement = document.getElementById('arrow-layer')!;
    const overlayElement = document.getElementById('square-overlay')!;
    const controlsContainer = document.querySelector('.controls-panel') as HTMLElement;
    const drillDownContainer = document.getElementById('drilldown-container')!;
    const profileEditorContainer = document.getElementById('profile-editor')!;
    const moveHistoryContainer = document.getElementById('move-history')!;

    this.boardView = new BoardView(chessBoardElement);
    this.arrowLayer = new ArrowLayer(arrowLayerElement);
    this.squareOverlay = new SquareOverlay(overlayElement);
    this.controlsPanel = new ControlsPanel(controlsContainer);
    this.drillDownView = new DrillDownView(drillDownContainer);
    this.profileEditor = new ProfileEditor(profileEditorContainer);
    this.moveHistory = new MoveHistory(moveHistoryContainer);

    this.initialize();
  }

  private initialize(): void {
    console.log('Initializing Chess Metric Analyzer...');

    // Wire up event handlers
    this.setupEventHandlers();

    // Load initial position
    this.loadPosition(this.state.currentFen);

    // Render mock data for demonstration
    this.renderMockVisualization();

    // Load state from localStorage if available
    this.loadState();

    console.log('Application initialized successfully');
  }

  private setupEventHandlers(): void {
    // Board View events
    this.boardView.setOnSquareClick((square) => this.handleSquareClick(square));

    // Controls Panel events
    this.controlsPanel.setOnFenChange((fen) => this.handleFenChange(fen));
    this.controlsPanel.setOnPerspectiveChange((perspective) => this.handlePerspectiveChange(perspective));
    this.controlsPanel.setOnProfileChange((profileName) => this.handleProfileChange(profileName));
    this.controlsPanel.setOnAnalysisStart(() => this.handleAnalysisStart());
    this.controlsPanel.setOnAnalysisStop(() => this.handleAnalysisStop());

    // DrillDown View events
    this.drillDownView.setOnPositionClick((index) => this.handlePositionClick(index));

    // Move History events
    this.moveHistory.setOnMoveClick((index) => this.handleMoveHistoryClick(index));

    // Profile Editor events
    this.profileEditor.setOnProfileChange((profile) => {
      console.log('Profile changed:', profile);
      this.state.currentProfile = profile.name;
      this.controlsPanel.setProfile(profile.name);
    });

    // Render ProfileEditor
    this.profileEditor.render();

    // Properties modal controls
    const propertiesBtn = document.getElementById('properties-btn');
    const propertiesModal = document.getElementById('properties-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    if (propertiesBtn && propertiesModal) {
      propertiesBtn.addEventListener('click', () => {
        propertiesModal.style.display = 'flex';
      });
    }

    if (closeModalBtn && propertiesModal) {
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

    // Browser events
    window.addEventListener('beforeunload', () => this.saveState());
    window.addEventListener('resize', () => this.handleResize());
  }

  private handleSquareClick(square: string): void {
    const selectedSquare = this.boardView.getSelectedSquare();

    if (!selectedSquare) {
      // No square selected - select this square if it has a piece
      const destinations = this.chessGame.getLegalDestinations(square);
      if (destinations.length > 0) {
        this.boardView.selectSquare(square);
        this.boardView.highlightMoves(destinations);
      }
    } else {
      // Square already selected - try to make a move
      if (selectedSquare === square) {
        // Clicked same square - deselect
        this.boardView.clearSelection();
        this.boardView.clearHighlights();
      } else {
        // Try to make a move
        const move = this.chessGame.makeMove(selectedSquare, square);
        if (move) {
          // Move successful
          console.log('Move made:', move.san);
          this.updateAfterMove();
        } else {
          // Invalid move - try selecting the new square
          const destinations = this.chessGame.getLegalDestinations(square);
          if (destinations.length > 0) {
            this.boardView.selectSquare(square);
            this.boardView.highlightMoves(destinations);
          } else {
            this.boardView.clearSelection();
            this.boardView.clearHighlights();
          }
        }
      }
    }
  }

  private handleMoveHistoryClick(index: number): void {
    console.log('Move history clicked:', index);
    // TODO: Navigate to position after move N
    // For now, just highlight the move
  }

  private handleFenChange(fen: string): void {
    console.log('FEN changed:', fen);
    this.loadPosition(fen);
  }

  private handlePerspectiveChange(perspective: 'white' | 'black'): void {
    console.log('Perspective changed:', perspective);
    this.state.perspective = perspective;
    this.flipBoard();
  }

  private handleProfileChange(profileName: string): void {
    console.log('Profile changed:', profileName);
    this.state.currentProfile = profileName;
    // TODO: Trigger re-analysis if analysis is complete
  }

  private handleAnalysisStart(): void {
    console.log('Analysis started');
    this.state.isAnalyzing = true;
    this.state.depth = 0;
    this.state.error = null;

    // TODO: Start actual analysis when engine is implemented
    // For now, simulate analysis with mock data
    this.simulateAnalysis();
  }

  private handleAnalysisStop(): void {
    console.log('Analysis stopped');
    this.state.isAnalyzing = false;
    // TODO: Cancel worker when implemented
  }

  private handlePositionClick(index: number): void {
    console.log('Position clicked:', index);
    const position = this.state.positionHistory[index];
    if (position) {
      this.loadPosition(position.fen);
    }
  }

  private handleResize(): void {
    // Redraw arrows and overlays on resize
    this.arrowLayer.renderMockArrows();
    this.squareOverlay.renderMockOverlays();
  }

  private loadPosition(fen: string): void {
    this.state.currentFen = fen;
    this.controlsPanel.setFen(fen);

    // Load position in chess game
    this.chessGame.loadFen(fen);

    // Render board
    this.boardView.render(fen);

    // Clear selection and highlights
    this.boardView.clearSelection();
    this.boardView.clearHighlights();

    // Clear analysis visualization
    this.arrowLayer.clear();
    this.squareOverlay.clear();

    // Reset depth
    this.controlsPanel.updateDepth(0);

    // Clear move history
    this.moveHistory.clear();

    console.log('Position loaded:', fen);
  }

  private updateAfterMove(): void {
    // Get new position
    const newFen = this.chessGame.getFen();
    this.state.currentFen = newFen;

    // Update board
    this.boardView.render(newFen);
    this.boardView.clearSelection();
    this.boardView.clearHighlights();

    // Update move history
    const moves = this.chessGame.getMoveHistory();
    this.moveHistory.updateMoves(moves);

    // Update FEN input
    this.controlsPanel.setFen(newFen);

    // Check game status
    if (this.chessGame.isCheckmate()) {
      this.controlsPanel.updateStatus('Checkmate!', 'success');
    } else if (this.chessGame.isStalemate()) {
      this.controlsPanel.updateStatus('Stalemate', 'warning');
    } else if (this.chessGame.isInCheck()) {
      this.controlsPanel.updateStatus('Check', 'warning');
    }

    console.log('Position updated after move');
  }

  private flipBoard(): void {
    // TODO: Implement board flipping when perspective changes
    // For now, just re-render
    this.boardView.render(this.state.currentFen);
    console.log('Board flipped to', this.state.perspective, 'perspective');
  }

  private renderMockVisualization(): void {
    // Render mock arrows and overlays for demonstration
    this.arrowLayer.renderMockArrows();
    this.squareOverlay.renderMockOverlays();

    // Update mock metrics
    this.controlsPanel.updateMetrics({
      PV_white: 39,
      PV_black: 39,
      MS_white: 20,
      MS_black: 20,
      AT_white: 0,
      AT_black: 0,
      DF_white: 0,
      DF_black: 0
    });

    // Add mock position history
    const mockHistory: Position[] = [
      {
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        move: null,
        ply: 0
      },
      {
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        move: 'e4',
        ply: 1
      },
      {
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
        move: 'e5',
        ply: 2
      }
    ];

    this.state.positionHistory = mockHistory;
    this.drillDownView.render(mockHistory);
  }

  private simulateAnalysis(): void {
    // Simulate progressive analysis
    let currentDepth = 0;
    const maxDepth = 7;

    const interval = setInterval(() => {
      if (!this.state.isAnalyzing || currentDepth >= maxDepth) {
        clearInterval(interval);
        if (this.state.isAnalyzing) {
          this.state.isAnalyzing = false;
          this.controlsPanel.setAnalyzing(false);
          this.controlsPanel.updateStatus('Analysis complete', 'success');
        }
        return;
      }

      currentDepth++;
      this.state.depth = currentDepth;
      this.controlsPanel.updateDepth(currentDepth, maxDepth);

      console.log(`Analysis progress: depth ${currentDepth}/${maxDepth}`);
    }, 500);
  }

  private saveState(): void {
    try {
      const stateToSave = {
        currentFen: this.state.currentFen,
        perspective: this.state.perspective,
        currentProfile: this.state.currentProfile
      };
      localStorage.setItem('chess-metric-analyzer-state', JSON.stringify(stateToSave));
      console.log('State saved to localStorage');
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  private loadState(): void {
    try {
      const savedState = localStorage.getItem('chess-metric-analyzer-state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        this.state.currentFen = parsed.currentFen || this.state.currentFen;
        this.state.perspective = parsed.perspective || this.state.perspective;
        this.state.currentProfile = parsed.currentProfile || this.state.currentProfile;

        // Update UI
        this.controlsPanel.setFen(this.state.currentFen);
        this.controlsPanel.setProfile(this.state.currentProfile);

        console.log('State loaded from localStorage');
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  }

  // Public API methods

  public getState(): AppState {
    return { ...this.state };
  }

  public getCurrentFen(): string {
    return this.state.currentFen;
  }

  public getCurrentProfile(): string {
    return this.state.currentProfile;
  }

  public isAnalyzing(): boolean {
    return this.state.isAnalyzing;
  }
}
