
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { LogOut, Home, User, Users, FileText, Receipt, Search, Bell, CheckSquare } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConnectorLayoutProps {
  children: React.ReactNode;
}

const ConnectorLayout: React.FC<ConnectorLayoutProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const formatTimestamp = (timestamp: string | number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const lastLoggedIn = localStorage.getItem("lastLoggedIn");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { icon: Home, label: "Home", path: "/connector-dashboard" },
    { icon: User, label: "My Profile", path: "/connector-profile" },
    { icon: CheckSquare, label: "Quick Eligibility Check", path: "/connector-quick-eligibility" },
    { icon: Users, label: "View Leads", path: "/connector-leads" },
    { icon: FileText, label: "Payout Summary", path: "/connector-payout" },
    { icon: Receipt, label: "Invoice", path: "/connector-invoice" },
  ];

  // Check if current user is aman@connector.com
  const isSpecificUser = user?.email === 'aman@connector.com';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 flex-1">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-purple rounded-full flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Connector</p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              +91 7588072877 <span className="w-2 h-2 bg-green-500 rounded-full inline-block ml-2"></span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">amitthakur@gmail.com</p>
            <span className="inline-block bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs px-2 py-1 rounded">verify</span>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Connector - Mumbai <span className="w-2 h-2 bg-green-500 rounded-full inline-block ml-2"></span>
            </p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    isActive 
                      ? "bg-brand-purple text-white" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Fixed bottom section with theme toggle and logout */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          {/* Only show theme toggle in sidebar if NOT the specific user */}
          {!isSpecificUser && (
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                {theme === "light" ? "🌙" : "☀️"}
              </button>
            </div>
          )}

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar - matching Referral Dashboard */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src="/lovable-uploads/75bc211c-a5f5-400d-8e31-d21743e7c871.png"
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
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                  {theme === "light" ? "🌙" : "☀️"}
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <Bell className="w-5 h-5" />
                </button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-white">{user?.name || "Connector User"}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || "amitthakur@gmail.com"}</p>
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

        {/* Content */}
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ConnectorLayout;
