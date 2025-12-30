/**
 * ProfileEditor Component
 * Manages profile editing: metric weights, piece values, visualization settings
 */

interface Profile {
  name: string;
  description?: string;
  weights: {
    PV: number;
    MS: number;
    AT: number;
    DF: number;
  };
}

interface PieceValues {
  p: number;
  n: number;
  b: number;
  r: number;
  q: number;
  k: number;
}

interface VisualizationSettings {
  arrows: {
    thickness: { first: number; second: number; third: number };
    opacity: { ply1: number; ply2: number; ply3: number };
  };
  squares: {
    intensity: { min: number; max: number; plyMultiplier: number };
  };
}

export class ProfileEditor {
  private container: HTMLElement;
  private profiles: Profile[] = [];
  private currentProfile: Profile | null = null;
  private pieceValues: PieceValues;
  private visualizationSettings: VisualizationSettings;
  private onProfileChange?: (profile: Profile) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    this.visualizationSettings = {
      arrows: {
        thickness: { first: 15, second: 7.5, third: 3.75 },
        opacity: { ply1: 0.8, ply2: 0.6, ply3: 0.4 }
      },
      squares: {
        intensity: { min: 0.1, max: 0.8, plyMultiplier: 0.1 }
      }
    };
    this.loadDefaultProfiles();
  }

  /**
   * Load default profiles from configuration
   */
  private async loadDefaultProfiles(): Promise<void> {
    try {
      const response = await fetch('/src/config/defaultProfiles.json');
      const data = await response.json();
      this.profiles = data.profiles;
      this.currentProfile = this.profiles.find(p => p.name === data.default) || this.profiles[0];
    } catch (error) {
      console.error('Failed to load profiles:', error);
      // Fallback to hardcoded balanced profile
      this.profiles = [{
        name: 'Balanced',
        description: 'Equal weight to all metrics',
        weights: { PV: 1.0, MS: 1.0, AT: 1.0, DF: 1.0 }
      }];
      this.currentProfile = this.profiles[0];
    }
  }

  /**
   * Load piece values from configuration
   */
  private async loadPieceValues(): Promise<void> {
    try {
      const response = await fetch('/src/config/defaultPieceValues.json');
      this.pieceValues = await response.json();
    } catch (error) {
      console.error('Failed to load piece values:', error);
    }
  }

  /**
   * Load visualization settings from configuration
   */
  private async loadVisualizationSettings(): Promise<void> {
    try {
      const response = await fetch('/src/config/visualizationDefaults.json');
      const data = await response.json();
      this.visualizationSettings = {
        arrows: data.arrows,
        squares: data.squares
      };
    } catch (error) {
      console.error('Failed to load visualization settings:', error);
    }
  }

  /**
   * Set callback for profile changes
   */
  public setOnProfileChange(callback: (profile: Profile) => void): void {
    this.onProfileChange = callback;
  }

  /**
   * Render the profile editor UI
   */
  public async render(): Promise<void> {
    await this.loadDefaultProfiles();
    await this.loadPieceValues();
    await this.loadVisualizationSettings();

    this.container.innerHTML = `
      <div class="profile-editor">
        <!-- Profile Selection -->
        <div class="editor-section">
          <h3>Profile</h3>
          <div class="control-group">
            <label for="profile-selector">Select Profile:</label>
            <select id="profile-selector" class="profile-selector">
              ${this.profiles.map(p => `
                <option value="${p.name}" ${p.name === this.currentProfile?.name ? 'selected' : ''}>
                  ${p.name}
                </option>
              `).join('')}
            </select>
          </div>
          ${this.currentProfile?.description ? `
            <p class="profile-description">${this.currentProfile.description}</p>
          ` : ''}
        </div>

        <!-- Metric Weights -->
        <div class="editor-section">
          <h3>Metric Weights</h3>
          ${this.renderMetricSliders()}
        </div>

        <!-- Piece Values -->
        <div class="editor-section">
          <h3>Piece Values</h3>
          ${this.renderPieceValueInputs()}
        </div>

        <!-- Visualization Settings -->
        <div class="editor-section">
          <h3>Visualization Tuning</h3>
          ${this.renderVisualizationControls()}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * Render metric weight sliders
   */
  private renderMetricSliders(): string {
    if (!this.currentProfile) return '';

    const metrics = [
      { key: 'PV', label: 'PV (Material)', description: 'Piece value advantage' },
      { key: 'MS', label: 'MS (Mobility)', description: 'Number of legal moves' },
      { key: 'AT', label: 'AT (Attack)', description: 'Attacking opponent pieces' },
      { key: 'DF', label: 'DF (Defense)', description: 'Defending own pieces' }
    ];

    return metrics.map(metric => {
      const value = this.currentProfile!.weights[metric.key as keyof typeof this.currentProfile.weights];
      return `
        <div class="slider-group">
          <div class="slider-header">
            <label for="weight-${metric.key}">${metric.label}</label>
            <span class="slider-value" id="value-${metric.key}">${value.toFixed(1)}</span>
          </div>
          <input
            type="range"
            id="weight-${metric.key}"
            class="metric-slider"
            data-metric="${metric.key}"
            min="0"
            max="3"
            step="0.1"
            value="${value}"
          />
          <p class="slider-description">${metric.description}</p>
        </div>
      `;
    }).join('');
  }

  /**
   * Render piece value inputs
   */
  private renderPieceValueInputs(): string {
    const pieces = [
      { key: 'p', label: 'Pawn', symbol: '♟' },
      { key: 'n', label: 'Knight', symbol: '♞' },
      { key: 'b', label: 'Bishop', symbol: '♝' },
      { key: 'r', label: 'Rook', symbol: '♜' },
      { key: 'q', label: 'Queen', symbol: '♛' },
      { key: 'k', label: 'King', symbol: '♚' }
    ];

    return `
      <div class="piece-values-grid">
        ${pieces.map(piece => `
          <div class="piece-value-item">
            <label for="piece-${piece.key}">
              <span class="piece-symbol">${piece.symbol}</span>
              ${piece.label}
            </label>
            <input
              type="number"
              id="piece-${piece.key}"
              class="piece-value-input"
              data-piece="${piece.key}"
              min="0"
              max="20"
              step="0.5"
              value="${this.pieceValues[piece.key as keyof PieceValues]}"
              ${piece.key === 'k' ? 'disabled' : ''}
            />
          </div>
        `).join('')}
      </div>
      <p class="piece-values-note">Note: King value is always 0 (invaluable)</p>
    `;
  }

  /**
   * Render visualization tuning controls
   */
  private renderVisualizationControls(): string {
    return `
      <hr class="viz-separator" />
      <div class="viz-controls viz-disabled">
        <p class="viz-notice">Visualization settings (coming soon)</p>

        <!-- Arrow Opacity -->
        <div class="viz-group">
          <h4>Arrow Opacity by Ply</h4>
          <div class="slider-group">
            <div class="slider-header">
              <label for="opacity-ply1">Ply 1</label>
              <span class="slider-value" id="value-opacity-ply1">${this.visualizationSettings.arrows.opacity.ply1.toFixed(1)}</span>
            </div>
            <input type="range" id="opacity-ply1" class="viz-slider" data-viz="opacity-ply1"
                   min="0" max="1" step="0.1" value="${this.visualizationSettings.arrows.opacity.ply1}" disabled />
          </div>
          <div class="slider-group">
            <div class="slider-header">
              <label for="opacity-ply2">Ply 2</label>
              <span class="slider-value" id="value-opacity-ply2">${this.visualizationSettings.arrows.opacity.ply2.toFixed(1)}</span>
            </div>
            <input type="range" id="opacity-ply2" class="viz-slider" data-viz="opacity-ply2"
                   min="0" max="1" step="0.1" value="${this.visualizationSettings.arrows.opacity.ply2}" disabled />
          </div>
          <div class="slider-group">
            <div class="slider-header">
              <label for="opacity-ply3">Ply 3</label>
              <span class="slider-value" id="value-opacity-ply3">${this.visualizationSettings.arrows.opacity.ply3.toFixed(1)}</span>
            </div>
            <input type="range" id="opacity-ply3" class="viz-slider" data-viz="opacity-ply3"
                   min="0" max="1" step="0.1" value="${this.visualizationSettings.arrows.opacity.ply3}" disabled />
          </div>
        </div>

        <!-- Square Intensity -->
        <div class="viz-group">
          <h4>Square Color Intensity</h4>
          <div class="slider-group">
            <div class="slider-header">
              <label for="intensity-min">Minimum</label>
              <span class="slider-value" id="value-intensity-min">${this.visualizationSettings.squares.intensity.min.toFixed(1)}</span>
            </div>
            <input type="range" id="intensity-min" class="viz-slider" data-viz="intensity-min"
                   min="0" max="1" step="0.1" value="${this.visualizationSettings.squares.intensity.min}" disabled />
          </div>
          <div class="slider-group">
            <div class="slider-header">
              <label for="intensity-max">Maximum</label>
              <span class="slider-value" id="value-intensity-max">${this.visualizationSettings.squares.intensity.max.toFixed(1)}</span>
            </div>
            <input type="range" id="intensity-max" class="viz-slider" data-viz="intensity-max"
                   min="0" max="1" step="0.1" value="${this.visualizationSettings.squares.intensity.max}" disabled />
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners to UI elements
   */
  private attachEventListeners(): void {
    // Profile selector
    const profileSelector = document.getElementById('profile-selector') as HTMLSelectElement;
    if (profileSelector) {
      profileSelector.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        this.handleProfileChange(target.value);
      });
    }

    // Metric weight sliders
    const metricSliders = document.querySelectorAll('.metric-slider');
    metricSliders.forEach(slider => {
      slider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.handleMetricWeightChange(target.dataset.metric!, parseFloat(target.value));
      });
    });

    // Piece value inputs
    const pieceInputs = document.querySelectorAll('.piece-value-input');
    pieceInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        this.handlePieceValueChange(target.dataset.piece!, parseFloat(target.value));
      });
    });

    // Visualization sliders
    const vizSliders = document.querySelectorAll('.viz-slider');
    vizSliders.forEach(slider => {
      slider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.handleVisualizationChange(target.dataset.viz!, parseFloat(target.value));
      });
    });
  }

  /**
   * Handle profile selection change
   */
  private handleProfileChange(profileName: string): void {
    const profile = this.profiles.find(p => p.name === profileName);
    if (profile) {
      this.currentProfile = profile;
      this.updateMetricSliders(); // Update sliders without full re-render
      this.updateProfileDescription(); // Update description
    }

    if (this.onProfileChange && this.currentProfile) {
      this.onProfileChange(this.currentProfile);
    }
  }

  /**
   * Update metric sliders to match current profile
   */
  private updateMetricSliders(): void {
    if (!this.currentProfile) return;

    const metrics = ['PV', 'MS', 'AT', 'DF'];
    metrics.forEach(metric => {
      const slider = document.getElementById(`weight-${metric}`) as HTMLInputElement;
      const valueDisplay = document.getElementById(`value-${metric}`);

      if (slider && valueDisplay) {
        const value = this.currentProfile!.weights[metric as keyof typeof this.currentProfile.weights];
        slider.value = value.toString();
        valueDisplay.textContent = value.toFixed(1);
      }
    });
  }

  /**
   * Update profile description
   */
  private updateProfileDescription(): void {
    const descriptionElement = document.querySelector('.profile-description');
    if (descriptionElement && this.currentProfile?.description) {
      descriptionElement.textContent = this.currentProfile.description;
    }
  }

  /**
   * Handle metric weight slider change
   */
  private handleMetricWeightChange(metric: string, value: number): void {
    if (!this.currentProfile) return;

    // Update the weight
    this.currentProfile.weights[metric as keyof typeof this.currentProfile.weights] = value;

    // Update the display value
    const valueDisplay = document.getElementById(`value-${metric}`);
    if (valueDisplay) {
      valueDisplay.textContent = value.toFixed(1);
    }

    if (this.onProfileChange) {
      this.onProfileChange(this.currentProfile);
    }
  }

  /**
   * Handle piece value input change
   */
  private handlePieceValueChange(piece: string, value: number): void {
    this.pieceValues[piece as keyof PieceValues] = value;
    console.log('Piece values updated:', this.pieceValues);
    // TODO: Trigger re-analysis if needed
  }

  /**
   * Handle visualization setting change
   */
  private handleVisualizationChange(setting: string, value: number): void {
    // Update the value display
    const valueDisplay = document.getElementById(`value-${setting}`);
    if (valueDisplay) {
      valueDisplay.textContent = value.toFixed(1);
    }

    // Update the setting
    if (setting.startsWith('opacity-')) {
      const ply = setting.replace('opacity-', '');
      this.visualizationSettings.arrows.opacity[ply as keyof typeof this.visualizationSettings.arrows.opacity] = value;
    } else if (setting.startsWith('intensity-')) {
      const type = setting.replace('intensity-', '');
      this.visualizationSettings.squares.intensity[type as keyof typeof this.visualizationSettings.squares.intensity] = value;
    }

    console.log('Visualization settings updated:', this.visualizationSettings);
    // TODO: Update visualization in real-time
  }

  /**
   * Get current profile
   */
  public getCurrentProfile(): Profile | null {
    return this.currentProfile;
  }

  /**
   * Get current piece values
   */
  public getPieceValues(): PieceValues {
    return { ...this.pieceValues };
  }

  /**
   * Get current visualization settings
   */
  public getVisualizationSettings(): VisualizationSettings {
    return JSON.parse(JSON.stringify(this.visualizationSettings));
  }

  /**
   * Save current profile
   */
  public saveProfile(name: string): void {
    if (!this.currentProfile) return;

    const newProfile: Profile = {
      name,
      description: 'User-saved profile',
      weights: { ...this.currentProfile.weights }
    };

    // Check if profile already exists
    const existingIndex = this.profiles.findIndex(p => p.name === name);
    if (existingIndex >= 0) {
      this.profiles[existingIndex] = newProfile;
    } else {
      this.profiles.push(newProfile);
    }

    this.currentProfile = newProfile;
    this.render();

    console.log('Profile saved:', name);
    // TODO: Persist to localStorage or IndexedDB
  }
}
