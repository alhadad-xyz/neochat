import React from "react";
import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "../ThemeToggle";

const DashboardHeader = () => {
  return (
    <header className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/50 px-8 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search agents, chats, analytics..."
              className="pl-12 w-96 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30 focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 rounded-xl"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <div className="relative">
            <Button variant="ghost" size="icon" className="relative hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-xs flex items-center justify-center p-0 border-2 border-white dark:border-gray-800">3</Badge>
            </Button>
          </div>
          <div className="flex items-center space-x-3 pl-4 border-l border-white/30 dark:border-gray-600/30">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">John Doe</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">mja5z-ag...</div>
            </div>
            <Button variant="outline" size="sm" className="bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-700/80 border-white/30 dark:border-gray-600/30 rounded-xl">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
