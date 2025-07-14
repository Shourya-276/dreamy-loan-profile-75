
/**
 * SANCTIONS TAB NAVIGATION COMPONENT
 * 
 * This file contains the navigation component for the Bank Sanctions page.
 * It handles tab switching, search functionality, and filter options for sanctions management.
 * 
 * USAGE:
 * - Imported and used in: LoanAdministratorBankSanctions.tsx
 * - Provides consistent UI for sanctions page navigation
 * - Handles both pending and completed sanctions tabs
 * 
 * FEATURES:
 * - Tab switching between pending and completed sanctions
 * - Search functionality with search term management
 * - Filter options for data refinement
 * - Status badges for uploaded/pending indicators
 * 
 * PROPS:
 * - activeTab: Current active tab state
 * - onTabChange: Callback for tab switching
 * - searchTerm: Current search input value
 * - onSearchChange: Callback for search input changes
 * 
 * DEPENDENCIES:
 * - Uses shadcn/ui components (Button, Input, Badge)
 * - Uses Lucide React icons (Search, Filter)
 * - Styled with Tailwind CSS for consistent appearance
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";

interface SanctionsTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

/**
 * Navigation component for Bank Sanctions page
 * Handles tab switching, search functionality, and filter options
 * Provides consistent UI for sanctions management
 */
const SanctionsTabNavigation: React.FC<SanctionsTabNavigationProps> = ({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange
}) => {
  return (
    <>
      {/* Main Tab Navigation - Pending vs Completed */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => onTabChange("pending")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "pending"
              ? "bg-brand-purple text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => onTabChange("completed")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "completed"
              ? "bg-brand-purple text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Completed
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by Lead Name, Lead ID"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
        </div>
      </div>

      {/* Status Filter Badges - Uploaded/Pending indicators */}
      <div className="flex space-x-4 mb-6">
        <Badge variant="secondary" className="px-3 py-1">
          Uploaded
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          Pending
        </Badge>
      </div>
    </>
  );
};

export default SanctionsTabNavigation;
