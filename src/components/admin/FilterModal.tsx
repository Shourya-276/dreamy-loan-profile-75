
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ open, onOpenChange }) => {
  const [filters, setFilters] = useState({
    bank: "",
    fromDate: undefined as Date | undefined,
    toDate: undefined as Date | undefined,
    location: "",
    employee: "",
    team: "",
    zone: "",
    sanctions: "",
    disbursement: ""
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    console.log("Applied filters:", filters);
    onOpenChange(false);
  };

  const handleClear = () => {
    setFilters({
      bank: "",
      fromDate: undefined,
      toDate: undefined,
      location: "",
      employee: "",
      team: "",
      zone: "",
      sanctions: "",
      disbursement: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">Filter Options</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Bank */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Bank</Label>
            <Select value={filters.bank} onValueChange={(value) => handleFilterChange("bank", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sbi">SBI</SelectItem>
                <SelectItem value="hdfc">HDFC</SelectItem>
                <SelectItem value="kotak">KOTAK</SelectItem>
                <SelectItem value="icici">ICICI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Date</Label>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Label className="text-xs text-gray-500 mb-1 block">From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-9",
                        !filters.fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.fromDate ? format(filters.fromDate, "dd/MM/yyyy") : "Search Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.fromDate}
                      onSelect={(date) => handleFilterChange("fromDate", date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="text-sm text-gray-500 mt-6">To</div>
              
              <div className="flex-1">
                <Label className="text-xs text-gray-500 mb-1 block">To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-9",
                        !filters.toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.toDate ? format(filters.toDate, "dd/MM/yyyy") : "Search End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.toDate}
                      onSelect={(date) => handleFilterChange("toDate", date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Location</Label>
            <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sion">Sion</SelectItem>
                <SelectItem value="kandivali">Kandivali</SelectItem>
                <SelectItem value="ghatkopar">Ghatkopar</SelectItem>
                <SelectItem value="dadar">Dadar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employee */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Employee</Label>
            <Select value={filters.employee} onValueChange={(value) => handleFilterChange("employee", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a-z">A-Z</SelectItem>
                <SelectItem value="z-a">Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Team</Label>
            <Select value={filters.team} onValueChange={(value) => handleFilterChange("team", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="team-lead">Team Lead</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Zone */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Zone</Label>
            <Select value={filters.zone} onValueChange={(value) => handleFilterChange("zone", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">A</SelectItem>
                <SelectItem value="b">B</SelectItem>
                <SelectItem value="c">C</SelectItem>
                <SelectItem value="d">D</SelectItem>
                <SelectItem value="e">E</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sanctions */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Sanctions</Label>
            <Select value={filters.sanctions} onValueChange={(value) => handleFilterChange("sanctions", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Disbursement */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Disbursement</Label>
            <Select value={filters.disbursement} onValueChange={(value) => handleFilterChange("disbursement", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="flex-1"
          >
            Reset
          </Button>
          <Button 
            onClick={handleApply}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
