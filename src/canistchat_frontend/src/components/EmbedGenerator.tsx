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

  // Create iframe for secure embedding
  const iframe = document.createElement('iframe');
  const embedUrl = new URL(\`https://\${config.frontendCanisterId}.icp0.io/embed\`);
  embedUrl.searchParams.set('agent', config.agentId);
  embedUrl.searchParams.set('theme', config.theme);
  embedUrl.searchParams.set('color', config.primaryColor.replace('#', '%23'));
  embedUrl.searchParams.set('welcome', config.welcomeMessage);
  embedUrl.searchParams.set('placeholder', config.placeholder);
  
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
    
    return `import React from 'react';

const CanistChatWidget = () => {
  const embedUrl = new URL('https://giyqx-pqaaa-aaaab-aagza-cai.icp0.io/embed');
  embedUrl.searchParams.set('agent', '${escapeJsString(agent.id)}');
  embedUrl.searchParams.set('theme', '${escapeJsString(customization.theme)}');
  embedUrl.searchParams.set('color', '${escapeJsString(customization.primaryColor)}');
  embedUrl.searchParams.set('welcome', '${escapeJsString(welcomeMsg)}');
  embedUrl.searchParams.set('placeholder', '${escapeJsString(customization.placeholder)}');

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
    
    return '<iframe src="https://giyqx-pqaaa-aaaab-aagza-cai.icp0.io/embed?agent=' . esc_attr($atts['agent']) . '&theme=' . esc_attr($atts['theme']) . '&color=' . urlencode($atts['color']) . '" width="' . esc_attr($atts['width']) . '" height="' . esc_attr($atts['height']) . '" style="border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" allow="encrypted-media" title="AI Assistant"></iframe>';
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
    
    const testUrl = new URL('https://giyqx-pqaaa-aaaab-aagza-cai.icp0.io/embed');
    testUrl.searchParams.set('agent', agent.id);
    testUrl.searchParams.set('theme', customization.theme);
    testUrl.searchParams.set('color', customization.primaryColor);
    testUrl.searchParams.set('welcome', customization.welcomeMessage || `Hello! I'm ${agent.name}. How can I help you today?`);
    testUrl.searchParams.set('placeholder', customization.placeholder);
    
    window.open(testUrl.toString(), '_blank', 'width=500,height=700,scrollbars=yes,resizable=yes');
  };

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================

  // Show placeholder when no agent is selected
  if (!agent) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <CodeBracketIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Embed Widget Generator</h3>
        <p className="text-gray-500">Select an agent to generate embed code and integration instructions</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Embed Widget Generator
      </h3>
        <p className="text-gray-600">
          Generate embed code and integration instructions for <strong>{agent.name}</strong>
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'generator'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Cog6ToothIcon className="w-4 h-4 inline mr-2" />
            Generator
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'instructions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <InformationCircleIcon className="w-4 h-4 inline mr-2" />
            Instructions
          </button>
          <button
            onClick={() => setActiveTab('testing')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'testing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <PlayIcon className="w-4 h-4 inline mr-2" />
            Testing
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'generator' && (
          <div className="space-y-6">
      {/* Customization Options */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Customization Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Width
          </label>
          <input
            type="text"
            value={customization.width}
            onChange={(e) => setCustomization({...customization, width: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="400px"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height
          </label>
          <input
            type="text"
            value={customization.height}
            onChange={(e) => setCustomization({...customization, height: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="600px"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            value={customization.theme}
            onChange={(e) => setCustomization({...customization, theme: e.target.value as 'light' | 'dark' | 'auto'})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position
          </label>
          <select
            value={customization.position}
            onChange={(e) => setCustomization({...customization, position: e.target.value as 'inline' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="inline">Inline</option>
            <option value="bottom-right">Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="top-right">Top Right</option>
            <option value="top-left">Top Left</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Color
          </label>
          <input
            type="color"
            value={customization.primaryColor}
            onChange={(e) => setCustomization({...customization, primaryColor: e.target.value})}
            className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Border Radius
          </label>
          <input
            type="text"
            value={customization.borderRadius}
            onChange={(e) => setCustomization({...customization, borderRadius: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="12px"
          />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Welcome Message
                  </label>
                  <input
                    type="text"
                    value={customization.welcomeMessage}
                    onChange={(e) => setCustomization({...customization, welcomeMessage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Hello! I'm ${agent.name}. How can I help you today?`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Input Placeholder
                  </label>
                  <input
                    type="text"
                    value={customization.placeholder}
                    onChange={(e) => setCustomization({...customization, placeholder: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message..."
                  />
                </div>
              </div>

              {/* Toggle Options */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customization.showHeader}
                    onChange={(e) => setCustomization({...customization, showHeader: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Show Header</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customization.showPoweredBy}
                    onChange={(e) => setCustomization({...customization, showPoweredBy: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Show "Powered by"</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customization.minimizable}
                    onChange={(e) => setCustomization({...customization, minimizable: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Minimizable</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customization.autoOpen}
                    onChange={(e) => setCustomization({...customization, autoOpen: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Auto Open</span>
                </label>
        </div>
      </div>

      {/* Preview */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Preview</h4>
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                <div className="flex items-center justify-center">
                  <div 
                    className="bg-white rounded-lg shadow-lg border overflow-hidden"
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
                            <h3 className="font-medium">{agent.name}</h3>
                            <p className="text-sm opacity-90">AI Assistant</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className={`p-4 flex-1 ${customization.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                      <div className="space-y-3">
                        <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                          <p className="text-sm">{customization.welcomeMessage || `Hello! I'm ${agent.name}. How can I help you today?`}</p>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-blue-500 text-white rounded-lg p-3 max-w-xs">
                            <p className="text-sm">Hello! Can you help me?</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <input
                          type="text"
                          placeholder={customization.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          disabled
                        />
                      </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Code */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Generated Embed Code</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(embedCode, 'html')}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                    {copySuccess === 'html' ? 'Copied!' : 'Copy HTML'}
                  </button>
          <button
                    onClick={openTestWindow}
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Test Widget
          </button>
                </div>
        </div>
        <textarea
          value={embedCode}
          readOnly
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm focus:outline-none"
          placeholder="Embed code will appear here..."
        />
      </div>

            {/* Additional Integration Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-gray-900">React Component</h5>
                  <button
                    onClick={() => copyToClipboard(generateReactCode(), 'react')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {copySuccess === 'react' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  value={generateReactCode()}
                  readOnly
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-xs"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-gray-900">WordPress Shortcode</h5>
                  <button
                    onClick={() => copyToClipboard(generateWordPressCode(), 'wordpress')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {copySuccess === 'wordpress' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  value={generateWordPressCode()}
                  readOnly
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'instructions' && (
          <div className="space-y-8">
            {/* Quick Start */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                Quick Start Guide
              </h4>
              <div className="bg-green-50 rounded-lg p-6">
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                    <div>
                      <strong>Copy the embed code</strong> from the Generator tab above
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                    <div>
                      <strong>Paste it into your website's HTML</strong> where you want the chat widget to appear
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                    <div>
                      <strong>Save and publish</strong> your page - the widget will automatically load and connect to your agent
                    </div>
                  </li>
                </ol>
              </div>
            </div>

            {/* Platform-Specific Instructions */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Platform-Specific Instructions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* WordPress */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <GlobeAltIcon className="w-6 h-6 text-blue-600 mr-2" />
                    <h5 className="font-medium">WordPress</h5>
                  </div>
                  <ol className="text-sm space-y-2 text-gray-600">
                    <li>1. Go to your WordPress admin panel</li>
                    <li>2. Edit the page/post where you want the widget</li>
                    <li>3. Switch to "Text" or "HTML" mode</li>
                    <li>4. Paste the embed code</li>
                    <li>5. Update/publish the page</li>
                  </ol>
                </div>

                {/* Shopify */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <ComputerDesktopIcon className="w-6 h-6 text-green-600 mr-2" />
                    <h5 className="font-medium">Shopify</h5>
                  </div>
                  <ol className="text-sm space-y-2 text-gray-600">
                    <li>1. Go to Online Store → Themes</li>
                    <li>2. Click "Actions" → "Edit code"</li>
                    <li>3. Find your theme.liquid file</li>
                    <li>4. Paste the code before &lt;/body&gt;</li>
                    <li>5. Save the file</li>
                  </ol>
                </div>

                {/* Squarespace */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <DevicePhoneMobileIcon className="w-6 h-6 text-purple-600 mr-2" />
                    <h5 className="font-medium">Squarespace</h5>
                  </div>
                  <ol className="text-sm space-y-2 text-gray-600">
                    <li>1. Go to Settings → Advanced → Code Injection</li>
                    <li>2. Paste the code in "Footer"</li>
                    <li>3. Or use a Code Block on specific pages</li>
                    <li>4. Save and publish</li>
        </ol>
                </div>
              </div>
            </div>

            {/* Advanced Configuration */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Advanced Configuration</h4>
              <div className="bg-blue-50 rounded-lg p-6">
                <h5 className="font-medium text-blue-900 mb-3">Customization Options</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h6 className="font-medium text-blue-800 mb-2">Position Options</h6>
                    <ul className="space-y-1 text-blue-700">
                      <li>• <code>inline</code> - Embedded in page content</li>
                      <li>• <code>bottom-right</code> - Floating bottom right</li>
                      <li>• <code>bottom-left</code> - Floating bottom left</li>
                      <li>• <code>top-right</code> - Floating top right</li>
                      <li>• <code>top-left</code> - Floating top left</li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-medium text-blue-800 mb-2">Theme Options</h6>
                    <ul className="space-y-1 text-blue-700">
                      <li>• <code>light</code> - Light theme</li>
                      <li>• <code>dark</code> - Dark theme</li>
                      <li>• <code>auto</code> - Matches system preference</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                Troubleshooting
              </h4>
              <div className="bg-yellow-50 rounded-lg p-6">
                <div className="space-y-4 text-sm">
                  <div>
                    <h6 className="font-medium text-yellow-800 mb-1">Widget not appearing?</h6>
                    <p className="text-yellow-700">Check that the container div ID matches the agent ID in the script.</p>
                  </div>
                  <div>
                    <h6 className="font-medium text-yellow-800 mb-1">Widget not loading?</h6>
                    <p className="text-yellow-700">Ensure your website allows iframe content and check browser console for errors.</p>
                  </div>
                  <div>
                    <h6 className="font-medium text-yellow-800 mb-1">Styling issues?</h6>
                    <p className="text-yellow-700">The widget uses iframe isolation, so your site's CSS won't affect it. Customize using the options above.</p>
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
  );
};

export default EmbedGenerator; 