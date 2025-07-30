/**
 * Video Editor Adapter
 * 
 * This adapter class provides a clean interface between our application
 * and the third-party video editor (designcombo/react-video-editor).
 * 
 * It handles:
 * - Configuration mapping
 * - Event handling
 * - Data transformation
 * - Error handling
 * - Lifecycle management
 */

import type {
  VideoEditorConfig,
  VideoExportData,
  VideoProject,
  VideoAsset,
  VideoEditorError,
  VideoEditorState,
  VideoEditorEvent,
  IVideoEditor,
  ExportOptions
} from './types';

export class VideoEditorAdapter implements IVideoEditor {
  private container: HTMLElement | null = null;
  private config: VideoEditorConfig;
  private state: VideoEditorState;
  private eventListeners: Map<string, Function[]> = new Map();
  
  // Reference to the vendor editor instance
  private vendorEditor: any = null;
  
  constructor(config: VideoEditorConfig) {
    this.config = config;
    this.state = {
      isLoading: false,
      isExporting: false,
      hasUnsavedChanges: false,
    };
  }

  /**
   * Initialize the video editor
   */
  async initialize(container: HTMLElement, config: VideoEditorConfig): Promise<void> {
    try {
      this.container = container;
      this.config = { ...this.config, ...config };
      this.setState({ isLoading: true });

      // Clear container
      container.innerHTML = '';

      // Create iframe for the vendor editor
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      
      // For now, we'll load the vendor editor in an iframe
      // In a production setup, you'd integrate the React components directly
      iframe.src = this.buildEditorUrl();
      
      container.appendChild(iframe);

      // Set up message handling for iframe communication
      this.setupIframeMessaging(iframe);

      this.setState({ isLoading: false });
      this.emit({ type: 'EDITOR_LOADED' });
      
      this.config.onLoad?.();
    } catch (error) {
      const editorError: VideoEditorError = {
        code: 'INITIALIZATION_FAILED',
        message: 'Failed to initialize video editor',
        details: error,
        timestamp: new Date(),
      };
      
      this.handleError(editorError);
      throw editorError;
    }
  }

  /**
   * Load a project into the editor
   */
  async loadProject(project: VideoProject): Promise<void> {
    try {
      this.setState({ isLoading: true });
      
      // Send project data to vendor editor via postMessage
      this.sendToVendorEditor({
        type: 'LOAD_PROJECT',
        data: project.data
      });
      
      this.setState({ 
        isLoading: false, 
        currentProject: project,
        hasUnsavedChanges: false 
      });
      
      this.emit({ type: 'PROJECT_LOADED', project });
    } catch (error) {
      this.handleError({
        code: 'PROJECT_LOAD_FAILED',
        message: 'Failed to load project',
        details: error,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Save the current project
   */
  async saveProject(): Promise<VideoProject> {
    try {
      const projectData = await this.getProjectState();
      
      const project: VideoProject = {
        id: this.state.currentProject?.id || this.generateId(),
        name: this.state.currentProject?.name || 'Untitled Project',
        data: projectData,
        duration: projectData.duration || 0,
        createdAt: this.state.currentProject?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      this.setState({ 
        currentProject: project,
        hasUnsavedChanges: false 
      });
      
      this.emit({ type: 'PROJECT_SAVED', project });
      return project;
    } catch (error) {
      throw this.createError('PROJECT_SAVE_FAILED', 'Failed to save project', error);
    }
  }

  /**
   * Export video from the editor
   */
  async exportVideo(options?: ExportOptions): Promise<VideoExportData> {
    try {
      this.setState({ isExporting: true });
      this.emit({ type: 'EXPORT_STARTED' });

      // Send export request to vendor editor
      const exportData = await this.requestExportFromVendor(options);
      
      const videoData: VideoExportData = {
        id: this.generateId(),
        name: this.state.currentProject?.name || 'Exported Video',
        duration: exportData.duration,
        format: options?.format || 'mp4',
        resolution: options?.resolution || { width: 1280, height: 720 },
        blob: exportData.blob,
        url: exportData.url,
        size: exportData.blob.size,
        projectData: await this.getProjectState(),
        createdAt: this.state.currentProject?.createdAt || new Date(),
        exportedAt: new Date(),
      };

      this.setState({ isExporting: false });
      this.emit({ type: 'EXPORT_COMPLETED', data: videoData });
      
      await this.config.onSave?.(videoData);
      return videoData;
    } catch (error) {
      this.setState({ isExporting: false });
      throw this.createError('EXPORT_FAILED', 'Failed to export video', error);
    }
  }

  /**
   * Add assets to the editor
   */
  async addAssets(assets: VideoAsset[]): Promise<void> {
    try {
      this.sendToVendorEditor({
        type: 'ADD_ASSETS',
        data: assets
      });
      
      this.emit({ type: 'ASSETS_ADDED', assets });
    } catch (error) {
      throw this.createError('ASSETS_ADD_FAILED', 'Failed to add assets', error);
    }
  }

  /**
   * Get current project state
   */
  getProjectState(): any {
    // This would request the current state from the vendor editor
    return this.requestStateFromVendor();
  }

  /**
   * Cleanup and destroy the editor
   */
  async destroy(): Promise<void> {
    try {
      if (this.container) {
        this.container.innerHTML = '';
        this.container = null;
      }
      
      this.eventListeners.clear();
      this.vendorEditor = null;
    } catch (error) {
      console.error('Error destroying video editor:', error);
    }
  }

  /**
   * Get current editor state
   */
  getState(): VideoEditorState {
    return { ...this.state };
  }

  /**
   * Subscribe to editor events
   */
  on(eventType: string, callback: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * Unsubscribe from editor events
   */
  off(eventType: string, callback: Function): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Private methods

  private setState(newState: Partial<VideoEditorState>): void {
    this.state = { ...this.state, ...newState };
  }

  private emit(event: VideoEditorEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  private handleError(error: VideoEditorError): void {
    this.setState({ error });
    this.emit({ type: 'ERROR', error });
    this.config.onError?.(error);
  }

  private createError(code: string, message: string, details?: any): VideoEditorError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
    };
  }

  private generateId(): string {
    return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private buildEditorUrl(): string {
    // In development, this would point to the vendor editor
    // In production, you'd integrate the components directly
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001' // Vendor editor dev server
      : '/video-editor'; // Integrated editor
    
    const params = new URLSearchParams({
      theme: this.config.theme,
      width: this.config.width.toString(),
      height: this.config.height.toString(),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  private setupIframeMessaging(iframe: HTMLIFrameElement): void {
    window.addEventListener('message', (event) => {
      // Validate origin for security
      if (event.origin !== window.location.origin) {
        return;
      }

      const { type, data } = event.data;
      
      switch (type) {
        case 'EDITOR_READY':
          this.vendorEditor = iframe.contentWindow;
          break;
          
        case 'PROJECT_CHANGED':
          this.setState({ hasUnsavedChanges: true });
          this.config.onProjectChange?.(true);
          break;
          
        case 'EXPORT_PROGRESS':
          this.emit({ type: 'EXPORT_PROGRESS', progress: data.progress });
          break;
          
        case 'ERROR':
          this.handleError(data);
          break;
      }
    });
  }

  private sendToVendorEditor(message: any): void {
    if (this.vendorEditor) {
      this.vendorEditor.postMessage(message, '*');
    }
  }

  private async requestExportFromVendor(options?: ExportOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = this.generateId();
      
      const handleResponse = (event: MessageEvent) => {
        if (event.data.type === 'EXPORT_RESPONSE' && event.data.requestId === requestId) {
          window.removeEventListener('message', handleResponse);
          if (event.data.success) {
            resolve(event.data.data);
          } else {
            reject(new Error(event.data.error));
          }
        }
      };

      window.addEventListener('message', handleResponse);
      
      this.sendToVendorEditor({
        type: 'EXPORT_REQUEST',
        requestId,
        options
      });
      
      // Timeout after 5 minutes
      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('Export timeout'));
      }, 5 * 60 * 1000);
    });
  }

  private async requestStateFromVendor(): Promise<any> {
    return new Promise((resolve) => {
      const requestId = this.generateId();
      
      const handleResponse = (event: MessageEvent) => {
        if (event.data.type === 'STATE_RESPONSE' && event.data.requestId === requestId) {
          window.removeEventListener('message', handleResponse);
          resolve(event.data.data);
        }
      };

      window.addEventListener('message', handleResponse);
      
      this.sendToVendorEditor({
        type: 'STATE_REQUEST',
        requestId
      });
    });
  }
}
