# CanistChat SDK

A comprehensive SDK for integrating AI agents powered by Internet Computer into web applications, mobile apps, and other platforms.

## 🚀 Features

- **🤖 Agent Integration**: Seamlessly integrate AI agents into your applications
- **💬 Embeddable Widgets**: Drop-in chat widgets for websites
- **⚡ Real-time Chat**: Fast, responsive chat experiences
- **🔐 Secure Authentication**: Internet Identity integration
- **🎨 Customizable UI**: Themeable and customizable widget components
- **📱 Responsive Design**: Works across desktop and mobile devices
- **🌐 Cross-platform**: Works with React, vanilla JS, and other frameworks
- **🔧 TypeScript Support**: Full type safety and IDE support

## 📦 Installation

```bash
npm install @canistchat/sdk
```

Or with yarn:

```bash
yarn add @canistchat/sdk
```

## 🎯 Quick Start

### Basic Usage

```typescript
import { initCanistChat } from '@canistchat/sdk';

// Initialize the SDK
const canistChat = await initCanistChat({
  network: 'ic', // or 'local' for development
  agentManagerCanisterId: 'your-agent-manager-canister-id',
  apiKey: 'your-api-key' // optional for public agents
});

// Get an agent and start chatting
const agent = await canistChat.getAgent('agent-id');
const response = await canistChat.chat('agent-id', 'Hello!');
console.log(response.content);
```

### Embeddable Chat Widget

```typescript
import { createChatWidget } from '@canistchat/sdk';

// Create a chat widget
const widget = createChatWidget({
  agentId: 'your-agent-id',
  agentManagerCanisterId: 'your-canister-id',
  containerId: 'chat-widget-container',
  theme: 'light',
  position: 'bottom-right'
});
```

### React Hooks

```typescript
import { useCanistChat, useAgent } from '@canistchat/sdk';

function ChatComponent() {
  const { sdk, isConnected } = useCanistChat({
    agentManagerCanisterId: 'your-canister-id',
    network: 'ic'
  });

  const { agent, loading } = useAgent({
    agentId: 'your-agent-id'
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>{agent?.name}</h2>
      <p>{agent?.description}</p>
    </div>
  );
}
```

## 🏗️ Core Components

### CanistChatSDK

The main SDK class providing comprehensive agent integration capabilities.

```typescript
import { CanistChatSDK } from '@canistchat/sdk';

const sdk = new CanistChatSDK({
  network: 'ic',
  agentManagerCanisterId: 'canister-id',
  apiKey: 'optional-api-key'
});

await sdk.initialize();
```

#### Methods

- `initialize()` - Initialize the SDK and establish connection
- `authenticate()` - Authenticate with Internet Identity
- `getAgent(agentId)` - Get a specific agent by ID
- `getAgents()` - Get all available agents
- `createAgent(agentData)` - Create a new agent
- `chat(agentId, message)` - Send a message to an agent
- `getHealthStatus()` - Get system health status
- `on(event, callback)` - Subscribe to events
- `off(event, callback)` - Unsubscribe from events

### ChatWidget

Embeddable chat widget for websites.

```typescript
import { ChatWidget } from '@canistchat/sdk';

const widget = new ChatWidget({
  agentId: 'agent-id',
  agentManagerCanisterId: 'canister-id',
  containerId: 'widget-container',
  theme: 'light',
  position: 'bottom-right',
  customStyles: {
    primaryColor: '#007bff',
    borderRadius: '12px'
  }
});
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `agentId` | string | - | ID of the agent to chat with |
| `agentManagerCanisterId` | string | - | Canister ID for agent manager |
| `containerId` | string | - | DOM element ID to render widget |
| `theme` | 'light' \| 'dark' \| 'auto' | 'light' | Widget theme |
| `position` | 'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left' \| 'center' \| 'inline' | 'bottom-right' | Widget position |
| `size` | 'small' \| 'medium' \| 'large' \| 'custom' | 'medium' | Widget size |
| `customStyles` | WidgetStyles | - | Custom CSS styles |

## 🎨 Customization

### Widget Styling

```typescript
const widget = createChatWidget({
  agentId: 'agent-id',
  agentManagerCanisterId: 'canister-id',
  containerId: 'widget-container',
  customStyles: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif',
    width: '400px',
    height: '600px'
  }
});
```

### Themes

Built-in themes: `light`, `dark`, `auto`

```typescript
// Light theme (default)
theme: 'light'

// Dark theme
theme: 'dark'

// Auto theme (follows system preference)
theme: 'auto'
```

## 📱 React Integration

### useCanistChat Hook

```typescript
import { useCanistChat } from '@canistchat/sdk';

function App() {
  const { 
    sdk, 
    isConnected, 
    isAuthenticated, 
    error 
  } = useCanistChat({
    agentManagerCanisterId: 'canister-id',
    network: 'ic',
    autoConnect: true
  });

  return (
    <div>
      {isConnected ? 'Connected' : 'Connecting...'}
    </div>
  );
}
```

### useAgent Hook

```typescript
import { useAgent } from '@canistchat/sdk';

function AgentProfile({ agentId }) {
  const { 
    agent, 
    loading, 
    error, 
    reload 
  } = useAgent({
    agentId,
    autoLoad: true
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>{agent.name}</h2>
      <p>{agent.description}</p>
      <button onClick={reload}>Reload</button>
    </div>
  );
}
```

### useChatSession Hook

```typescript
import { useChatSession } from '@canistchat/sdk';

function ChatInterface({ agentId }) {
  const {
    messages,
    sendMessage,
    isLoading,
    error,
    clearMessages
  } = useChatSession({
    agentId,
    autoStart: true,
    persistSession: true
  });

  const handleSend = (message) => {
    sendMessage(message);
  };

  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <input 
        onKeyPress={(e) => e.key === 'Enter' && handleSend(e.target.value)}
        placeholder="Type a message..."
      />
    </div>
  );
}
```

## 🌐 Web Components

For vanilla JavaScript projects, you can use Web Components:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/@canistchat/sdk/dist/index.js"></script>
</head>
<body>
  <canistchat-widget
    agent-id="your-agent-id"
    agent-manager-canister-id="your-canister-id"
    theme="light"
    position="bottom-right">
  </canistchat-widget>

  <script>
    // Register web components
    CanistChatSDK.registerWebComponents();
  </script>
</body>
</html>
```

## 🔧 Configuration

### Network Configuration

```typescript
// Local development
const sdk = new CanistChatSDK({
  network: 'local',
  host: 'http://localhost:4943',
  agentManagerCanisterId: 'local-canister-id'
});

// Production IC network
const sdk = new CanistChatSDK({
  network: 'ic',
  agentManagerCanisterId: 'production-canister-id',
  apiKey: 'your-api-key'
});
```

### Authentication

```typescript
// Authenticate with Internet Identity
await sdk.authenticate();

// Check authentication status
if (sdk.isAuthenticated()) {
  console.log('User is authenticated');
  console.log('Principal:', sdk.getIdentity().getPrincipal().toString());
}

// Logout
await sdk.logout();
```

## 📊 Events

The SDK emits various events that you can listen to:

```typescript
// Agent events
sdk.on('agent:loaded', ({ agent }) => {
  console.log('Agent loaded:', agent.name);
});

sdk.on('agent:error', ({ error, agentId }) => {
  console.error('Agent error:', error);
});

// Chat events
sdk.on('chat:message', ({ message, sessionId }) => {
  console.log('User message:', message.content);
});

sdk.on('chat:response', ({ message, sessionId }) => {
  console.log('Agent response:', message.content);
});

// Widget events
widget.on('open', () => {
  console.log('Widget opened');
});

widget.on('close', () => {
  console.log('Widget closed');
});
```

## 🚨 Error Handling

```typescript
try {
  const agent = await sdk.getAgent('non-existent-agent');
} catch (error) {
  if (error instanceof AgentError) {
    console.error('Agent error:', error.message);
    console.error('Agent ID:', error.details.agentId);
  } else if (error instanceof SDKError) {
    console.error('SDK error:', error.code, error.message);
  }
}
```

## 🔍 Debugging

Enable debug mode to see detailed logs:

```typescript
// Enable debugging
sdk.enableDebug();

// Access logs
const logs = sdk.logger.getLogs();
console.log('SDK logs:', logs);

// Export logs
const logsJson = sdk.logger.exportLogs();
```

## 🧪 Examples

### Basic Chat Bot

```html
<!DOCTYPE html>
<html>
<head>
  <title>CanistChat Example</title>
</head>
<body>
  <div id="chat-widget"></div>
  
  <script type="module">
    import { createChatWidget } from '@canistchat/sdk';
    
    const widget = createChatWidget({
      agentId: 'customer-support-agent',
      agentManagerCanisterId: 'rdmx6-jaaaa-aaaaa-aaadq-cai',
      containerId: 'chat-widget',
      theme: 'light',
      position: 'bottom-right'
    });
    
    widget.on('message', ({ message }) => {
      console.log('New message:', message.content);
    });
  </script>
</body>
</html>
```

### React Chat Application

```typescript
import React from 'react';
import { useCanistChat, useChatSession } from '@canistchat/sdk';

function ChatApp() {
  const { sdk, isConnected } = useCanistChat({
    agentManagerCanisterId: 'rdmx6-jaaaa-aaaaa-aaadq-cai',
    network: 'ic'
  });

  const { messages, sendMessage, isLoading } = useChatSession({
    agentId: 'helpful-assistant',
    autoStart: true
  });

  if (!isConnected) return <div>Connecting...</div>;

  return (
    <div className="chat-app">
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="content">{msg.content}</div>
            <div className="time">{msg.timestamp.toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          type="text"
          placeholder="Type your message..."
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              sendMessage(e.target.value);
              e.target.value = '';
            }
          }}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
```

## 📋 API Reference

### Types

```typescript
interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Draft';
  config: AgentConfig;
  metadata?: AgentMetadata;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  metadata?: MessageMetadata;
}

interface WidgetConfig {
  agentId: string;
  agentManagerCanisterId: string;
  containerId: string;
  theme?: 'light' | 'dark' | 'auto';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' | 'inline';
  customStyles?: WidgetStyles;
}
```

## 🔒 Security

- All communications are encrypted using Internet Computer's built-in security
- Authentication via Internet Identity ensures secure user verification
- API keys are optional and only used for enhanced features
- No sensitive data is stored in local storage by default

## 🌟 Support

- **Documentation**: Full API documentation at [docs.canistchat.com](https://docs.canistchat.com)
- **Examples**: Sample projects at [github.com/canistchat/examples](https://github.com/canistchat/examples)
- **Issues**: Report bugs at [github.com/canistchat/sdk/issues](https://github.com/canistchat/sdk/issues)
- **Discord**: Join our community at [discord.gg/canistchat](https://discord.gg/canistchat)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

---

Built with ❤️ by the CanistChat Team 