import React from 'react';
import { Search, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from '../sections/ThemeToggle';

interface DashboardHeaderProps {
  identity?: any;
  sessionToken?: string | null;
  onLogout?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  notifications?: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  identity,
  sessionToken,
  onLogout,
  searchQuery = '',
  onSearchChange,
  notifications = 0
}) => {
  // Get principal text for display
  const principalText = identity?.getPrincipal()?.toText();
  const displayPrincipal = principalText ? 
    principalText.length > 12 ? 
      `${principalText.slice(0, 6)}...${principalText.slice(-3)}` : 
      principalText 
    : 'Anonymous';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/50 px-8 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search agents, chats, analytics..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-12 w-96 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30 focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-xl"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* User Profile Section */}
          <div className="flex items-center space-x-3 pl-4 border-l border-white/30 dark:border-gray-600/30">
            {/* User Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            
            {/* User Info */}
            <div className="hidden md:block">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {displayPrincipal}
              </div>
            </div>
            
            {/* Logout Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-700/80 border-white/30 dark:border-gray-600/30 rounded-xl flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
