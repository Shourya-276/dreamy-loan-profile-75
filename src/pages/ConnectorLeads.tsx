
import React, { useState, useMemo } from "react";
import ConnectorLayout from "../components/ConnectorLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download } from "lucide-react";
import StatusTrackingModal from "../components/shared/StatusTrackingModal";
import { exportToExcel } from "../utils/exportToExcel";
import ColumnFilter from "../components/ui/column-filter";

const ConnectorLeads = () => {
  const [activeTab, setActiveTab] = useState("Sanctioned");
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    mobile: "",
    executiveName: "",
  });

  const leads = [
    { id: "#1", date: "31|05|25", name: "Priya Mehta", type: "HL", bank: "Sbi", status: "Status 2/6" },
    { id: "#2", date: "1|05|25", name: "Rajesh Sharma", type: "HL", bank: "Hdfc", status: "Status 1/6" },
    { id: "#3", date: "2|05|25", name: "Anil Gupta", type: "HL", bank: "kotak", status: "Status 3/6" },
    { id: "#4", date: "4|05|25", name: "Rajesh Sharma", type: "HL", bank: "ICIC", status: "Status 1/6" },
    { id: "#5", date: "6|05|25", name: "Priya Mehta", type: "HL", bank: "Sbi", status: "Status 1/6" },
    { id: "#6", date: "9|05|25", name: "Priya Mehta", type: "HL", bank: "Hdfc", status: "Status 1/6" },
    { id: "#7", date: "10|05|25", name: "Neha Verma", type: "HL", bank: "kotak", status: "Status 2/6" },
    { id: "#8", date: "18|05|25", name: "Priya Mehta", type: "HL", bank: "ICIC", status: "Status 1/6" },
    { id: "#9", date: "21|05|25", name: "Anil Gupta", type: "HL", bank: "ICIC", status: "Status 0/6" },
  ];

  // Define filter columns for connector leads
  const filterColumns = [
    { key: "id", label: "Lead Number", type: "text" as const },
    { key: "date", label: "Date", type: "text" as const },
    { key: "name", label: "Name", type: "text" as const },
    { key: "type", label: "Loan Type", type: "select" as const, options: ["HL"] },
    { key: "bank", label: "Bank Name", type: "select" as const, options: ["Sbi", "Hdfc", "kotak", "ICIC"] },
    { key: "status", label: "Status", type: "select" as const, options: ["Status 0/6", "Status 1/6", "Status 2/6", "Status 3/6"] }
  ];

  // Filter the data based on search term and column filters
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search term filter
      const matchesSearch = searchTerm === "" ||
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Column filters
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const leadValue = lead[key as keyof typeof lead]?.toString().toLowerCase() || "";
        return leadValue.includes(value.toLowerCase());
      });

      return matchesSearch && matchesFilters;
    });
  }, [searchTerm, filters]);

  const handleAddLead = () => {
    console.log("Adding new lead:", newLead);
    setNewLead({ name: "", email: "", mobile: "", executiveName: "" });
    setIsAddLeadOpen(false);
  };

  const handleStatusClick = (leadName: string) => {
    setSelectedLead(leadName);
    setShowStatusModal(true);
  };

  const handleDownloadLeads = () => {
    const exportData = filteredLeads.map(lead => ({
      'Lead Number': lead.id,
      'Date': lead.date,
      'Name': lead.name,
      'Loan Type': lead.type,
      'Bank Name': lead.bank,
      'Status': lead.status,
      'Phone': '9876543210', // Sample data
      'Email': `${lead.name.toLowerCase().replace(' ', '.')}@example.com`
    }));

    exportToExcel(exportData, 'Connector_Leads_Export', 'View Leads');
  };

  const getStatusColor = (status: string) => {
    if (status.includes("Status 0/6")) {
      return "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400";
    } else if (status.includes("Status 1/6")) {
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400";
    } else if (status.includes("Status 2/6") || status.includes("Status 3/6")) {
      return "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400";
    } else {
      return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <ConnectorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-center">
          <Button
            onClick={() => setIsAddLeadOpen(true)}
            className="bg-brand-purple hover:bg-brand-purple/90 text-white px-6 py-2 rounded"
          >
            Add Lead
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Lead Name, Lead ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-brand-purple bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <svg className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <ColumnFilter
              columns={filterColumns}
              onFilterChange={setFilters}
            />
            <Button
              onClick={handleDownloadLeads}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download in Excel
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-fit">
          {["Sanctioned", "Disbursed", "Pending"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Leads Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Lead Number</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Loan type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Bank Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{lead.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{lead.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{lead.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{lead.type}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{lead.bank}</td>
                  <td className="py-3 px-4">
                    <span 
                      className={`text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 ${getStatusColor(lead.status)}`}
                      onClick={() => handleStatusClick(lead.name)}
                    >
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Lead Modal */}
        <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
          <DialogContent className="max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Create Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name</label>
                <Input
                  placeholder="Enter Customer Name..."
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                <Input
                  placeholder="Enter Lead Number"
                  value={newLead.mobile}
                  onChange={(e) => setNewLead({ ...newLead, mobile: e.target.value })}
                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Email</label>
                <Input
                  placeholder="Enter Customer Email"
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Executive Name (Optional)</label>
                <Input
                  placeholder="Enter Executive Name"
                  value={newLead.executiveName}
                  onChange={(e) => setNewLead({ ...newLead, executiveName: e.target.value })}
                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddLeadOpen(false)}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleAddLead}
                  className="flex-1 bg-brand-purple hover:bg-brand-purple/90"
                >
                  Create Lead
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Status Tracking Modal */}
        <StatusTrackingModal 
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          leadName={selectedLead}
        />
      </div>
    </ConnectorLayout>
  );
};

export default ConnectorLeads;
