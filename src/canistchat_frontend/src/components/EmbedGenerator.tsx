/**
 * @fileoverview NeoChat Embed Widget Generator Component
 * 
 * This component provides a comprehensive interface for generating embed code
 * for NeoChat agents. It includes customization options, code generation
 * for multiple platforms, and testing capabilities.
 * 
 * Features:
 * - Customizable widget appearance and behavior
 * - Multi-platform code generation (HTML, React, WordPress)
 * - Live preview and testing capabilities
 * - Comprehensive documentation and instructions
 * 
 * @author NeoChat Development Team
 * @version 2.0.0
 * @since 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CodeBracketIcon, 
  DocumentDuplicateIcon, 
  EyeIcon, 
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { Agent } from '../types';
import { Button } from './ui/button';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Props for the EmbedGenerator component
 */
interface EmbedGeneratorProps {
  /** The agent to generate embed code for */
  agent: Agent | null;
  /** The canister ID for the deployment */
  canisterId: string;
}

/**
 * Available tabs in the embed generator interface
 */
type ActiveTab = 'generator' | 'instructions' | 'testing';

/**
 * Testing modes for the embed widget
 */
type TestingMode = 'preview' | 'live';

/**
 * Copy operation types for tracking success states
 */
type CopyType = 'html' | 'react' | 'wordpress';

/**
 * Widget customization options
 */
interface WidgetCustomization {
  width: string;
  height: string;
  theme: 'light' | 'dark' | 'auto';
  position: 'inline' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor: string;
  borderRadius: string;
  showHeader: boolean;
  showPoweredBy: boolean;
  minimizable: boolean;
  autoOpen: boolean;
  welcomeMessage: string;
  placeholder: string;
}

/**
 * NeoChat Embed Widget Generator Component
 * 
 * Provides a comprehensive interface for generating embed code for NeoChat agents.
 * Includes customization options, multi-platform code generation, and testing capabilities.
 * 
 * @param props - Component props containing agent and canister information
 * @returns JSX element for the embed generator interface
 * 
 * @example
 * ```tsx
 * <EmbedGenerator 
 *   agent={selectedAgent} 
 *   canisterId="bkyz2-fmaaa-aaaaa-qaaaq-cai" 
 * />
 * ```
 */
const EmbedGenerator: React.FC<EmbedGeneratorProps> = ({ agent, canisterId }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /** Generated embed code for the current configuration */
  const [embedCode, setEmbedCode] = useState<string>('');
  
  /** Currently active tab in the interface */
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');
  
  /** Type of copy operation that was successful */
  const [copySuccess, setCopySuccess] = useState<CopyType | null>(null);
  
  /** Current testing mode (preview or live) */
  const [testingMode, setTestingMode] = useState<TestingMode>('preview');
  
  /** Widget customization settings */
  const [customization, setCustomization] = useState<WidgetCustomization>({
    width: '400px',
    height: '600px',
    theme: 'light',
    position: 'bottom-right',
    primaryColor: '#4F46E5',
    borderRadius: '12px',
    showHeader: true,
    showPoweredBy: true,
    minimizable: true,
    autoOpen: false,
    welcomeMessage: '',
    placeholder: 'Type your message...'
  });

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Escapes JavaScript strings to prevent syntax errors in generated code
   * 
   * This function properly escapes special characters that could break
   * JavaScript syntax when inserted into string literals.
   * 
   * @param str - The string to escape
   * @returns The escaped string safe for JavaScript string literals
   * 
   * @example
   * ```typescript
   * const escaped = escapeJsString("Hello! I'm an agent");
   * // Returns: "Hello! I\'m an agent"
   * ```
   */
  const escapeJsString = (str: string): string => {
    return str
      .replace(/\\/g, '\\\\')  // Escape backslashes first
      .replace(/'/g, "\\'")    // Escape single quotes
      .replace(/"/g, '\\"')    // Escape double quotes
      .replace(/\n/g, '\\n')   // Escape newlines
      .replace(/\r/g, '\\r')   // Escape carriage returns
      .replace(/\t/g, '\\t');  // Escape tabs
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Regenerate embed code when agent or customization changes
   */
  useEffect(() => {
    if (agent) {
      generateEmbedCode();
    }
  }, [agent, customization]);

  // ============================================================================
  // CODE GENERATION FUNCTIONS
  // ============================================================================

  /**
   * Generates the complete HTML embed code for the widget
   * 
   * Creates a self-contained JavaScript snippet that can be embedded
   * in any HTML page to display the NeoChat widget.
   */
  const generateEmbedCode = () => {
    if (!agent) return;

    const embedScript = `
<!-- NeoChat Embed Widget -->
<div id="canistchat-widget-${agent.id}"></div>
<script>
(function() {
  // NeoChat Widget Configuration
  const config = {
    agentId: '${escapeJsString(agent.id)}',
    canisterId: '${escapeJsString(canisterId)}',
    frontendCanisterId: 'giyqx-pqaaa-aaaab-aagza-cai',
    theme: '${escapeJsString(customization.theme)}',
    width: '${escapeJsString(customization.width)}',
    height: '${escapeJsString(customization.height)}',
    position: '${escapeJsString(customization.position)}',
    primaryColor: '${escapeJsString(customization.primaryColor)}',
    borderRadius: '${escapeJsString(customization.borderRadius)}',
    showHeader: ${customization.showHeader},
    showPoweredBy: ${customization.showPoweredBy},
    minimizable: ${customization.minimizable},
    autoOpen: ${customization.autoOpen},
    title: '${escapeJsString(agent.name)}',
    subtitle: 'AI Assistant',
    welcomeMessage: '${escapeJsString(customization.welcomeMessage || `Hello! I'm ${agent.name}. How can I help you today?`)}',
    placeholder: '${escapeJsString(customization.placeholder)}'
  };

  // Create widget container
  const container = document.getElementById('canistchat-widget-' + config.agentId);
  if (!container) {
    console.error('NeoChat: Widget container not found');
    return;
  }

  // Create main widget wrapper
  const widgetWrapper = document.createElement('div');
  widgetWrapper.style.position = config.position === 'inline' ? 'relative' : 'fixed';
  widgetWrapper.style.zIndex = '9999';
  widgetWrapper.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  // Position widget if floating
  if (config.position !== 'inline') {
    switch(config.position) {
      case 'bottom-right':
        widgetWrapper.style.bottom = '80px';
        widgetWrapper.style.right = '20px';
        break;
      case 'bottom-left':
        widgetWrapper.style.bottom = '80px';
        widgetWrapper.style.left = '20px';
        break;
      case 'top-right':
        widgetWrapper.style.top = '20px';
        widgetWrapper.style.right = '20px';
        break;
      case 'top-left':
        widgetWrapper.style.top = '20px';
        widgetWrapper.style.left = '20px';
        break;
    }
  }

  // Session management for conversation history
  const getOrCreateSessionId = () => {
    const storageKey = \`canistchat_session_\${config.agentId}\`;
    let sessionId = localStorage.getItem(storageKey);
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(storageKey, sessionId);
    }
    return sessionId;
  };

  // Create iframe for secure embedding
  const iframe = document.createElement('iframe');
  const embedUrl = new URL(\`https://\${config.frontendCanisterId}.icp0.io/embed\`);
  embedUrl.searchParams.set('agent', config.agentId);
  embedUrl.searchParams.set('theme', config.theme);
  embedUrl.searchParams.set('color', config.primaryColor.replace('#', '%23'));
  embedUrl.searchParams.set('welcome', config.welcomeMessage);
  embedUrl.searchParams.set('placeholder', config.placeholder);
  embedUrl.searchParams.set('sessionId', getOrCreateSessionId());
  
  iframe.src = embedUrl.toString();
  iframe.style.width = config.width;
  iframe.style.height = config.height;
  iframe.style.border = 'none';
  iframe.style.borderRadius = config.borderRadius;
  iframe.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
  iframe.style.transition = 'all 0.3s ease';
  iframe.allow = 'encrypted-media';
  iframe.title = config.title + ' - AI Assistant';
  iframe.loading = 'lazy';

  // Add minimize/maximize functionality
  let isMinimized = !config.autoOpen;
  if (config.minimizable && config.position !== 'inline') {
    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = isMinimized ? '💬' : '−';
    toggleBtn.style.position = 'absolute';
    toggleBtn.style.top = '10px';
    toggleBtn.style.right = '10px';
    toggleBtn.style.background = config.primaryColor;
    toggleBtn.style.color = 'white';
    toggleBtn.style.border = 'none';
    toggleBtn.style.borderRadius = '50%';
    toggleBtn.style.width = '40px';
    toggleBtn.style.height = '40px';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.fontSize = '16px';
    toggleBtn.style.zIndex = '10000';
    toggleBtn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toggleBtn.style.transition = 'all 0.3s ease';
    
    toggleBtn.onmouseover = function() {
      toggleBtn.style.transform = 'scale(1.1)';
    };
    toggleBtn.onmouseout = function() {
      toggleBtn.style.transform = 'scale(1)';
    };
    
    toggleBtn.onclick = function() {
      if (isMinimized) {
        iframe.style.height = config.height;
        iframe.style.opacity = '1';
        iframe.style.transform = 'scale(1)';
        toggleBtn.innerHTML = '−';
        widgetWrapper.appendChild(iframe);
      } else {
        iframe.style.height = '0px';
        iframe.style.opacity = '0';
        iframe.style.transform = 'scale(0.8)';
        toggleBtn.innerHTML = '💬';
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }
      isMinimized = !isMinimized;
    };
    
    widgetWrapper.appendChild(toggleBtn);
    
    // Start minimized if autoOpen is false
    if (!config.autoOpen) {
      iframe.style.height = '0px';
      iframe.style.opacity = '0';
      iframe.style.transform = 'scale(0.8)';
    } else {
      widgetWrapper.appendChild(iframe);
    }
  } else {
    widgetWrapper.appendChild(iframe);
  }

  container.appendChild(widgetWrapper);

  // Add responsive behavior
  const handleResize = () => {
    if (window.innerWidth < 768 && config.position !== 'inline') {
      iframe.style.width = 'calc(100vw - 40px)';
      iframe.style.height = 'calc(100vh - 100px)';
      widgetWrapper.style.bottom = '10px';
      widgetWrapper.style.right = '10px';
      widgetWrapper.style.left = '10px';
    } else {
      iframe.style.width = config.width;
      iframe.style.height = config.height;
    }
  };
  
  window.addEventListener('resize', handleResize);
  handleResize();

  console.log('NeoChat widget loaded successfully');
})();
</script>`.trim();

    setEmbedCode(embedScript);
  };

  /**
   * Copies text to clipboard and shows success feedback
   * 
   * @param text - The text to copy to clipboard
   * @param type - The type of code being copied (for UI feedback)
   */
  const copyToClipboard = async (text: string, type: CopyType) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  /**
   * Generates React component code for embedding the widget
   * 
   * Creates a React component that can be imported and used in React applications.
   * The component renders an iframe with the configured widget settings.
   * 
   * @returns React component code as a string, or empty string if no agent
   */
  const generateReactCode = () => {
    if (!agent) return '';
    
    const welcomeMsg = customization.welcomeMessage || `Hello! I'm ${agent.name}. How can I help you today?`;
    
    return `import React, { useEffect, useState } from 'react';

const CanistChatWidget = () => {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    // Session management for conversation history
    const getOrCreateSessionId = () => {
      const storageKey = \`canistchat_session_${escapeJsString(agent.id)}\`;
      let sessionId = localStorage.getItem(storageKey);
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(storageKey, sessionId);
      }
      return sessionId;
    };

    setSessionId(getOrCreateSessionId());
  }, []);

  if (!sessionId) return <div>Loading...</div>;

  const embedUrl = new URL('https://giyqx-pqaaa-aaaab-aagza-cai.icp0.io/embed');
  embedUrl.searchParams.set('agent', '${escapeJsString(agent.id)}');
  embedUrl.searchParams.set('theme', '${escapeJsString(customization.theme)}');
  embedUrl.searchParams.set('color', '${escapeJsString(customization.primaryColor)}');
  embedUrl.searchParams.set('welcome', '${escapeJsString(welcomeMsg)}');
  embedUrl.searchParams.set('placeholder', '${escapeJsString(customization.placeholder)}');
  embedUrl.searchParams.set('sessionId', sessionId);

  return (
    <iframe
      src={embedUrl.toString()}
      width="${escapeJsString(customization.width)}"
      height="${escapeJsString(customization.height)}"
      style={{
        border: 'none',
        borderRadius: '${escapeJsString(customization.borderRadius)}',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}
      allow="encrypted-media"
      title="${escapeJsString(agent.name)} - AI Assistant"
    />
  );
};

export default CanistChatWidget;`;
  };

  /**
   * Generates WordPress shortcode and PHP function code
   * 
   * Creates WordPress-specific code including a shortcode for easy embedding
   * and a PHP function that can be added to theme files for custom integration.
   * 
   * @returns WordPress code as a string, or empty string if no agent
   */
  const generateWordPressCode = () => {
    if (!agent) return '';
    
    return `<!-- Add this shortcode to any page or post -->
[canistchat agent="${escapeJsString(agent.id)}" theme="${escapeJsString(customization.theme)}" color="${escapeJsString(customization.primaryColor)}" width="${escapeJsString(customization.width)}" height="${escapeJsString(customization.height)}"]

<!-- Or add this to your theme's functions.php file -->
function canistchat_shortcode($atts) {
    $atts = shortcode_atts(array(
        'agent' => '${escapeJsString(agent.id)}',
        'theme' => '${escapeJsString(customization.theme)}',
        'color' => '${escapeJsString(customization.primaryColor)}',
        'width' => '${escapeJsString(customization.width)}',
        'height' => '${escapeJsString(customization.height)}'
    ), $atts);
    
    // Generate or retrieve session ID for conversation history
    $session_key = 'canistchat_session_' . $atts['agent'];
    $session_id = get_transient($session_key);
    if (!$session_id) {
        $session_id = 'session_' . time() . '_' . wp_generate_password(9, false);
        set_transient($session_key, $session_id, 30 * DAY_IN_SECONDS); // 30 days
    }
    
    $embed_url = add_query_arg(array(
        'agent' => esc_attr($atts['agent']),
        'theme' => esc_attr($atts['theme']),
        'color' => urlencode($atts['color']),
        'sessionId' => $session_id
    ), 'https://giyqx-pqaaa-aaaab-aagza-cai.icp0.io/embed');
    
    return '<iframe src="' . esc_url($embed_url) . '" width="' . esc_attr($atts['width']) . '" height="' . esc_attr($atts['height']) . '" style="border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" allow="encrypted-media" title="AI Assistant"></iframe>';
    }
add_shortcode('canistchat', 'canistchat_shortcode');`;
  };

  /**
   * Opens a test window to preview the embed widget
   * 
   * Opens a new browser window with the configured widget for live testing.
   * The window is sized appropriately for widget testing.
   */
  const openTestWindow = () => {
    if (!agent) return;
    
    // Generate a test session ID for the test window
    const testSessionId = 'test_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const testUrl = new URL('https://giyqx-pqaaa-aaaab-aagza-cai.icp0.io/embed');
    testUrl.searchParams.set('agent', agent.id);
    testUrl.searchParams.set('theme', customization.theme);
    testUrl.searchParams.set('color', customization.primaryColor);
    testUrl.searchParams.set('welcome', customization.welcomeMessage || `Hello! I'm ${agent.name}. How can I help you today?`);
    testUrl.searchParams.set('placeholder', customization.placeholder);
    testUrl.searchParams.set('sessionId', testSessionId);
    
    window.open(testUrl.toString(), '_blank', 'width=500,height=700,scrollbars=yes,resizable=yes');
  };

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================

  // Show placeholder when no agent is selected
  if (!agent) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
          <CodeBracketIcon className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Embed Widget Generator</h3>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto">
          Select an agent to generate embed code and integration instructions
        </p>
      </div>
    );
  }

  return (
    <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                  Embed Widget Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                  Generate embed code and integration instructions for <span className="font-semibold">{agent.name}</span>
              </p>
            </div>
            </div>

      {/* Tabs */}
      <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-6 py-4 text-sm font-semibold transition-all duration-200 border-b-2 ${
              activeTab === 'generator'
                ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Cog6ToothIcon className="w-4 h-4 inline mr-2" />
            Generator
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-6 py-4 text-sm font-semibold transition-all duration-200 border-b-2 ${
              activeTab === 'instructions'
                ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <InformationCircleIcon className="w-4 h-4 inline mr-2" />
            Instructions
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8 bg-slate-50 dark:bg-slate-800/50">
        {activeTab === 'generator' && (
          <div className="space-y-8">
      {/* Customization Options */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Cog6ToothIcon className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Customization Options</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Width
          </label>
          <input
            type="text"
            value={customization.width}
            onChange={(e) => setCustomization({...customization, width: e.target.value})}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="400px"
          />
                      </div>

                      <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Height
          </label>
          <input
            type="text"
            value={customization.height}
            onChange={(e) => setCustomization({...customization, height: e.target.value})}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="600px"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Theme
          </label>
          <select
            value={customization.theme}
            onChange={(e) => setCustomization({...customization, theme: e.target.value as 'light' | 'dark' | 'auto'})}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
                      </div>

                      <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Position
          </label>
          <select
            value={customization.position}
            onChange={(e) => setCustomization({...customization, position: e.target.value as 'inline' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'})}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="inline">Inline</option>
            <option value="bottom-right">Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="top-right">Top Right</option>
            <option value="top-left">Top Left</option>
          </select>
                      </div>

                      <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Primary Color
          </label>
          <div className="relative">
            <input
                            type="color"
              value={customization.primaryColor}
              onChange={(e) => setCustomization({...customization, primaryColor: e.target.value})}
              className="w-full h-12 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
            />
            <div className="absolute inset-0 rounded-lg border border-slate-300 dark:border-slate-600 pointer-events-none"></div>
                        </div>
                      </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Border Radius
          </label>
          <input
            type="text"
            value={customization.borderRadius}
            onChange={(e) => setCustomization({...customization, borderRadius: e.target.value})}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="12px"
          />
                      </div>

                      <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Welcome Message
                  </label>
                  <input
                    type="text"
                    value={customization.welcomeMessage}
                    onChange={(e) => setCustomization({...customization, welcomeMessage: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={`Hello! I'm ${agent.name}. How can I help you today?`}
                        />
                      </div>

                      <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Input Placeholder
                  </label>
                  <input
                    type="text"
                    value={customization.placeholder}
                    onChange={(e) => setCustomization({...customization, placeholder: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Type your message..."
                        />
                      </div>
                        </div>
                        
              {/* Toggle Options */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h5 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Widget Options</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={customization.showHeader}
                      onChange={(e) => setCustomization({...customization, showHeader: e.target.checked})}
                      className="mr-3 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Header</span>
                  </label>
                  <label className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={customization.showPoweredBy}
                      onChange={(e) => setCustomization({...customization, showPoweredBy: e.target.checked})}
                      className="mr-3 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show "Powered by"</span>
                  </label>
                  <label className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={customization.minimizable}
                      onChange={(e) => setCustomization({...customization, minimizable: e.target.checked})}
                      className="mr-3 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Minimizable</span>
                  </label>
                  <label className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={customization.autoOpen}
                      onChange={(e) => setCustomization({...customization, autoOpen: e.target.checked})}
                      className="mr-3 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto Open</span>
                  </label>
                </div>
              </div>
                        </div>

      {/* Preview */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <EyeIcon className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Live Preview</h4>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-8 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-center">
                  <div 
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-600 overflow-hidden"
            style={{
              width: customization.width,
                      height: '300px',
              borderRadius: customization.borderRadius,
                      maxWidth: '100%'
                    }}
                  >
                    {customization.showHeader && (
            <div 
                        className="p-4 text-white"
                        style={{ backgroundColor: customization.primaryColor }}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm">🤖</span>
                                </div>
                                <div>
                            <h3 className="font-semibold">{agent.name}</h3>
                            <p className="text-xs opacity-90">AI Assistant</p>
                                </div>
                              </div>
                            </div>
                    )}
                    <div className={`p-4 flex-1 ${customization.theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                      <div className="space-y-3">
                        <div className={`${customization.theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'} rounded-lg p-3 max-w-xs`}>
                          <p className="text-sm">{customization.welcomeMessage || `Hello! I'm ${agent.name}. How can I help you today?`}</p>
                                </div>
                        <div className="flex justify-end">
                          <div className="rounded-lg p-3 max-w-xs text-white" style={{ backgroundColor: customization.primaryColor }}>
                            <p className="text-sm">Hello! Can you help me?</p>
                              </div>
                            </div>
                      </div>
                      <div className={`mt-4 pt-4 border-t ${customization.theme === 'dark' ? 'border-slate-600' : 'border-slate-200'}`}>
                        <input
                          type="text"
                          placeholder={customization.placeholder}
                          className={`w-full px-3 py-2 border rounded-lg text-sm ${
                            customization.theme === 'dark' 
                              ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400' 
                              : 'border-slate-300 bg-white text-slate-900 placeholder-slate-500'
                          }`}
                          disabled
                        />
                      </div>
            </div>
            </div>
          </div>
                              </div>
                            </div>

      {/* Generated Code */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <CodeBracketIcon className="w-5 h-5 text-white" />
                                </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Generated Embed Code</h4>
                              </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => copyToClipboard(embedCode, 'html')}
                    className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      copySuccess === 'html'
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    {copySuccess === 'html' ? (
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                    ) : (
                      <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                    )}
                    {copySuccess === 'html' ? 'Copied!' : 'Copy HTML'}
                  </button>
                  <button
                    onClick={openTestWindow}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Test Widget
                  </button>
                          </div>
                        </div>
              <div className="relative">
                <textarea
                  value={embedCode}
                  readOnly
                  className="w-full h-48 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Embed code will appear here..."
                />
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded">HTML</span>
                      </div>
              </div>
                </div>

            {/* Additional Integration Options */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <GlobeAltIcon className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Platform Integration</h4>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">R</span>
                      <h5 className="font-semibold text-slate-900 dark:text-white">React Component</h5>
                    </div>
                    <button
                      onClick={() => copyToClipboard(generateReactCode(), 'react')}
                      className={`px-3 py-1 text-xs font-semibold rounded transition-all duration-200 ${
                        copySuccess === 'react'
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {copySuccess === 'react' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                    <div className="relative">
                    <textarea
                      value={generateReactCode()}
                      readOnly
                      className="w-full h-40 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs resize-none focus:outline-none"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded">JSX</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">W</span>
                      <h5 className="font-semibold text-slate-900 dark:text-white">WordPress Shortcode</h5>
                    </div>
                    <button
                      onClick={() => copyToClipboard(generateWordPressCode(), 'wordpress')}
                      className={`px-3 py-1 text-xs font-semibold rounded transition-all duration-200 ${
                        copySuccess === 'wordpress'
                          ? 'bg-green-600 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {copySuccess === 'wordpress' ? 'Copied!' : 'Copy'}
                    </button>
                    </div>
                  <div className="relative">
                    <textarea
                      value={generateWordPressCode()}
                      readOnly
                      className="w-full h-40 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs resize-none focus:outline-none"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-semibold rounded">PHP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'instructions' && (
          <div className="space-y-8">
            {/* Quick Start */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                              </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Quick Start Guide</h4>
                            </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <ol className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5 shadow-lg">1</div>
                              <div>
                      <h5 className="font-semibold text-slate-900 dark:text-white mb-1">Copy the embed code</h5>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Go to the Generator tab above and copy the generated HTML embed code</p>
                              </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5 shadow-lg">2</div>
                    <div>
                      <h5 className="font-semibold text-slate-900 dark:text-white mb-1">Paste into your website</h5>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Add the code to your website's HTML where you want the chat widget to appear</p>
                            </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5 shadow-lg">3</div>
                              <div>
                      <h5 className="font-semibold text-slate-900 dark:text-white mb-1">Save and publish</h5>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">The widget will automatically load and connect to your agent once the page is live</p>
                              </div>
                  </li>
                </ol>
                            </div>
                          </div>

            {/* Platform-Specific Instructions */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <GlobeAltIcon className="w-5 h-5 text-white" />
                              </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Platform-Specific Instructions</h4>
                            </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* WordPress */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <GlobeAltIcon className="w-5 h-5 text-white" />
                              </div>
                    <h5 className="font-bold text-slate-900 dark:text-white">WordPress</h5>
                            </div>
                  <ol className="text-sm space-y-3 text-slate-600 dark:text-slate-400">
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">1</span>
                      <span>Go to your WordPress admin panel</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">2</span>
                      <span>Edit the page/post where you want the widget</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">3</span>
                      <span>Switch to "Text" or "HTML" mode</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">4</span>
                      <span>Paste the embed code</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">5</span>
                      <span>Update/publish the page</span>
                    </li>
                  </ol>
                              </div>

                {/* Shopify */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                      <ComputerDesktopIcon className="w-5 h-5 text-white" />
                            </div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Shopify</h5>
                          </div>
                  <ol className="text-sm space-y-3 text-slate-600 dark:text-slate-400">
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">1</span>
                      <span>Go to Online Store → Themes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">2</span>
                      <span>Click "Actions" → "Edit code"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">3</span>
                      <span>Find your theme.liquid file</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">4</span>
                      <span>Paste the code before &lt;/body&gt;</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">5</span>
                      <span>Save the file</span>
                    </li>
                  </ol>
                </div>

                {/* Squarespace */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <DevicePhoneMobileIcon className="w-5 h-5 text-white" />
                              </div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Squarespace</h5>
                            </div>
                  <ol className="text-sm space-y-3 text-slate-600 dark:text-slate-400">
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">1</span>
                      <span>Go to Settings → Advanced → Code Injection</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">2</span>
                      <span>Paste the code in "Footer"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">3</span>
                      <span>Or use a Code Block on specific pages</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">4</span>
                      <span>Save and publish</span>
                    </li>
                  </ol>
                              </div>
                            </div>
                              </div>

            {/* Advanced Configuration */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Cog6ToothIcon className="w-5 h-5 text-white" />
                            </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Advanced Configuration</h4>
                          </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <h5 className="font-bold text-slate-900 dark:text-white mb-4">Customization Options</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                    <h6 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                      Position Options
                    </h6>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <li className="flex items-center"><code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs mr-2">inline</code> Embedded in page content</li>
                      <li className="flex items-center"><code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs mr-2">bottom-right</code> Floating bottom right</li>
                      <li className="flex items-center"><code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs mr-2">bottom-left</code> Floating bottom left</li>
                      <li className="flex items-center"><code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs mr-2">top-right</code> Floating top right</li>
                      <li className="flex items-center"><code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs mr-2">top-left</code> Floating top left</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                    <h6 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                      <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                      Theme Options
                    </h6>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <li className="flex items-center"><code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs mr-2">light</code> Light theme</li>
                      <li className="flex items-center"><code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs mr-2">dark</code> Dark theme</li>
                      <li className="flex items-center"><code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs mr-2">auto</code> Matches system preference</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation History Feature */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <InformationCircleIcon className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Conversation History</h4>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                              <div>
                      <h6 className="font-semibold text-slate-900 dark:text-white mb-1">Automatic Session Management</h6>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">The embed widget automatically manages conversation history using localStorage for each visitor.</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-teal-600 rounded-full mt-2"></div>
                              <div>
                      <h6 className="font-semibold text-slate-900 dark:text-white mb-1">Persistent Conversations</h6>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Visitors can close and reopen the chat widget while maintaining their conversation context.</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                              <div>
                      <h6 className="font-semibold text-slate-900 dark:text-white mb-1">Privacy-Focused</h6>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Session data is stored locally in the user's browser and expires automatically after 30 days.</p>
                              </div>
                            </div>
                          </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                          </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Troubleshooting</h4>
                        </div>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                    <h6 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Widget not appearing?
                    </h6>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Check that the container div ID matches the agent ID in the script and ensure JavaScript is enabled.</p>
                          </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                    <h6 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      Widget not loading?
                    </h6>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Ensure your website allows iframe content and check browser console for errors. Verify HTTPS is being used.</p>
                        </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                    <h6 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Styling issues?
                    </h6>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">The widget uses iframe isolation, so your site's CSS won't affect it. Customize using the options in the Generator tab.</p>
                          </div>
                        </div>
                          </div>
                        </div>
                      </div>
        )}

        {activeTab === 'testing' && (
          <div className="space-y-6">
            {/* Testing Options */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Test Your Widget</h4>
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setTestingMode('preview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    testingMode === 'preview'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Preview Mode
                </button>
                <button
                  onClick={() => setTestingMode('live')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    testingMode === 'live'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Live Test
                </button>
                </div>
            </div>

            {testingMode === 'preview' && (
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Widget Preview</h5>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div 
                    className="mx-auto"
                    style={{ width: customization.width, maxWidth: '100%' }}
                  >
                    <iframe
                      src={(() => {
                        const previewUrl = new URL('https://giyqx-pqaaa-aaaab-aagza-cai.icp0.io/embed');
                        previewUrl.searchParams.set('agent', agent.id);
                        previewUrl.searchParams.set('theme', customization.theme);
                        previewUrl.searchParams.set('color', customization.primaryColor);
                        previewUrl.searchParams.set('welcome', customization.welcomeMessage || `Hello! I'm ${agent.name}. How can I help you today?`);
                        previewUrl.searchParams.set('placeholder', customization.placeholder);
                        previewUrl.searchParams.set('sessionId', 'preview_session_' + Date.now());
                        return previewUrl.toString();
                      })()}
                      width="100%"
                      height={customization.height}
                      style={{
                        border: 'none',
                        borderRadius: customization.borderRadius,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                      }}
                      title={`${agent.name} - AI Assistant Preview`}
                    />
                          </div>
                      </div>
                      </div>
            )}

            {testingMode === 'live' && (
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Live Testing</h5>
                <div className="space-y-4">
                  <button
                    onClick={openTestWindow}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Open Widget in New Window
                  </button>
                  <p className="text-sm text-gray-600">
                    This will open your widget in a new window so you can test the full functionality,
                    including chat interactions and responsiveness.
                  </p>
                          </div>
                          </div>
            )}

            {/* Testing Checklist */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Testing Checklist</h5>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <label className="flex items-start">
                    <input type="checkbox" className="mt-1 mr-3" />
                    <span className="text-sm">Widget loads correctly</span>
                  </label>
                  <label className="flex items-start">
                    <input type="checkbox" className="mt-1 mr-3" />
                    <span className="text-sm">Chat interface is responsive</span>
                  </label>
                  <label className="flex items-start">
                    <input type="checkbox" className="mt-1 mr-3" />
                    <span className="text-sm">Messages send and receive properly</span>
                  </label>
                  <label className="flex items-start">
                    <input type="checkbox" className="mt-1 mr-3" />
                    <span className="text-sm">Styling matches your preferences</span>
                  </label>
                  <label className="flex items-start">
                    <input type="checkbox" className="mt-1 mr-3" />
                    <span className="text-sm">Widget works on mobile devices</span>
                  </label>
                  <label className="flex items-start">
                    <input type="checkbox" className="mt-1 mr-3" />
                    <span className="text-sm">Minimize/maximize functionality works (if enabled)</span>
                  </label>
                      </div>
                      </div>
                      </div>
                    </div>
        )}
      </div>
          </div>
        </main>
  );
};

export default EmbedGenerator; 