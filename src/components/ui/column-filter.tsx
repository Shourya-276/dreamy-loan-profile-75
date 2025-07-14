
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, X } from "lucide-react";

interface FilterColumn {
  key: string;
  label: string;
  type: "text" | "select";
  options?: string[];
}

interface ColumnFilterProps {
  columns: FilterColumn[];
  onFilterChange: (filters: Record<string, string>) => void;
  className?: string;
}

const ColumnFilter: React.FC<ColumnFilterProps> = ({ columns, onFilterChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleFilterChange = (columnKey: string, value: string) => {
    const newFilters = { ...filters };
    
    // If value is "all" or empty, remove the filter
    if (value === "all" || !value) {
      delete newFilters[columnKey];
    } else {
      newFilters[columnKey] = value;
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`whitespace-nowrap ${className}`}>
          <Filter className="w-4 h-4 mr-2" />
          Filter
          {hasActiveFilters && (
            <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {Object.keys(filters).length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-white border shadow-lg z-50 max-h-[80vh] overflow-y-auto" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filter by columns</h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-auto p-1 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {columns.map((column) => (
              <div key={column.key} className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {column.label}
                </label>
                {column.type === "text" ? (
                  <Input
                    placeholder={`Filter by ${column.label.toLowerCase()}`}
                    value={filters[column.key] || ""}
                    onChange={(e) => handleFilterChange(column.key, e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <Select
                    value={filters[column.key] || "all"}
                    onValueChange={(value) => handleFilterChange(column.key, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${column.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50 max-h-[200px] overflow-y-auto">
                      <SelectItem value="all">All {column.label}</SelectItem>
                      {column.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColumnFilter;
