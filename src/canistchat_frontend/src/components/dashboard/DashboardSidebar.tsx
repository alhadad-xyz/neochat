import React from 'react';
import { Bot, BarChart3, Users, Plus, MessageSquare, Code, User, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';

interface DashboardSidebarProps {
  onNavigate: (view: string) => void;
  activeView?: string;
  selectedAgent?: any;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  onNavigate, 
  activeView = 'dashboard',
  selectedAgent 
}) => {
  const menuItems = [
    { 
      id: 'dashboard', 
      icon: BarChart3, 
      label: 'Dashboard', 
      path: '/dashboard',
      disabled: false 
    },
    { 
      id: 'agents', 
      icon: Users, 
      label: 'My Agents', 
      path: '/my-agents',
      disabled: false 
    },
    { 
      id: 'create', 
      icon: Plus, 
      label: 'Create Agent', 
      path: '/create-agent',
      disabled: false 
    },
    { 
      id: 'chat', 
      icon: MessageSquare, 
      label: 'Chat', 
      path: '/chat',
      disabled: !selectedAgent 
    },
    { 
      id: 'analytics', 
      icon: BarChart3, 
      label: 'Analytics', 
      path: '/analytics',
      disabled: false 
    },
    { 
      id: 'billing', 
      icon: CreditCard, 
      label: 'Billing & Payments', 
      path: '/billing',
      disabled: false 
    },
    { 
      id: 'embed', 
      icon: Code, 
      label: 'Embed Widget', 
      path: '/embed',
      disabled: !selectedAgent 
    },
    { 
      id: 'profile', 
      icon: User, 
      label: 'Profile', 
      path: '/profile',
      disabled: false 
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen fixed left-0 top-0 z-40">
      <div className="p-6 h-full overflow-y-auto">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NeoChat
          </span>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                disabled={item.disabled}
                className={`w-full justify-start transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : item.disabled
                    ? "text-gray-400 cursor-not-allowed opacity-50"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-gray-700"
                }`}
                onClick={() => {
                  if (!item.disabled) {
                    onNavigate(item.id);
                  }
                }}
              >
                <item.icon className={`w-4 h-4 mr-3 ${
                  isActive 
                    ? "text-white" 
                    : item.disabled 
                    ? "text-gray-400" 
                    : "text-gray-500 group-hover:text-blue-600"
                }`} />
                {item.label}
                {item.disabled && item.id === 'chat' && (
                  <span className="ml-auto text-xs text-gray-400">
                    Select Agent
                  </span>
                )}
                {item.disabled && item.id === 'embed' && (
                  <span className="ml-auto text-xs text-gray-400">
                    Select Agent
                  </span>
                )}
              </Button>
            );
          })}
        </nav>

        {selectedAgent && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Active Agent
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300 truncate">
              {selectedAgent.name}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {selectedAgent.status === 'Active' ? '🟢 Active' : '🔴 Inactive'}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default DashboardSidebar;
