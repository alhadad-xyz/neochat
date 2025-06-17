/**
 * CanistChat SDK
 * 
 * A comprehensive SDK for integrating AI agents powered by Internet Computer
 * into web applications, mobile apps, and other platforms.
 * 
 * @version 1.0.0
 * @author CanistChat Team
 */

// Core SDK exports
export { CanistChatSDK } from './core/CanistChatSDK';
export { CanistChatClient } from './core/CanistChatClient';

// Agent management
export { AgentManager } from './agents/AgentManager';
export { ChatSession } from './chat/ChatSession';

// Widget components
export { ChatWidget } from './widgets/ChatWidget';
export { AgentCard } from './widgets/AgentCard';
export { ConversationPanel } from './widgets/ConversationPanel';

// React hooks (if React is available)
export { useCanistChat } from './react/useCanistChat';
export { useAgent } from './react/useAgent';
export { useChatSession } from './react/useChatSession';

// Web Components
export { registerWebComponents } from './web-components/register';

// Types and interfaces
export * from './types';

// Utilities
export { SDKConfig } from './config/SDKConfig';
export { EventEmitter } from './utils/EventEmitter';
export { Logger } from './utils/Logger';

// Version info
export const SDK_VERSION = '1.0.0';
export const SUPPORTED_NETWORKS = ['local', 'ic'] as const;

/**
 * Quick start function for immediate SDK initialization
 * 
 * @example
 * ```typescript
 * import { initCanistChat } from '@canistchat/sdk';
 * 
 * const canistChat = await initCanistChat({
 *   network: 'ic',
 *   agentManagerCanisterId: 'your-agent-manager-id',
 *   apiKey: 'your-api-key' // optional for public agents
 * });
 * 
 * const agent = await canistChat.getAgent('agent-id');
 * const response = await agent.chat('Hello!');
 * ```
 */
export async function initCanistChat(config: {
  network?: 'local' | 'ic';
  agentManagerCanisterId: string;
  llmProcessorCanisterId?: string;
  apiKey?: string;
  host?: string;
}): Promise<CanistChatSDK> {
  const sdk = new CanistChatSDK({
    network: config.network || 'ic',
    agentManagerCanisterId: config.agentManagerCanisterId,
    llmProcessorCanisterId: config.llmProcessorCanisterId,
    apiKey: config.apiKey,
    host: config.host,
  });

  await sdk.initialize();
  return sdk;
}

/**
 * Create a chat widget that can be embedded in any web page
 * 
 * @example
 * ```typescript
 * import { createChatWidget } from '@canistchat/sdk';
 * 
 * const widget = createChatWidget({
 *   agentId: 'your-agent-id',
 *   agentManagerCanisterId: 'canister-id',
 *   containerId: 'chat-widget-container',
 *   theme: 'light',
 *   position: 'bottom-right'
 * });
 * ```
 */
export function createChatWidget(config: {
  agentId: string;
  agentManagerCanisterId: string;
  containerId: string;
  network?: 'local' | 'ic';
  theme?: 'light' | 'dark' | 'auto';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  apiKey?: string;
}): ChatWidget {
  return new ChatWidget(config);
}

// Default export for convenience
export default {
  CanistChatSDK,
  CanistChatClient,
  AgentManager,
  ChatSession,
  ChatWidget,
  initCanistChat,
  createChatWidget,
  SDK_VERSION,
  SUPPORTED_NETWORKS,
}; 