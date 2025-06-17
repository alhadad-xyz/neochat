import { WidgetConfig, WidgetTheme, WidgetPosition, ChatMessage, Agent, WidgetError } from '../types';
import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';
import { CanistChatSDK } from '../core/CanistChatSDK';

/**
 * ChatWidget - Embeddable chat widget for websites
 */
export class ChatWidget {
  private config: WidgetConfig;
  private sdk: CanistChatSDK;
  private container: HTMLElement | null = null;
  private widgetElement: HTMLElement | null = null;
  private messagesContainer: HTMLElement | null = null;
  private inputElement: HTMLInputElement | null = null;
  private sendButton: HTMLButtonElement | null = null;
  private toggleButton: HTMLButtonElement | null = null;
  private agent: Agent | null = null;
  private messages: ChatMessage[] = [];
  private isOpen = false;
  private isMinimized = false;
  private eventEmitter = new EventEmitter<{ open: {}; close: {}; message: { message: ChatMessage } }>();
  private logger = new Logger('info');
  private sessionId: string;

  constructor(config: WidgetConfig) {
    this.config = {
      theme: 'light',
      position: 'bottom-right',
      size: 'medium',
      ...config,
    };

    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.logger.info('ChatWidget created', { config: this.config });

    // Initialize SDK
    this.sdk = new CanistChatSDK({
      network: this.config.network || 'ic',
      agentManagerCanisterId: this.config.agentManagerCanisterId,
      apiKey: this.config.apiKey,
    });

    this.initialize();
  }

  /**
   * Initialize the widget
   */
  private async initialize(): Promise<void> {
    try {
      // Find container
      this.container = document.getElementById(this.config.containerId);
      if (!this.container) {
        throw new WidgetError(`Container with ID '${this.config.containerId}' not found`, 'widget_' + Date.now());
      }

      // Initialize SDK
      await this.sdk.initialize();

      // Load agent
      this.agent = await this.sdk.getAgent(this.config.agentId);

      // Create widget UI
      this.createWidget();
      this.attachEventListeners();

      this.logger.info('ChatWidget initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize ChatWidget', { error });
      throw error;
    }
  }

  /**
   * Create the widget UI elements
   */
  private createWidget(): void {
    // Create main widget container
    this.widgetElement = document.createElement('div');
    this.widgetElement.className = `canistchat-widget canistchat-${this.config.theme} canistchat-${this.config.position}`;
    this.widgetElement.innerHTML = this.getWidgetHTML();

    // Apply custom styles
    this.applyStyles();

    // Get references to important elements
    this.messagesContainer = this.widgetElement.querySelector('.canistchat-messages');
    this.inputElement = this.widgetElement.querySelector('.canistchat-input');
    this.sendButton = this.widgetElement.querySelector('.canistchat-send-btn');
    this.toggleButton = this.widgetElement.querySelector('.canistchat-toggle-btn');

    // Add to container
    this.container!.appendChild(this.widgetElement);

    // Initially hidden if using floating position
    if (this.config.position !== 'inline') {
      this.widgetElement.style.display = 'none';
    }
  }

  /**
   * Get the HTML structure for the widget
   */
  private getWidgetHTML(): string {
    const welcomeMessage = this.agent?.config.appearance.welcomeMessage || 'Hello! How can I help you today?';
    
    return `
      <div class="canistchat-toggle-btn" ${this.config.position === 'inline' ? 'style="display: none;"' : ''}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04 1.05 4.35L1 22l5.65-2.05C8.96 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
        </svg>
      </div>
      
      <div class="canistchat-chat-container" ${this.config.position === 'inline' ? '' : 'style="display: none;"'}>
        <div class="canistchat-header">
          <div class="canistchat-agent-info">
            <div class="canistchat-agent-avatar">
              ${this.agent?.config.appearance.avatar ? 
                `<img src="${this.agent.config.appearance.avatar}" alt="${this.agent.name}">` : 
                '<div class="canistchat-default-avatar">AI</div>'
              }
            </div>
            <div class="canistchat-agent-details">
              <div class="canistchat-agent-name">${this.agent?.name || 'AI Assistant'}</div>
              <div class="canistchat-agent-status">Online</div>
            </div>
          </div>
          <div class="canistchat-header-actions">
            <button class="canistchat-minimize-btn" ${this.config.position === 'inline' ? 'style="display: none;"' : ''}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M19 13H5v-2h14v2z"/>
              </svg>
            </button>
            <button class="canistchat-close-btn" ${this.config.position === 'inline' ? 'style="display: none;"' : ''}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="canistchat-messages">
          <div class="canistchat-message canistchat-agent-message">
            <div class="canistchat-message-content">${welcomeMessage}</div>
            <div class="canistchat-message-time">${new Date().toLocaleTimeString()}</div>
          </div>
        </div>
        
        <div class="canistchat-input-container">
          <input 
            type="text" 
            class="canistchat-input" 
            placeholder="Type your message..."
            maxlength="500"
          >
          <button class="canistchat-send-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Apply custom styles to the widget
   */
  private applyStyles(): void {
    if (!this.widgetElement) return;

    const baseStyles = this.getBaseStyles();
    const customStyles = this.config.customStyles || {};

    // Create style element
    const styleElement = document.createElement('style');
    styleElement.textContent = baseStyles;
    document.head.appendChild(styleElement);

    // Apply custom styles
    Object.entries(customStyles).forEach(([property, value]) => {
      if (value) {
        (this.widgetElement!.style as any)[property] = value;
      }
    });
  }

  /**
   * Get base CSS styles for the widget
   */
  private getBaseStyles(): string {
    return `
      .canistchat-widget {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        position: ${this.config.position === 'inline' ? 'relative' : 'fixed'};
        z-index: ${this.config.customStyles?.zIndex || 9999};
        width: ${this.config.customStyles?.width || '350px'};
        height: ${this.config.customStyles?.height || '500px'};
        max-height: ${this.config.customStyles?.maxHeight || '80vh'};
        border-radius: ${this.config.customStyles?.borderRadius || '12px'};
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
        background: white;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .canistchat-widget.canistchat-bottom-right {
        bottom: 20px;
        right: 20px;
      }

      .canistchat-widget.canistchat-bottom-left {
        bottom: 20px;
        left: 20px;
      }

      .canistchat-widget.canistchat-top-right {
        top: 20px;
        right: 20px;
      }

      .canistchat-widget.canistchat-top-left {
        top: 20px;
        left: 20px;
      }

      .canistchat-widget.canistchat-center {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .canistchat-toggle-btn {
        position: ${this.config.position === 'inline' ? 'relative' : 'fixed'};
        ${this.config.position?.includes('bottom') ? 'bottom: 20px;' : ''}
        ${this.config.position?.includes('top') ? 'top: 20px;' : ''}
        ${this.config.position?.includes('right') ? 'right: 20px;' : ''}
        ${this.config.position?.includes('left') ? 'left: 20px;' : ''}
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${this.config.customStyles?.primaryColor || '#007bff'};
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        z-index: ${this.config.customStyles?.zIndex || 9999};
        transition: all 0.3s ease;
      }

      .canistchat-toggle-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      }

      .canistchat-header {
        background: ${this.config.customStyles?.primaryColor || '#007bff'};
        color: white;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .canistchat-agent-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .canistchat-agent-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .canistchat-agent-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .canistchat-default-avatar {
        font-weight: bold;
        font-size: 14px;
      }

      .canistchat-agent-name {
        font-weight: 600;
        font-size: 16px;
      }

      .canistchat-agent-status {
        font-size: 12px;
        opacity: 0.8;
      }

      .canistchat-header-actions {
        display: flex;
        gap: 8px;
      }

      .canistchat-minimize-btn,
      .canistchat-close-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        opacity: 0.8;
        transition: opacity 0.2s;
      }

      .canistchat-minimize-btn:hover,
      .canistchat-close-btn:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.1);
      }

      .canistchat-messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .canistchat-message {
        max-width: 80%;
        word-wrap: break-word;
      }

      .canistchat-user-message {
        align-self: flex-end;
      }

      .canistchat-agent-message {
        align-self: flex-start;
      }

      .canistchat-message-content {
        padding: 12px 16px;
        border-radius: 18px;
        line-height: 1.4;
      }

      .canistchat-user-message .canistchat-message-content {
        background: ${this.config.customStyles?.primaryColor || '#007bff'};
        color: white;
      }

      .canistchat-agent-message .canistchat-message-content {
        background: #f1f3f5;
        color: #333;
      }

      .canistchat-message-time {
        font-size: 11px;
        color: #666;
        margin-top: 4px;
        text-align: right;
      }

      .canistchat-agent-message .canistchat-message-time {
        text-align: left;
      }

      .canistchat-input-container {
        padding: 16px;
        border-top: 1px solid #e9ecef;
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .canistchat-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid #ddd;
        border-radius: 24px;
        outline: none;
        font-size: 14px;
      }

      .canistchat-input:focus {
        border-color: ${this.config.customStyles?.primaryColor || '#007bff'};
      }

      .canistchat-send-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${this.config.customStyles?.primaryColor || '#007bff'};
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
      }

      .canistchat-send-btn:hover {
        background: ${this.config.customStyles?.secondaryColor || '#0056b3'};
      }

      .canistchat-send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .canistchat-dark {
        background: #2d3748;
        color: white;
      }

      .canistchat-dark .canistchat-messages {
        background: #2d3748;
      }

      .canistchat-dark .canistchat-agent-message .canistchat-message-content {
        background: #4a5568;
        color: white;
      }

      .canistchat-dark .canistchat-input-container {
        border-top-color: #4a5568;
        background: #2d3748;
      }

      .canistchat-dark .canistchat-input {
        background: #4a5568;
        border-color: #4a5568;
        color: white;
      }

      @media (max-width: 480px) {
        .canistchat-widget {
          width: calc(100vw - 40px) !important;
          height: calc(100vh - 40px) !important;
          top: 20px !important;
          left: 20px !important;
          right: 20px !important;
          bottom: 20px !important;
          transform: none !important;
        }
      }
    `;
  }

  /**
   * Attach event listeners to widget elements
   */
  private attachEventListeners(): void {
    // Toggle button click
    this.toggleButton?.addEventListener('click', () => {
      this.toggle();
    });

    // Close button click
    this.widgetElement?.querySelector('.canistchat-close-btn')?.addEventListener('click', () => {
      this.close();
    });

    // Minimize button click
    this.widgetElement?.querySelector('.canistchat-minimize-btn')?.addEventListener('click', () => {
      this.minimize();
    });

    // Send button click
    this.sendButton?.addEventListener('click', () => {
      this.sendMessage();
    });

    // Enter key in input
    this.inputElement?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize input
    this.inputElement?.addEventListener('input', () => {
      this.adjustInputHeight();
    });
  }

  /**
   * Send a message
   */
  private async sendMessage(): Promise<void> {
    if (!this.inputElement || !this.agent) return;
    
    const message = this.inputElement.value.trim();
    if (!message) return;

    // Clear input
    this.inputElement.value = '';
    this.adjustInputHeight();

    // Add user message to UI
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };

    this.addMessageToUI(userMessage);
    this.messages.push(userMessage);

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Send to SDK
      const response = await this.sdk.chat(this.agent.id, message, this.sessionId);
      
      // Hide typing indicator
      this.hideTypingIndicator();
      
      // Add agent response to UI
      this.addMessageToUI(response);
      this.messages.push(response);

      // Emit event
      this.eventEmitter.emit('message', { message: response });

    } catch (error) {
      this.hideTypingIndicator();
      this.logger.error('Failed to send message', { error });
      
      // Show error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'agent',
        timestamp: new Date(),
        isError: true,
      };
      
      this.addMessageToUI(errorMessage);
    }
  }

  /**
   * Add a message to the UI
   */
  private addMessageToUI(message: ChatMessage): void {
    if (!this.messagesContainer) return;

    const messageElement = document.createElement('div');
    messageElement.className = `canistchat-message canistchat-${message.sender}-message`;
    
    messageElement.innerHTML = `
      <div class="canistchat-message-content">${this.escapeHtml(message.content)}</div>
      <div class="canistchat-message-time">${message.timestamp.toLocaleTimeString()}</div>
    `;

    this.messagesContainer.appendChild(messageElement);
    this.scrollToBottom();
  }

  /**
   * Show typing indicator
   */
  private showTypingIndicator(): void {
    if (!this.messagesContainer) return;

    const typingElement = document.createElement('div');
    typingElement.className = 'canistchat-message canistchat-agent-message canistchat-typing';
    typingElement.innerHTML = `
      <div class="canistchat-message-content">
        <div class="canistchat-typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;

    this.messagesContainer.appendChild(typingElement);
    this.scrollToBottom();
  }

  /**
   * Hide typing indicator
   */
  private hideTypingIndicator(): void {
    const typingElement = this.messagesContainer?.querySelector('.canistchat-typing');
    if (typingElement) {
      typingElement.remove();
    }
  }

  /**
   * Scroll messages to bottom
   */
  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  /**
   * Adjust input height based on content
   */
  private adjustInputHeight(): void {
    if (this.inputElement) {
      this.inputElement.style.height = 'auto';
      this.inputElement.style.height = Math.min(this.inputElement.scrollHeight, 120) + 'px';
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Open the widget
   */
  open(): void {
    if (this.config.position === 'inline') return;
    
    const chatContainer = this.widgetElement?.querySelector('.canistchat-chat-container') as HTMLElement;
    const toggleButton = this.widgetElement?.querySelector('.canistchat-toggle-btn') as HTMLElement;
    
    if (chatContainer && toggleButton) {
      chatContainer.style.display = 'flex';
      toggleButton.style.display = 'none';
      this.isOpen = true;
      this.eventEmitter.emit('open', {});
    }
  }

  /**
   * Close the widget
   */
  close(): void {
    if (this.config.position === 'inline') return;
    
    const chatContainer = this.widgetElement?.querySelector('.canistchat-chat-container') as HTMLElement;
    const toggleButton = this.widgetElement?.querySelector('.canistchat-toggle-btn') as HTMLElement;
    
    if (chatContainer && toggleButton) {
      chatContainer.style.display = 'none';
      toggleButton.style.display = 'flex';
      this.isOpen = false;
      this.eventEmitter.emit('close', {});
    }
  }

  /**
   * Toggle widget open/close
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Minimize the widget
   */
  minimize(): void {
    // Implementation for minimize functionality
    this.isMinimized = !this.isMinimized;
    // Add minimize logic here
  }

  /**
   * Destroy the widget
   */
  destroy(): void {
    if (this.widgetElement) {
      this.widgetElement.remove();
    }
    this.sdk.destroy();
    this.eventEmitter.removeAllListeners();
  }

  /**
   * Subscribe to widget events
   */
  on(event: 'open' | 'close' | 'message', callback: (data?: any) => void): void {
    this.eventEmitter.on(event as any, callback);
  }

  /**
   * Unsubscribe from widget events
   */
  off(event: 'open' | 'close' | 'message', callback: (data?: any) => void): void {
    this.eventEmitter.off(event as any, callback);
  }
} 