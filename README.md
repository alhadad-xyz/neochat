# NeoChat - AI Agent Platform

<div align="center">

![NeoChat Logo](./src/canistchat_frontend/public/logo2.svg)

**Decentralized AI Agent Platform powered by Internet Computer**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built on IC](https://img.shields.io/badge/Built%20on-Internet%20Computer-29ABE2)](https://internetcomputer.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Motoko](https://img.shields.io/badge/Motoko-0066CC?logo=internet-computer&logoColor=white)](https://internetcomputer.org/docs/current/motoko/intro/)

[Live Demo](https://giyqx-pqaaa-aaaab-aagza-cai.icp0.io/) • [Documentation](./docs/) • [SDK](./sdk/) • [API Reference](./docs/Technical-Testing-Guide.md)

</div>

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/neochat/neochat)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![DFX](https://img.shields.io/badge/dfx-latest-orange.svg)](https://internetcomputer.org/docs/current/developer-docs/setup/install/)

> **NeoChat** is a comprehensive AI agent platform built on the Internet Computer, enabling users to create, configure, and deploy intelligent conversational agents with advanced features like context management, knowledge bases, and real-time analytics.

## 🚀 Features

### Core Platform
- **🤖 AI Agent Management**: Create, configure, and manage intelligent conversational agents
- **💬 Real-time Chat**: Seamless chat interface with context-aware conversations
- **🧠 Knowledge Base**: Upload and manage documents, URLs, and custom knowledge sources
- **📊 Analytics Dashboard**: Comprehensive usage analytics and performance metrics
- **🔧 Advanced Configuration**: Fine-tune agent personality, behavior, and appearance

### Technical Features
- **🌐 Internet Computer Native**: Built entirely on the Internet Computer blockchain
- **🔐 Secure Authentication**: Internet Identity integration for secure user management
- **⚡ High Performance**: Optimized for speed with caching and circuit breaker patterns
- **📱 Responsive Design**: Mobile-first design with cross-platform compatibility
- **🔌 Embeddable Widgets**: Easy integration with any website or application

### Agent Capabilities
- **🎭 Personality Customization**: Define tone, style, and communication patterns
- **🧪 Behavior Tuning**: Configure creativity, temperature, and response patterns
- **🎨 Visual Customization**: Customize colors, themes, and appearance
- **📚 Knowledge Integration**: Connect multiple knowledge sources
- **🔄 Context Management**: Maintain conversation history and context
- **🌍 Multi-language Support**: Support for multiple languages and locales

## 🏗️ Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React)       │◄──►│   (Motoko)      │◄──►│   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Interface│    │   Agent Manager │    │   LLM Providers │
│   Dashboard     │    │   LLM Processor │    │   OpenAI        │
│   Chat Interface│    │   Metrics       │    │   Anthropic     │
│   Embed Widget  │    │   Auth Proxy    │    │   Custom APIs   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Canister Architecture
- **`neochat_frontend`**: React-based user interface
- **`agent_manager`**: Agent lifecycle and configuration management
- **`llm_processor`**: LLM integration and message processing
- **`metrics_collector`**: Usage tracking and analytics
- **`auth_proxy`**: Authentication and session management
- **`data_storage`**: Conversation and data persistence

## 📦 Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (latest version)
- [Internet Identity](https://identity.ic0.app/) account

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/neochat/neochat.git
   cd neochat
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd src/neochat_frontend && npm install
   ```

3. **Start local development**
   ```bash
   dfx start --background
   dfx deploy
   ```

4. **Open the application**
   ```bash
   dfx canister id neochat_frontend
   # Open the returned URL in your browser
   ```

## 🚀 Production Deployment

### Automated Deployment

Use our production deployment script for easy deployment:

```bash
# Deploy to production
./deploy.sh production

# Deploy to staging
./deploy.sh staging

# Deploy locally
./deploy.sh local
```

### Manual Deployment

1. **Build the application**
   ```bash
   dfx build
   ```

2. **Deploy to mainnet**
   ```bash
   dfx deploy --network ic
   ```

3. **Verify deployment**
   ```bash
   dfx canister call agent_manager getSystemStats --network ic
   ```

### Environment Configuration

Create a `.env` file in the project root:

```env
# Network configuration
DFX_NETWORK=ic

# Canister IDs (auto-generated)
AGENT_MANAGER_CANISTER_ID=your_agent_manager_id
LLM_PROCESSOR_CANISTER_ID=your_llm_processor_id
METRICS_COLLECTOR_CANISTER_ID=your_metrics_collector_id

# External API keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## 🔧 Configuration

### Agent Configuration

Agents can be configured with the following parameters:

```typescript
interface AgentConfig {
  personality: {
    tone: string;                    // friendly, formal, professional
    style: string;                   // customer_support, sales, technical
    traits: string[];                // helpful, analytical, empathetic
    communicationStyle: 'Conversational' | 'Professional' | 'Technical';
    responsePattern: 'Detailed' | 'Concise' | 'Structured';
  };
  behavior: {
    temperature: number;              // 0.0 to 2.0
    creativity: number;               // 0.0 to 1.0
    maxTokens: number;                // Maximum response length
    contextWindow: number;            // Conversation history length
  };
  appearance: {
    primaryColor: string;             // CSS color value
    theme: 'Light' | 'Dark' | 'Auto';
    avatar?: string;                  // URL or base64 image
  };
  knowledgeBase: KnowledgeSource[];   // Documents, URLs, custom content
}
```

### Embed Widget Configuration

```javascript
const widgetConfig = {
  agentId: 'your_agent_id',
  theme: 'light',
  position: 'bottom-right',
  primaryColor: '#3B82F6',
  welcomeMessage: 'Hello! How can I help you today?',
  placeholder: 'Type your message...',
  width: '400px',
  height: '600px'
};
```

## 📚 API Documentation

### Agent Management

```typescript
// Create a new agent
const agentId = await canisterService.createAgent({
  name: 'Customer Support Bot',
  description: 'AI assistant for customer support',
  category: 'Support',
  config: agentConfig,
  isPublic: true
});

// Get user agents
const agents = await canisterService.getUserAgents();

// Update agent
await canisterService.updateAgent(agentId, updates);

// Delete agent
await canisterService.deleteAgent(agentId);
```

### Chat Processing

```typescript
// Send a message to an agent
const response = await canisterService.processChat(
  agentId,
  message,
  sessionToken
);

// Get conversation history
const history = await canisterService.getConversationHistory(conversationId);
```

### Analytics

```typescript
// Get comprehensive analytics
const analytics = await canisterService.getComprehensiveAnalytics();

// Get user balance
const balance = await canisterService.getUserBalance();

// Get usage history
const usage = await canisterService.getUsageHistory(100);
```

## 🔌 SDK Integration

### JavaScript/TypeScript SDK

```typescript
import { NeoChatSDK } from '@neochat/sdk';

const sdk = new NeoChatSDK({
  canisterId: 'your_canister_id',
  network: 'ic'
});

// Initialize the SDK
await sdk.initialize();

// Authenticate user
const identity = await sdk.authenticate();

// Get agents
const agents = await sdk.getAgents();

// Start a chat
const response = await sdk.chat('agent-id', 'Hello!');
```

### React Integration

```tsx
import { NeoChatProvider, useNeoChat } from '@neochat/react';

function App() {
  return (
    <NeoChatProvider canisterId="your_canister_id">
      <ChatInterface />
    </NeoChatProvider>
  );
}

function ChatInterface() {
  const { agents, sendMessage, isLoading } = useNeoChat();
  
  return (
    <div>
      {agents.map(agent => (
        <button key={agent.id} onClick={() => sendMessage(agent.id, 'Hello')}>
          Chat with {agent.name}
        </button>
      ))}
    </div>
  );
}
```

## 🧪 Testing

### Unit Tests

```bash
# Run frontend tests
cd src/neochat_frontend
npm test

# Run backend tests
dfx test
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

### Performance Tests

```bash
# Run performance benchmarks
npm run test:performance

# Run load tests
npm run test:load
```

## 📊 Monitoring

### Health Checks

```bash
# Check canister health
dfx canister call agent_manager heartbeat --network ic
dfx canister call llm_processor healthCheck --network ic
dfx canister call metrics_collector healthCheck --network ic
```

### Metrics Dashboard

Access the metrics dashboard at:
```
https://your-frontend-canister-id.ic0.app/analytics
```

### Logs

```bash
# View canister logs
dfx canister call agent_manager getLogs --network ic
```

## 🔒 Security

### Authentication
- Internet Identity integration for secure user authentication
- Session-based authentication with automatic token refresh
- Role-based access control for agent management

### Data Protection
- End-to-end encryption for sensitive data
- Secure storage of API keys and configuration
- GDPR-compliant data handling

### Network Security
- HTTPS enforcement for all communications
- CORS configuration for secure cross-origin requests
- Rate limiting to prevent abuse

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commits for version control

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Reference](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

### Community
- [Discord](https://discord.gg/neochat)
- [GitHub Issues](https://github.com/neochat/neochat/issues)
- [GitHub Discussions](https://github.com/neochat/neochat/discussions)

### Enterprise Support
For enterprise customers, contact us at:
- Email: enterprise@neochat.com
- Phone: +1 (555) 123-4567

## 🗺️ Roadmap

### Version 2.1.0 (Q2 2024)
- [ ] Multi-language agent support
- [ ] Advanced analytics dashboard
- [ ] Custom LLM provider integration
- [ ] Webhook system for external integrations

### Version 2.2.0 (Q3 2024)
- [ ] Voice chat capabilities
- [ ] Advanced knowledge base management
- [ ] Agent marketplace
- [ ] White-label solutions

### Version 3.0.0 (Q4 2024)
- [ ] Multi-agent conversations
- [ ] Advanced AI capabilities
- [ ] Enterprise features
- [ ] Mobile applications

---

**Made with ❤️ by the NeoChat Team**

[Website](https://neochat.com) | [Documentation](https://docs.neochat.com) | [Blog](https://blog.neochat.com) 
