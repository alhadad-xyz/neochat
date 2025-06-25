import React, { useState, useEffect } from 'react';
import { Bot, BarChart3, Users, Plus, MessageSquare, Code, User, CreditCard, X, Menu } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const menuButton = document.getElementById('mobile-menu-button');
      
      if (isMobileMenuOpen && sidebar && menuButton && 
          !sidebar.contains(event.target as Node) && 
          !menuButton.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

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
      disabled: false 
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
      id: 'profile', 
      icon: User, 
      label: 'Profile', 
      path: '/profile',
      disabled: false 
    },
  ];

  const handleNavigation = (itemId: string) => {
    onNavigate(itemId);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Mobile hamburger button (only show on mobile)
  const MobileMenuButton = () => (
    <button
      id="mobile-menu-button"
      className="md:hidden fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      aria-label="Toggle mobile menu"
    >
      {isMobileMenuOpen ? (
        <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
      ) : (
        <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
      )}
    </button>
  );

  // Sidebar content component
  const SidebarContent = () => (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      <div className="flex items-center space-x-2 mb-6 md:mb-8">
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
                  handleNavigation(item.id);
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
              <span className="text-sm md:text-base">{item.label}</span>
              {item.disabled && item.id === 'chat' && (
                <span className="ml-auto text-xs text-gray-400 hidden sm:inline">
                  Select Agent
                </span>
              )}
              {item.disabled && item.id === 'embed' && (
                <span className="ml-auto text-xs text-gray-400 hidden sm:inline">
                  Select Agent
                </span>
              )}
            </Button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <MobileMenuButton />

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" />
      )}

      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen fixed left-0 top-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Slide in from left */}
      <aside 
        id="mobile-sidebar"
        className={`md:hidden fixed left-0 top-0 z-50 w-80 max-w-[80vw] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default DashboardSidebar;
