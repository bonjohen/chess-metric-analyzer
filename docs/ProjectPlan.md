# Chess Metric Analyzer - Project Plan

**Status**: Initial Development  
**Last Updated**: 2025-12-30  
**Approach**: Front-end first, iterative backend development

---

## Overview

This project is currently in the **setup phase** with a complete specification (see `detaildDesign.md`) but most implementation files are empty placeholders. The plan follows a **front-end first** approach, building visible, testable components before moving to deeper engine logic.

---

## Phase 1: Project Foundation & Setup ✅ COMPLETE

### 1.1 Build Configuration ✅
- [x] **package.json** - Define dependencies and scripts
  - TypeScript, Vite, chess.js (or similar library)
  - Testing framework (Vitest recommended)
  - Linting and formatting tools
- [x] **tsconfig.json** - TypeScript compiler configuration
- [x] **vite.config.ts** - Vite bundler configuration with worker support
- [x] **Verify build scripts** work (`scripts/build.sh`, `scripts/dev.sh`)

### 1.2 Core Configuration Files ✅
- [x] **src/config/defaultPieceValues.json** - Standard piece values (P=1, N=3, B=3, R=5, Q=9)
- [x] **src/config/defaultProfiles.json** - Player profiles (Aggressive, Defensive, Positional, Balanced)
- [x] **src/config/visualizationDefaults.json** - Arrow thickness, color intensity, opacity settings

### 1.3 Test Infrastructure ✅
- [x] **tests/fixtures/positions.fen** - Test positions (starting position, tactical puzzles, endgames)
- [x] **tests/fixtures/expectedMetrics.json** - Expected metric values for test positions
- [x] Set up test runner and basic test structure
- [x] All tests passing (5 active, 10 skipped placeholders)

---

## Phase 2: Front-End Development (UI Layer) ✅ COMPLETE (2.1-2.3)

**Goal**: Create a visible, interactive chess board with mock data before implementing engine logic.

### 2.1 HTML Foundation ✅
- [x] **index.html** - Main HTML structure
  - Header with title and status indicators
  - Three-column grid layout (controls | board | drill-down)
  - Board container with nested layers (squares, overlays, arrows)
  - Controls panel (FEN input, profile selector, perspective toggle, metrics)
  - Properties modal (hidden by default)
  - Loading/status indicators

### 2.2 CSS Styling ✅
- [x] **src/styles/app.css** - Main application layout and controls
  - CSS variables for colors, spacing, transitions
  - Grid layout (300px | 1fr | 300px) with responsive breakpoints
  - Panel styling, form controls, buttons, modal

- [x] **src/styles/board.css** - Chess board grid, squares, pieces
  - 8x8 grid layout (600px base, responsive to 400px)
  - Light/dark square colors (#f0d9b5 / #b58863)
  - Unicode chess pieces with text shadows
  - Square coordinates (a-h, 1-8)
  - Hover effects and selection highlights

- [x] **src/styles/arrows.css** - Arrow rendering (SVG overlay, thickness variations)
  - **Thickness by sequence rank**: rank-1 (15px/20%), rank-2 (7.5px/10%), rank-3 (3.75px/5%)
  - **Opacity by ply depth**: ply-1 (0.8), ply-2 (0.6), ply-3 (0.4)
  - Fixed-size arrowheads (30x30px)
  - Responsive thickness scaling for different board sizes
  - Single color scheme (#4a90e2)

- [x] **src/styles/overlays.css** - Square coloring (green/red with intensity levels)
  - Green for favorable (rgba(76, 175, 80, intensity))
  - Red for unfavorable (rgba(244, 67, 54, intensity))
  - Intensity levels 0-8 (based on ply depth)
  - Fade-in and pulse animations
  - Responsive sizing

### 2.3 Board Visualization Components ✅
- [x] **src/ui/BoardView.ts** - Main board rendering
  - Parses FEN and renders 8x8 grid
  - Creates squares with light/dark coloring
  - Renders pieces using Unicode characters
  - Adds file/rank coordinates
  - Click handlers for square selection
  - Preserves overlay and arrow layers when clearing/rendering
  - Inserts squares before overlay layers to maintain z-index
  - Methods: `render()`, `clear()`, `getSquare()`

- [x] **src/ui/ArrowLayer.ts** - Arrow rendering system
  - SVG-based arrow rendering with dynamic viewBox
  - Arrow interface: `{ from, to, rank, ply, isBest }`
  - Fixed-size arrowhead markers (30x30px, doesn't scale with stroke)
  - **L-shaped arrows for knight moves** (2 squares + 1 perpendicular)
  - Straight arrows for all other moves (100% distance center-to-center)
  - Dynamic square size calculation for responsive scaling
  - Mock arrows for demonstration (14 arrows total):
    - 2 white pawn moves (e2-e4, d2-d4) - rank 1, thickest
    - 4 black pawn moves (e7-e5, d7-d5, c7-c5, f7-f5) - rank 2, medium
    - 8 white moves - rank 3, thinnest:
      - 4 knight moves: Nb1-a3, Nb1-c3, Ng1-f3, Ng1-h3 (L-shaped)
      - 4 pieces freed by pawns: Bf1-e2, Bf1-d3, Qd1-d2, Bc1-d2 (straight)
  - Methods: `renderArrows()`, `renderMockArrows()`, `clear()`, `getSquareSize()`

- [x] **src/ui/SquareOverlay.ts** - Square coloring system
  - 8x8 grid of overlay divs
  - Evaluation interface: `{ rank, file, type, intensity }`
  - Types: favorable (green), unfavorable (red), neutral
  - Intensity 0-8 mapped to opacity
  - Mock overlays for demonstration (6 squares colored)
  - Methods: `renderEvaluations()`, `updateSquare()`, `clear()`

- [x] **src/main.ts** - Application entry point
  - Imports all CSS files
  - Initializes BoardView, ArrowLayer, SquareOverlay
  - Renders starting position with mock data
  - Console logging for debugging

### 2.4 Control & Configuration UI (NOT STARTED)
- [ ] **src/ui/ControlsPanel.ts** - Main controls
  - FEN input field
  - Perspective toggle (White/Black)
  - Profile selector dropdown
  - Depth indicator display
  - Start/stop analysis button

- [ ] **src/ui/ProfileEditor.ts** - Properties panel
  - Metric weight sliders (PV, MS, AT, DF)
  - Piece value editors
  - Profile save/load
  - Visualization tuning controls

- [ ] **src/ui/DrillDownView.ts** - Multi-board drill-down
  - Display parent boards
  - Navigation between positions
  - Breadcrumb trail

### 2.5 Application Controller (NOT STARTED)
- [ ] **src/app.ts** - Application controller
  - Coordinate UI components
  - Handle user interactions
  - Manage application state
  - Connect UI to engine (Phase 3)

---

## Phase 3: Data Models & Type Definitions

**Goal**: Define TypeScript interfaces and data structures used throughout the application.

### 3.1 Core Models
- [ ] **src/models/Metrics.ts** - Metric data structure
  ```typescript
  interface Metrics {
    PV_white: number; PV_black: number;
    MS_white: number; MS_black: number;
    AT_white: number; AT_black: number;
    DF_white: number; DF_black: number;
  }
  ```

- [ ] **src/models/Node.ts** - Tree node structure
  ```typescript
  interface Node {
    fen: string;
    move: string | null;
    metrics: Metrics;
    children: Node[];
    ply: number;
  }
  ```

- [ ] **src/models/Profile.ts** - Player profile structure
  ```typescript
  interface Profile {
    name: string;
    weights: { PV: number; MS: number; AT: number; DF: number; };
  }
  ```

- [ ] **src/models/CacheKey.ts** - Cache key generation
  - Hash FEN + depth + profile + piece values

### 3.2 Engine Types
- [ ] **src/engine/types.ts** - Engine-specific types
  - Move representation
  - Evaluation results
  - Progress callbacks
  - Worker messages

---

## Phase 4: Utility Functions

**Goal**: Implement helper functions needed by both UI and engine.

### 4.1 Chess Utilities
- [ ] **src/utils/chess.ts** - Chess logic helpers
  - FEN parsing and validation
  - Move validation
  - Coordinate conversions (e.g., "e2" ↔ [4,1])

- [ ] **src/utils/fen.ts** - FEN manipulation
  - Parse FEN components
  - Apply move to FEN
  - Generate FEN from position

### 4.2 Visualization Utilities
- [ ] **src/utils/colors.ts** - Color generation
  - Green/red gradients
  - Intensity mapping (ply depth → opacity)
  - Perspective-aware coloring

- [ ] **src/utils/math.ts** - Mathematical helpers
  - Normalization functions
  - Interpolation
  - Score calculations

### 4.3 System Utilities
- [ ] **src/utils/hashing.ts** - Cache key hashing
  - Fast hash function for cache keys
  - Consistent serialization

---

## Phase 5: Engine Core (Backend Logic)

**Goal**: Implement the chess analysis engine that powers the visualization.

### 5.1 Metric Calculation
- [ ] **src/engine/MetricCalculator.ts** - Compute all 8 metrics
  - **PV**: Sum piece values
  - **MS**: Count legal non-capturing moves to empty squares
  - **AT**: Sum attacked opponent piece values (counted per attacker)
  - **DF**: Sum defended own piece values (counted per defender)
  - Efficient attack/defense map generation

### 5.2 Move Generation
- [ ] **src/engine/MoveGenerator.ts** - Legal move generation
  - Generate all legal moves for a position
  - Integration with chess library (chess.js or custom)
  - Move ordering for efficiency

### 5.3 Scoring & Evaluation
- [ ] **src/engine/Scoring.ts** - Position evaluation
  - Calculate advantage deltas (leaf - root)
  - Apply profile weights
  - Rank moves by root → ply-7 score
  - Select top-2 moves per ply

### 5.4 Tree Construction
- [ ] **src/engine/TreeBuilder.ts** - Build move tree
  - Expand to 7 plies with top-2 branching
  - Maximum 128 leaf nodes
  - Progressive computation with callbacks
  - Prune and refine as depth increases

### 5.5 Compute Engine Interface
- [ ] **src/engine/ComputeEngine.ts** - Abstract engine interface
  - Define engine contract
  - Progress callbacks
  - Cancellation support

- [ ] **src/engine/BrowserComputeEngine.ts** - Browser implementation
  - Coordinate web workers
  - Manage computation lifecycle
  - Handle progressive updates

---

## Phase 6: Web Workers

**Goal**: Offload computation to background threads for UI responsiveness.

### 6.1 Worker Implementation
- [ ] **src/workers/analysisWorker.ts** - Main analysis worker
  - Receive FEN + configuration
  - Build move tree progressively
  - Send updates per ply completion
  - Handle cancellation

- [ ] **src/workers/metricWorker.ts** - Metric calculation worker (optional)
  - Parallel metric computation
  - Batch processing

### 6.2 Worker Communication
- [ ] Define message protocol (request/response types)
- [ ] Implement progress reporting
- [ ] Handle errors and timeouts

---

## Phase 7: Storage & Caching

**Goal**: Persist analyses and user preferences for performance and UX.

### 7.1 IndexedDB Integration
- [ ] **src/storage/IndexedDB.ts** - Database wrapper
  - Initialize database schema
  - CRUD operations
  - Error handling

### 7.2 Caching Layer
- [ ] **src/storage/TreeCache.ts** - Cache computed trees
  - Store by cache key (FEN + config hash)
  - Retrieve cached analyses
  - Eviction policy (LRU or size-based)

- [ ] **src/storage/ProfileStore.ts** - Persist user profiles
  - Save custom profiles
  - Load profiles
  - Default profile management

---

## Phase 8: Testing

**Goal**: Ensure correctness and reliability through comprehensive tests.

### 8.1 Unit Tests
- [ ] **tests/engine/metricCalculator.test.ts** - Metric calculation tests
  - Test each metric (PV, MS, AT, DF) independently
  - Use fixture positions with known expected values
  
- [ ] **tests/engine/moveGenerator.test.ts** - Move generation tests
  - Verify legal move counts
  - Test special cases (castling, en passant, promotion)
  
- [ ] **tests/engine/scoring.test.ts** - Scoring tests
  - Test advantage calculations
  - Test profile weight application
  - Test move ranking

### 8.2 Integration Tests
- [ ] **tests/tree/treeBuilder.test.ts** - Tree construction tests
  - Verify branching factor (top-2)
  - Verify depth (7 plies)
  - Verify max leaf nodes (128)
  - Test progressive computation

### 8.3 End-to-End Tests
- [ ] Full analysis workflow
- [ ] UI interaction tests
- [ ] Cache persistence tests

---

## Phase 9: Tools & Debugging

**Goal**: Developer tools for testing and debugging.

- [ ] **tools/debug-visualizer.ts** - Visualize tree structure
  - Print tree to console
  - Export tree as JSON
  - Metric inspection

- [ ] **tools/pgn-importer.ts** - Import PGN games
  - Parse PGN files
  - Extract positions for testing
  - Generate test fixtures

---

## Phase 10: Polish & Optimization

**Goal**: Refine UX and performance.

### 10.1 Performance
- [ ] Profile and optimize metric calculation
- [ ] Optimize arrow rendering (canvas vs SVG)
- [ ] Lazy loading for drill-down boards
- [ ] Worker pool management

### 10.2 User Experience
- [ ] Loading states and animations
- [ ] Error messages and validation
- [ ] Keyboard shortcuts
- [ ] Responsive design for mobile
- [ ] Accessibility (ARIA labels, keyboard navigation)

### 10.3 Documentation
- [ ] **README.md** - Project overview and quick start
- [ ] Populate empty docs (glossary.md, architecture docs)
- [ ] Code comments and JSDoc
- [ ] User guide

---

## Development Workflow

### Iteration 1: Visible Board (Weeks 1-2) ✅ COMPLETE
1. ✅ Complete Phase 1 (Setup)
2. ✅ Complete Phase 2.1-2.3 (Board UI with mock data)
3. [ ] Complete Phase 3 (Data models)
4. **Milestone**: ✅ Display a chess board with mock arrows and coloring
   - Chess board displays correctly with pieces from FEN
   - 14 mock arrows with L-shaped knight moves
   - Fixed-size arrowheads (30x30px)
   - Square overlays with green/red coloring
   - Fully responsive (600px → 400px)
   - Dev server running at http://localhost:3001/

### Iteration 2: Interactive Controls (Week 3)
1. Complete Phase 2.4-2.5 (Controls and app structure)
2. Complete Phase 4 (Utilities)
3. **Milestone**: Load FEN, toggle perspective, select profiles (still with mock data)

### Iteration 3: Engine Integration (Weeks 4-5)
1. Complete Phase 5 (Engine core)
2. Complete Phase 6 (Workers)
3. Connect UI to real engine
4. **Milestone**: Real analysis with progressive updates

### Iteration 4: Persistence & Testing (Week 6)
1. Complete Phase 7 (Storage)
2. Complete Phase 8 (Testing)
3. **Milestone**: Cached analyses, comprehensive test coverage

### Iteration 5: Polish (Week 7+)
1. Complete Phase 9 (Tools)
2. Complete Phase 10 (Polish)
3. **Milestone**: Production-ready application

---

## Success Criteria

- [x] Display chess board with pieces from FEN
- [x] Show 14 arrows (2+4+8) with correct thickness (sequence-based)
- [x] L-shaped arrows for knight moves
- [x] Fixed-size arrowheads that don't scale with arrow thickness
- [x] Color squares green/red with intensity based on depth
- [x] Responsive design - arrows and overlays scale with board size
- [ ] Progressive updates from ply 1 to ply 7
- [ ] Perspective toggle recolors without recomputation
- [ ] Profile selection changes move rankings
- [ ] Drill-down creates new analysis from clicked move
- [ ] Analysis completes in <5 seconds for typical positions
- [ ] Cached positions load instantly
- [ ] All tests pass

---

## Notes

- **Arrow Thickness**: Represents **sequence rank** (1st=20%, 2nd=10%, 3rd=5% of square width)
- **Arrowhead Size**: Fixed at 30x30px, doesn't scale with arrow thickness
- **Knight Moves**: L-shaped arrows (2 squares in one direction, 1 perpendicular)
- **Responsive Design**: All layers (board, arrows, overlays) scale together
- **Layer Hierarchy**: Squares → Overlays (z-index: 5) → Arrows (z-index: 10)
- **HTML Structure**: Arrow and overlay layers are children of chess-board for proper positioning
- **Front-end first**: Build UI with mock data before engine logic
- **Iterative**: Each iteration produces a working, testable increment
- **Test-driven**: Write tests alongside implementation
- **Progressive**: Support incremental updates from the start

---

## Next Steps

1. [x] Review and approve this plan
2. [x] Complete Phase 1: Set up package.json and build configuration
3. [x] Create initial HTML structure and CSS
4. [x] Build board visualization with mock data
5. [ ] Complete Phase 3: Define data models and type definitions
6. [ ] Complete Phase 2.4-2.5: Implement controls and application controller
7. [ ] Begin Phase 4: Implement utility functions

## Review feedback

Possible revisions:
We may want to introduce a lightweight “Engine Skeleton” phase between Phases 2 and 5, whose sole responsibility is to return synthetic but structurally correct analysis data (tree shape, per-ply callbacks, fake metrics that change monotonically with depth). This would let us validate progressive computation, arrow stability rules, caching keys, and worker messaging before real chess logic is involved, reducing risk when integrating MetricCalculator and MoveGenerator later. 

Additionally, consider explicitly separating metric computation correctness tests from tree-selection policy tests (top-2 refinement), as these fail for different reasons and benefit from different fixtures. Finally, we might optionally add a small “determinism audit” checklist (fixed ordering, stable hashes, reproducible results) to Phase 10, since determinism is a core non-goal of engines but a core goal of this tool.