import React, { useState, useMemo } from "react";
import BuilderLayout from "../components/BuilderLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download } from "lucide-react";
import BuilderStatusTrackingModal from "../components/builder/BuilderStatusTrackingModal";
import ColumnFilter from "../components/ui/column-filter";

const BuilderLeads = () => {
  const [activeTab, setActiveTab] = useState("sanctioned");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const leadsData = [
    {
      leadNumber: "#1",
      date: "31 | 05 | 25",
      name: "Priya Mehta",
      loanType: "HL",
      bankName: "SBI",
      status: "in process"
    },
    {
      leadNumber: "#2",
      date: "1 | 05 | 25",
      name: "Rajesh Sharma",
      loanType: "HL",
      bankName: "HDFC",
      status: "Pending"
    },
    {
      leadNumber: "#3",
      date: "2 | 05 | 25",
      name: "Anil Gupta",
      loanType: "HL",
      bankName: "Kotak",
      status: "in process"
    },
    {
      leadNumber: "#4",
      date: "4 | 05 | 25",
      name: "Rajesh Sharma",
      loanType: "HL",
      bankName: "ICIC",
      status: "Pending"
    },
    {
      leadNumber: "#5",
      date: "6 | 05 | 25",
      name: "Priya Mehta",
      loanType: "HL",
      bankName: "SBI",
      status: "Pending"
    },
    {
      leadNumber: "#6",
      date: "9 | 05 | 25",
      name: "Priya Mehta",
      loanType: "HL",
      bankName: "HDFC",
      status: "Pending"
    },
    {
      leadNumber: "#7",
      date: "10 | 05 | 25",
      name: "Neha Verma",
      loanType: "HL",
      bankName: "Kotak",
      status: "in process"
    },
    {
      leadNumber: "#8",
      date: "18 | 05 | 25",
      name: "Priya Mehta",
      loanType: "HL",
      bankName: "ICIC",
      status: "Pending"
    },
    {
      leadNumber: "#9",
      date: "21 | 05 | 25",
      name: "Anil Gupta",
      loanType: "HL",
      bankName: "ICIC",
      status: "Rejected"
    }
  ];

  // Define filter columns for builder leads
  const filterColumns = [
    { key: "leadNumber", label: "Lead Number", type: "text" as const },
    { key: "date", label: "Date", type: "text" as const },
    { key: "name", label: "Name", type: "text" as const },
    { key: "loanType", label: "Loan Type", type: "select" as const, options: ["HL"] },
    { key: "bankName", label: "Bank Name", type: "select" as const, options: ["SBI", "HDFC", "Kotak", "ICIC"] },
    { key: "status", label: "Status", type: "select" as const, options: ["in process", "Pending", "Rejected"] }
  ];

  // Filter the data based on search term and column filters
  const filteredLeadsData = useMemo(() => {
    return leadsData.filter(lead => {
      // Search term filter
      const matchesSearch = searchTerm === "" || 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.leadNumber.toLowerCase().includes(searchTerm.toLowerCase());

      // Column filters
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const leadValue = lead[key as keyof typeof lead]?.toString().toLowerCase() || "";
        return leadValue.includes(value.toLowerCase());
      });

      return matchesSearch && matchesFilters;
    });
  }, [searchTerm, filters]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in process":
        return "text-green-600";
      case "pending":
        return "text-gray-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleStatusClick = (leadName: string) => {
    setSelectedLead(leadName);
    setIsStatusModalOpen(true);
  };

  const handleDownloadExcel = async () => {
    try {
      // Dynamic imports to handle module loading
      const XLSXModule = await import('xlsx');
      const { saveAs } = await import('file-saver');
      
      // Access the default export
      const XLSX = XLSXModule.default || XLSXModule;

      // Prepare data for Excel export
      const excelData = filteredLeadsData.map(lead => ({
        'Lead Number': lead.leadNumber,
        'Date': lead.date,
        'Name': lead.name,
        'Loan Type': lead.loanType,
        'Bank Name': lead.bankName,
        'Status': lead.status
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 12 }, // Lead Number
        { wch: 12 }, // Date
        { wch: 20 }, // Name
        { wch: 12 }, // Loan Type
        { wch: 15 }, // Bank Name
        { wch: 15 }  // Status
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Builder Leads');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

      // Generate filename with current date
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const fileName = `Builder_Leads_${dateStr}.xlsx`;

      // Save file
      saveAs(data, fileName);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      alert('Error downloading Excel file. Please try again.');
    }
  };

  return (
    <BuilderLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Status</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Search and Filter - Made scrollable */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6 overflow-x-auto pb-2">
              <div className="relative flex-shrink-0 w-full lg:w-auto lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by Lead Name, Lead ID"
                  className="pl-10 min-w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <ColumnFilter
                  columns={filterColumns}
                  onFilterChange={setFilters}
                />
                <Button 
                  onClick={handleDownloadExcel}
                  className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download in Excel
                </Button>
              </div>
            </div>

            {/* Leads Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-sm font-medium text-gray-500 whitespace-nowrap">Lead Number</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500 whitespace-nowrap">Date</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500 whitespace-nowrap">Name</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500 whitespace-nowrap">Loan type</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500 whitespace-nowrap">Bank Name</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeadsData.map((lead, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 text-sm text-gray-900 dark:text-white">{lead.leadNumber}</td>
                      <td className="py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{lead.date}</td>
                      <td className="py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{lead.name}</td>
                      <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{lead.loanType}</td>
                      <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{lead.bankName}</td>
                      <td 
                        className={`py-3 text-sm cursor-pointer hover:underline whitespace-nowrap ${getStatusColor(lead.status)}`}
                        onClick={() => handleStatusClick(lead.name)}
                      >
                        {lead.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Status Tracking Modal */}
        <BuilderStatusTrackingModal 
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          leadName={selectedLead}
        />
      </div>
    </BuilderLayout>
  );
};

export default BuilderLeads;
