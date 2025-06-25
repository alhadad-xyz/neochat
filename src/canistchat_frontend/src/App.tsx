import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';
import {
  PlusIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  CodeBracketIcon,
  HomeIcon,
  ChartBarIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Components
import AgentCreator from './components/AgentCreator';
import AgentList from './components/AgentList';
import ChatInterface from './components/ChatInterface';
import UserProfile from './components/UserProfile';
import EmbedGenerator from './components/EmbedGenerator';
import Analytics from './components/Analytics';

// Pages
import Dashboard from './pages/Dashboard';
import Index from './pages/Index';

// Types
import { Agent, NavigationItem } from './types';

// Services
import { canisterService } from './services/canisterService';
import DashboardSidebar from './components/dashboard/DashboardSidebar';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3); // Mock notification count

  // Initialize auth client
  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);
        
        // Small delay to ensure AuthClient is fully initialized
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const isAuthenticated = await client.isAuthenticated();
        
        // Only consider authenticated if we have a real identity (not anonymous)
        if (isAuthenticated) {
          const identity = client.getIdentity();
          // Check if this is a real identity (not anonymous)
          const principal = identity.getPrincipal();
          const principalText = principal.toText();
          const isAnonymous = principalText === '2vxsx-fae'; // Anonymous principal
          
          
          if (!isAnonymous) {
            setIsAuthenticated(true);
          setIdentity(identity);
          // Set up canister service with authenticated identity
          await canisterService.setIdentity(identity);
            // Use a stable session token based on the principal
            const stableToken = 'session_' + principalText.replace(/[^a-zA-Z0-9]/g, '_');
            setSessionToken(stableToken);
          } else {
            // Clear any stored authentication
            await client.logout();
            setIsAuthenticated(false);
            setIdentity(null);
            setSessionToken(null);
            // Clear canister service identity
            await canisterService.setIdentity(null);
          }
        } else {
          setIsAuthenticated(false);
          setIdentity(null);
          setSessionToken(null);
          // Clear canister service identity
          await canisterService.setIdentity(null);
        }
      } catch (error) {
        // Don't allow anonymous access - require real authentication
        setIsAuthenticated(false);
        setIdentity(null);
        setSessionToken(null);
        // Clear canister service identity
        await canisterService.setIdentity(null);
      }
    };
    
    initAuth();
  }, []);

  const handleLogin = async () => {
    if (authClient) {
      try {
        const iiUrl = process.env.DFX_NETWORK === 'local' 
          ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`
          : "https://identity.ic0.app";
      await authClient.login({
          identityProvider: iiUrl,
        onSuccess: async () => {
          setIsAuthenticated(true);
          const identity = authClient.getIdentity();
          setIdentity(identity);
          // Set up canister service with authenticated identity
          await canisterService.setIdentity(identity);
            // Use a stable session token based on the principal
            const principal = identity.getPrincipal();
            const principalText = principal.toText();
            const stableToken = 'session_' + principalText.replace(/[^a-zA-Z0-9]/g, '_');
            setSessionToken(stableToken);
        },
      });
      } catch (error) {
        // Don't allow anonymous access - require real authentication
        setIsAuthenticated(false);
      }
    }
  };

  const handleLogout = async () => {
    if (authClient) {
      await authClient.logout();
      setIsAuthenticated(false);
      setIdentity(null);
      setSessionToken(null);
      setSelectedAgent(null);
      setActiveView('dashboard');
      // Clear canister service identity
      await canisterService.setIdentity(null);
    }
  };

  const navigation: NavigationItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon, current: activeView === 'dashboard' },
    { id: 'agents', name: 'My Agents', icon: Cog6ToothIcon, current: activeView === 'agents', count: 0 },
    { id: 'create', name: 'Create Agent', icon: PlusIcon, current: activeView === 'create' },
    { id: 'chat', name: 'Chat', icon: ChatBubbleLeftRightIcon, current: activeView === 'chat', disabled: !selectedAgent },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon, current: activeView === 'analytics' },
    { id: 'embed', name: 'Embed Widget', icon: CodeBracketIcon, current: activeView === 'embed', disabled: !selectedAgent },
    { id: 'profile', name: 'Profile', icon: UserIcon, current: activeView === 'profile' },
  ];

  if (!isAuthenticated) {
    return <Index handleLogin={handleLogin} />;
  }

  return (
    <Dashboard 
      sessionToken={sessionToken}
      selectedAgent={selectedAgent}
      onSelectAgent={setSelectedAgent}
      onNavigate={setActiveView}
      identity={identity}
      onLogout={handleLogout}
      activeView={activeView}
    />
  );
}

// Sidebar component
function SidebarContent({ 
  navigation, 
  setActiveView, 
  setSidebarOpen 
}: {
  navigation: NavigationItem[];
  setActiveView: (view: string) => void;
  setSidebarOpen: (open: boolean) => void;
}) {
  return (
    <>
      {/* Logo and close button */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
        <div className="flex items-center gap-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            NeoChat
          </h1>
        </div>
        <button
          type="button"
          className="lg:hidden -m-2.5 p-2.5 text-gray-700"
          onClick={() => setSidebarOpen(false)}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 py-6">
        <ul className="flex flex-1 flex-col gap-y-1">
          {navigation.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  if (!item.disabled) {
                    setActiveView(item.id);
                    setSidebarOpen(false);
                  }
                }}
                disabled={item.disabled}
                className={`group flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  item.current
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-r-2 border-blue-600'
                    : item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <item.icon
                  className={`h-5 w-5 shrink-0 ${
                    item.current ? 'text-blue-600' : item.disabled ? 'text-gray-400' : 'text-gray-500 group-hover:text-blue-600'
                  }`}
                />
                {item.name}
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-auto w-5 h-5 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

export default App; 