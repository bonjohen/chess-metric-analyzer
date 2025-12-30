# Chess Metric Analyzer

A transparent, metric-driven chess analysis tool that visualizes move trees with progressive depth evaluation.

## Overview

This tool performs bounded, deterministic chess analysis by building a move tree, computing transparent board metrics, and visualizing long-horizon consequences in a human-interpretable way.

### Key Features

- **Deep Analysis**: Calculates 7 plies deep but displays only 3 plies for clarity
- **Transparent Metrics**: Uses 4 clear board metrics per side:
  - **PV**: Material value (piece points)
  - **MS**: Mobility (empty squares reachable)
  - **AT**: Attack pressure (opponent pieces under attack)
  - **DF**: Defense strength (own pieces defended)
- **Visual Feedback**:
  - **Arrows**: Show candidate moves (thickness = sequence rank: thick=1st, medium=2nd, thin=3rd)
  - **Square Colors**: Green/red evaluation (intensity = confidence depth)
  - **Progressive Updates**: Real-time feedback as computation deepens
- **Player Profiles**: Aggressive, Defensive, Positional, Balanced, Custom
- **Perspective Toggle**: View from White or Black's perspective
- **Drill-Down**: Click arrows to explore deeper positions

## Project Status

**Current Phase**: Phase 1 Complete - Project Foundation & Setup ✓

See [docs/ProjectPlan.md](docs/ProjectPlan.md) for the full development roadmap.

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Lint code
- `npm run lint:fix` - Lint and fix code
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types

## Architecture

- **Browser-first**: Runs in web workers for responsiveness
- **Bounded Search**: Fixed 2-move branching, 128 max leaf nodes
- **Client-side Caching**: IndexedDB for performance
- **Progressive Computation**: Updates UI as each ply completes

## Documentation

- [Detailed Design](docs/detaildDesign.md) - Complete specification
- [Project Plan](docs/ProjectPlan.md) - Development roadmap
- [Glossary](docs/glossary.md) - Terms and definitions

## License

MIT
