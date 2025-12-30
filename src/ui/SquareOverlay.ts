/**
 * SquareOverlay Component
 * Renders colored overlays on squares (green/red with intensity)
 */

interface SquareEvaluation {
  rank: number;
  file: number;
  type: 'favorable' | 'unfavorable' | 'neutral';
  intensity: number; // 0-8 (based on ply depth)
}

export class SquareOverlay {
  private container: HTMLElement;
  private overlays: HTMLElement[][] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.initialize();
  }

  /**
   * Initialize 8x8 grid of overlay elements
   */
  private initialize(): void {
    this.container.innerHTML = '';
    this.overlays = [];

    for (let rank = 0; rank < 8; rank++) {
      const rankArray: HTMLElement[] = [];
      this.overlays[rank] = rankArray;

      for (let file = 0; file < 8; file++) {
        const overlay = document.createElement('div');
        overlay.className = 'square-overlay-item neutral';
        overlay.dataset.rank = rank.toString();
        overlay.dataset.file = file.toString();
        overlay.dataset.intensity = '0';

        this.container.appendChild(overlay);
        rankArray[file] = overlay;
      }
    }
  }

  /**
   * Render mock overlays for demonstration
   */
  public renderMockOverlays(): void {
    const mockEvaluations: SquareEvaluation[] = [
      // Favorable squares (green) - center control
      { rank: 4, file: 4, type: 'favorable', intensity: 5 },
      { rank: 4, file: 3, type: 'favorable', intensity: 4 },
      { rank: 3, file: 4, type: 'favorable', intensity: 3 },
      { rank: 3, file: 3, type: 'favorable', intensity: 3 },

      // Unfavorable squares (red) - opponent control
      { rank: 1, file: 4, type: 'unfavorable', intensity: 2 },
      { rank: 1, file: 3, type: 'unfavorable', intensity: 2 },
    ];

    this.renderEvaluations(mockEvaluations);
  }

  /**
   * Render evaluations on squares
   */
  public renderEvaluations(evaluations: SquareEvaluation[]): void {
    // Reset all overlays to neutral
    this.overlays.forEach(row => {
      row.forEach(overlay => {
        if (overlay) {
          overlay.className = 'square-overlay-item neutral';
          overlay.dataset.intensity = '0';
        }
      });
    });

    // Apply evaluations
    evaluations.forEach(evaluation => {
      const overlay = this.overlays[evaluation.rank]?.[evaluation.file];
      if (!overlay) return;

      overlay.className = `square-overlay-item ${evaluation.type}`;
      overlay.dataset.intensity = evaluation.intensity.toString();
    });
  }

  /**
   * Update a single square's evaluation
   */
  public updateSquare(
    rank: number,
    file: number,
    type: 'favorable' | 'unfavorable' | 'neutral',
    intensity: number
  ): void {
    const overlay = this.overlays[rank]?.[file];
    if (!overlay) return;

    overlay.className = `square-overlay-item ${type} updating`;
    overlay.dataset.intensity = intensity.toString();

    // Remove updating class after animation
    setTimeout(() => {
      overlay.classList.remove('updating');
    }, 300);
  }

  /**
   * Clear all overlays
   */
  public clear(): void {
    this.overlays.forEach(row => {
      row.forEach(overlay => {
        if (overlay) {
          overlay.className = 'square-overlay-item neutral';
          overlay.dataset.intensity = '0';
        }
      });
    });
  }
}
