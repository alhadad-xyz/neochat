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
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';

// Types
import { Agent, NavigationItem } from './types';

// Services
import { canisterService } from './services/canisterService';

function App() {
  console.log('Environment variables:', {
    REACT_APP_II_URL: process.env.REACT_APP_II_URL,
    REACT_APP_AGENT_MANAGER_CANISTER_ID: process.env.REACT_APP_AGENT_MANAGER_CANISTER_ID,
    REACT_APP_METRICS_COLLECTOR_CANISTER_ID: process.env.REACT_APP_METRICS_COLLECTOR_CANISTER_ID,
    DFX_NETWORK: process.env.DFX_NETWORK,
  });

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
        console.log('Initializing authentication...');
        const client = await AuthClient.create();
        setAuthClient(client);
        
        // Small delay to ensure AuthClient is fully initialized
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const isAuthenticated = await client.isAuthenticated();
        console.log('AuthClient.isAuthenticated() returned:', isAuthenticated);
        
        // Only consider authenticated if we have a real identity (not anonymous)
        if (isAuthenticated) {
          const identity = client.getIdentity();
          // Check if this is a real identity (not anonymous)
          const principal = identity.getPrincipal();
          const principalText = principal.toText();
          const isAnonymous = principalText === '2vxsx-fae'; // Anonymous principal
          
          console.log('Identity principal:', principalText);
          console.log('Is anonymous:', isAnonymous);
          
          if (!isAnonymous) {
            console.log('Setting authenticated state with real identity');
            setIsAuthenticated(true);
          setIdentity(identity);
          // Set up canister service with authenticated identity
          await canisterService.setIdentity(identity);
            // Use a stable session token based on the principal
            const stableToken = 'session_' + principalText.replace(/[^a-zA-Z0-9]/g, '_');
            setSessionToken(stableToken);
          } else {
            console.log('Clearing anonymous authentication');
            // Clear any stored authentication
            await client.logout();
            setIsAuthenticated(false);
            setIdentity(null);
            setSessionToken(null);
            // Clear canister service identity
            await canisterService.setIdentity(null);
          }
        } else {
          console.log('Not authenticated, setting unauthenticated state');
          setIsAuthenticated(false);
          setIdentity(null);
          setSessionToken(null);
          // Clear canister service identity
          await canisterService.setIdentity(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
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
          ? `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`
          : (process.env.REACT_APP_II_URL || "https://identity.ic0.app");
        console.log('Using Internet Identity URL:', iiUrl);
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
        console.error('Login failed:', error);
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <ChatBubbleLeftRightIcon className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                CanistChat Enterprise
              </h1>
              <p className="text-gray-600 text-lg">AI Agent Platform on Internet Computer</p>
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Login with Internet Identity
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Secure authentication powered by Internet Computer
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-50 lg:hidden`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed top-0 left-0 bottom-0 flex flex-col w-5/6 max-w-sm bg-white border-r border-gray-200">
          <SidebarContent navigation={navigation} setActiveView={setActiveView} setSidebarOpen={setSidebarOpen} />
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <SidebarContent navigation={navigation} setActiveView={setActiveView} setSidebarOpen={setSidebarOpen} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 lg:z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Search bar */}
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="relative flex flex-1 items-center">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-4 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search agents, chats, analytics..."
                  className="block h-full w-full border-0 py-0 pl-11 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 bg-gray-50 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* User menu */}
              <div className="flex items-center gap-x-2">
                <span className="text-sm font-medium text-gray-700">
                {identity?.getPrincipal() ? 
                  (typeof identity.getPrincipal().toString === 'function' ? 
                    identity.getPrincipal().toString().slice(0, 8) : 
                    'Unknown'
                  ) + '...' : 
                  'Loading...'
                }
              </span>
              <button
                onClick={handleLogout}
                  className="flex items-center gap-x-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Logout
              </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="animate-fade-in">
              {activeView === 'dashboard' && (
                <Dashboard
                  sessionToken={sessionToken}
                  selectedAgent={selectedAgent}
                  onSelectAgent={setSelectedAgent}
                  onNavigate={setActiveView}
                />
              )}
              
              {activeView === 'agents' && (
            <AgentList
              sessionToken={sessionToken}
              onSelectAgent={setSelectedAgent}
              selectedAgent={selectedAgent}
            />
          )}
          
              {activeView === 'create' && (
            <AgentCreator
              sessionToken={sessionToken}
                  onAgentCreated={() => setActiveView('agents')}
            />
          )}
          
              {activeView === 'chat' && selectedAgent && (
            <ChatInterface
              sessionToken={sessionToken}
              agent={selectedAgent}
            />
          )}
          
              {activeView === 'analytics' && (
                <Analytics
                  sessionToken={sessionToken}
                  selectedAgent={selectedAgent}
                />
              )}
              
              {activeView === 'embed' && selectedAgent && (
            <EmbedGenerator
              agent={selectedAgent}
              canisterId={process.env.REACT_APP_AGENT_MANAGER_CANISTER_ID || 'uxrrr-q7777-77774-qaaaq-cai'}
            />
          )}
          
              {activeView === 'profile' && (
            <UserProfile
              sessionToken={sessionToken}
              identity={identity}
            />
          )}
        </div>
          </div>
        </main>
      </div>
    </div>
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
            CanistChat
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

        {/* Enterprise features indicator */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
            <div className="flex items-center gap-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Enterprise Ready</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Advanced LLM integration with intelligent load balancing
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}

export default App; 