/**
 * ControlsPanel Component
 * Manages the left panel controls: FEN input, perspective toggle, profile selection, analysis controls
 */

export class ControlsPanel {
  private container: HTMLElement;

  // DOM elements
  private fenInput: HTMLInputElement;
  private loadFenBtn: HTMLButtonElement;
  private profileSelect: HTMLSelectElement;
  private perspectiveWhiteBtn: HTMLButtonElement;
  private perspectiveBlackBtn: HTMLButtonElement;
  private analyzeBtn: HTMLButtonElement;
  private stopBtn: HTMLButtonElement;
  private statusDisplay: HTMLElement;
  private depthDisplay: HTMLElement;

  // Metric displays
  private metricPV: HTMLElement;
  private metricMS: HTMLElement;
  private metricAT: HTMLElement;
  private metricDF: HTMLElement;

  // Callbacks
  private onFenChangeCallback?: (fen: string) => void;
  private onPerspectiveChangeCallback?: (perspective: 'white' | 'black') => void;
  private onProfileChangeCallback?: (profileName: string) => void;
  private onAnalysisStartCallback?: () => void;
  private onAnalysisStopCallback?: () => void;

  // State
  private currentPerspective: 'white' | 'black' = 'white';
  private isAnalyzing = false;

  constructor(container: HTMLElement) {
    this.container = container;

    // Get DOM elements
    this.fenInput = document.getElementById('fen-input') as HTMLInputElement;
    this.loadFenBtn = document.getElementById('load-fen-btn') as HTMLButtonElement;
    this.profileSelect = document.getElementById('profile-select') as HTMLSelectElement;
    this.perspectiveWhiteBtn = document.getElementById('perspective-white') as HTMLButtonElement;
    this.perspectiveBlackBtn = document.getElementById('perspective-black') as HTMLButtonElement;
    this.analyzeBtn = document.getElementById('analyze-btn') as HTMLButtonElement;
    this.stopBtn = document.getElementById('stop-btn') as HTMLButtonElement;

    // Get metric displays
    this.metricPV = document.getElementById('metric-pv') as HTMLElement;
    this.metricMS = document.getElementById('metric-ms') as HTMLElement;
    this.metricAT = document.getElementById('metric-at') as HTMLElement;
    this.metricDF = document.getElementById('metric-df') as HTMLElement;

    // Create status and depth displays if they don't exist
    this.statusDisplay = this.createStatusDisplay();
    this.depthDisplay = this.createDepthDisplay();

    this.attachEventListeners();
  }

  private createStatusDisplay(): HTMLElement {
    let statusEl = document.getElementById('status-display');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.id = 'status-display';
      statusEl.className = 'status-display';
      statusEl.textContent = 'Ready';

      // Insert after analyze button section
      const analyzeSection = this.analyzeBtn.closest('.control-section');
      if (analyzeSection) {
        analyzeSection.appendChild(statusEl);
      }
    }
    return statusEl;
  }

  private createDepthDisplay(): HTMLElement {
    let depthEl = document.getElementById('depth-display');
    if (!depthEl) {
      depthEl = document.createElement('div');
      depthEl.id = 'depth-display';
      depthEl.className = 'depth-display';
      depthEl.innerHTML = `
        <div class="depth-label">Analysis Depth:</div>
        <div class="depth-value">0 / 7</div>
        <div class="depth-progress">
          <div class="depth-progress-bar" style="width: 0%"></div>
        </div>
      `;

      // Insert before status display
      const analyzeSection = this.analyzeBtn.closest('.control-section');
      if (analyzeSection) {
        analyzeSection.appendChild(depthEl);
      }
    }
    return depthEl;
  }

  private attachEventListeners(): void {
    // FEN input
    this.loadFenBtn.addEventListener('click', () => this.handleFenLoad());
    this.fenInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleFenLoad();
      }
    });

    // Perspective toggle
    this.perspectiveWhiteBtn.addEventListener('click', () => this.setPerspective('white'));
    this.perspectiveBlackBtn.addEventListener('click', () => this.setPerspective('black'));

    // Profile selection
    this.profileSelect.addEventListener('change', () => {
      if (this.onProfileChangeCallback) {
        this.onProfileChangeCallback(this.profileSelect.value);
      }
    });

    // Analysis controls
    this.analyzeBtn.addEventListener('click', () => this.handleAnalysisStart());
    this.stopBtn.addEventListener('click', () => this.handleAnalysisStop());
  }

  private handleFenLoad(): void {
    const fen = this.fenInput.value.trim();
    if (this.validateFen(fen)) {
      if (this.onFenChangeCallback) {
        this.onFenChangeCallback(fen);
      }
      this.updateStatus('Position loaded', 'success');
    } else {
      this.updateStatus('Invalid FEN', 'error');
    }
  }

  private validateFen(fen: string): boolean {
    // Basic FEN validation
    if (!fen) return false;
    const parts = fen.split(' ');
    if (parts.length < 4) return false;

    // Validate piece placement (first part)
    const rows = (parts[0] ?? '').split('/');
    if (rows.length !== 8) return false;

    return true;
  }

  private setPerspective(perspective: 'white' | 'black'): void {
    this.currentPerspective = perspective;

    // Update button states
    if (perspective === 'white') {
      this.perspectiveWhiteBtn.classList.add('active');
      this.perspectiveBlackBtn.classList.remove('active');
    } else {
      this.perspectiveBlackBtn.classList.add('active');
      this.perspectiveWhiteBtn.classList.remove('active');
    }

    // Notify callback
    if (this.onPerspectiveChangeCallback) {
      this.onPerspectiveChangeCallback(perspective);
    }
  }

  private handleAnalysisStart(): void {
    if (this.isAnalyzing) return;

    this.setAnalyzing(true);
    this.updateStatus('Analyzing...', 'analyzing');

    if (this.onAnalysisStartCallback) {
      this.onAnalysisStartCallback();
    }
  }

  private handleAnalysisStop(): void {
    if (!this.isAnalyzing) return;

    this.setAnalyzing(false);
    this.updateStatus('Analysis stopped', 'warning');

    if (this.onAnalysisStopCallback) {
      this.onAnalysisStopCallback();
    }
  }

  // Public API methods

  public setOnFenChange(callback: (fen: string) => void): void {
    this.onFenChangeCallback = callback;
  }

  public setOnPerspectiveChange(callback: (perspective: 'white' | 'black') => void): void {
    this.onPerspectiveChangeCallback = callback;
  }

  public setOnProfileChange(callback: (profileName: string) => void): void {
    this.onProfileChangeCallback = callback;
  }

  public setOnAnalysisStart(callback: () => void): void {
    this.onAnalysisStartCallback = callback;
  }

  public setOnAnalysisStop(callback: () => void): void {
    this.onAnalysisStopCallback = callback;
  }

  public updateDepth(depth: number, maxDepth: number = 7): void {
    const depthValue = this.depthDisplay.querySelector('.depth-value');
    const progressBar = this.depthDisplay.querySelector('.depth-progress-bar') as HTMLElement;

    if (depthValue) {
      depthValue.textContent = `${depth} / ${maxDepth}`;
    }

    if (progressBar) {
      const percentage = (depth / maxDepth) * 100;
      progressBar.style.width = `${percentage}%`;
    }
  }

  public updateStatus(message: string, type: 'success' | 'error' | 'warning' | 'analyzing' | 'idle' = 'idle'): void {
    this.statusDisplay.textContent = message;
    this.statusDisplay.className = `status-display status-${type}`;
  }

  public setAnalyzing(analyzing: boolean): void {
    this.isAnalyzing = analyzing;

    if (analyzing) {
      this.analyzeBtn.disabled = true;
      this.stopBtn.disabled = false;
      this.fenInput.disabled = true;
      this.loadFenBtn.disabled = true;
    } else {
      this.analyzeBtn.disabled = false;
      this.stopBtn.disabled = true;
      this.fenInput.disabled = false;
      this.loadFenBtn.disabled = false;
    }
  }

  public updateMetrics(metrics: {
    PV_white: number;
    PV_black: number;
    MS_white: number;
    MS_black: number;
    AT_white: number;
    AT_black: number;
    DF_white: number;
    DF_black: number;
  }): void {
    const pvDelta = metrics.PV_white - metrics.PV_black;
    const msDelta = metrics.MS_white - metrics.MS_black;
    const atDelta = metrics.AT_white - metrics.AT_black;
    const dfDelta = metrics.DF_white - metrics.DF_black;

    this.metricPV.textContent = this.formatMetric(pvDelta);
    this.metricMS.textContent = this.formatMetric(msDelta);
    this.metricAT.textContent = this.formatMetric(atDelta);
    this.metricDF.textContent = this.formatMetric(dfDelta);
  }

  private formatMetric(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}`;
  }

  public getFen(): string {
    return this.fenInput.value.trim();
  }

  public setFen(fen: string): void {
    this.fenInput.value = fen;
  }

  public getProfile(): string {
    return this.profileSelect.value;
  }

  public setProfile(profileName: string): void {
    this.profileSelect.value = profileName;
  }

  public getPerspective(): 'white' | 'black' {
    return this.currentPerspective;
  }

  public reset(): void {
    this.updateDepth(0);
    this.updateStatus('Ready', 'idle');
    this.setAnalyzing(false);
    this.metricPV.textContent = '--';
    this.metricMS.textContent = '--';
    this.metricAT.textContent = '--';
    this.metricDF.textContent = '--';
  }
}
