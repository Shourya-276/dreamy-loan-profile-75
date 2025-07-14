
import React from "react";
import { Menu, Search, Bell, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImage from "../../assets/images/logo.png";

interface HeaderSectionProps {
  onMobileMenuOpen: () => void;
  theme: string;
  onToggleTheme: () => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ 
  onMobileMenuOpen, 
  theme, 
  onToggleTheme 
}) => {
  const { user, logout } = useAuth();

  const formatTimestamp = (timestamp: string | number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const lastLoggedIn = localStorage.getItem("lastLoggedIn");

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden"
              onClick={onMobileMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
            <img 
              src={logoImage}
              alt="Loan for India"
              className="h-12 max-w-fit"
            />
          </div>

          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search information"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-purple text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Bell className="w-5 h-5" />
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-white">{user?.name || "User"}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || "user@example.com"}</p>
                </div>
                <DropdownMenuItem disabled className="text-xs text-gray-500 dark:text-gray-400 px-3 cursor-default">
                  Last logged in: {lastLoggedIn ? formatTimestamp(lastLoggedIn) : "Just now"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 hover:bg-red-100 dark:hover:bg-red-800 dark:text-red-400 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderSection;
