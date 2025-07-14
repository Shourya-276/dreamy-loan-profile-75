
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import DocumentUploadModal from "../components/sanctions/DocumentUploadModal";
import StatusTrackingModal from "../components/disbursement/StatusTrackingModal";
import ColumnFilter from "../components/ui/column-filter";

const BankSanctions = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const pendingData = [
    { leadId: "#8232", leadName: "Rajesh Sharma", bankName: "HDFC Bank", pendingDocs: "KYC, Salary Slip", action: "Upload" },
    { leadId: "#1232", leadName: "Priya Mehta", bankName: "SBI", pendingDocs: "PAN Card, Income Proof", action: "Upload" },
    { leadId: "#4232", leadName: "Anil Gupta", bankName: "HDFC Bank", pendingDocs: "Salary Slip, Income Proof", action: "Upload" },
    { leadId: "#1232", leadName: "Priya Mehta", bankName: "SBI", pendingDocs: "PAN Card, Income Proof", action: "Upload" },
    { leadId: "#8232", leadName: "Rajesh Sharma", bankName: "HDFC Bank", pendingDocs: "KYC, Salary Slip", action: "Upload" },
    { leadId: "#4232", leadName: "Anil Gupta", bankName: "HDFC Bank", pendingDocs: "Salary Slip, Income Proof", action: "Upload" }
  ];

  const completedData = [
    { leadId: "#8232", leadName: "Rajesh Sharma", bankName: "HDFC Bank", status: "Approved", action: "Initiate Disbursement" },
    { leadId: "#8232", leadName: "Rajesh Sharma", bankName: "HDFC Bank", status: "Approved", action: "Initiate Disbursement" },
    { leadId: "#8232", leadName: "Rajesh Sharma", bankName: "HDFC Bank", status: "Approved", action: "Initiate Disbursement" }
  ];

  // Define filter columns for pending sanctions
  const pendingFilterColumns = [
    { key: "leadId", label: "Lead ID", type: "text" as const },
    { key: "leadName", label: "Lead Name", type: "text" as const },
    { key: "bankName", label: "Bank Name", type: "select" as const, options: ["HDFC Bank", "SBI"] },
    { key: "pendingDocs", label: "Pending Docs", type: "text" as const }
  ];

  // Define filter columns for completed sanctions
  const completedFilterColumns = [
    { key: "leadId", label: "Lead ID", type: "text" as const },
    { key: "leadName", label: "Lead Name", type: "text" as const },
    { key: "bankName", label: "Bank Name", type: "select" as const, options: ["HDFC Bank", "SBI"] },
    { key: "status", label: "Status", type: "select" as const, options: ["Approved"] }
  ];

  // Filter the data based on search term and column filters
  const filteredPendingData = useMemo(() => {
    return pendingData.filter(item => {
      // Search term filter
      const matchesSearch = searchTerm === "" || 
        item.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.leadId.toLowerCase().includes(searchTerm.toLowerCase());

      // Column filters
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = item[key as keyof typeof item]?.toString().toLowerCase() || "";
        return itemValue.includes(value.toLowerCase());
      });

      return matchesSearch && matchesFilters;
    });
  }, [searchTerm, filters]);

  const filteredCompletedData = useMemo(() => {
    return completedData.filter(item => {
      // Search term filter
      const matchesSearch = searchTerm === "" || 
        item.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.leadId.toLowerCase().includes(searchTerm.toLowerCase());

      // Column filters
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = item[key as keyof typeof item]?.toString().toLowerCase() || "";
        return itemValue.includes(value.toLowerCase());
      });

      return matchesSearch && matchesFilters;
    });
  }, [searchTerm, filters]);

  const handleUploadClick = (lead: any) => {
    setSelectedLead(lead);
    setUploadModalOpen(true);
  };

  const handleStatusClick = (lead: any) => {
    setSelectedLead(lead);
    setStatusModalOpen(true);
  };

  const handleInitiateDisbursement = () => {
    navigate("/sales-manager-initiate-disbursement");
  };

  const handleDownloadSanctionLetter = (leadId: string) => {
    console.log(`Downloading sanction letter for lead: ${leadId}`);
    // TODO: Implement actual download functionality
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Bank Sanctions</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => setActiveTab("pending")}
              variant={activeTab === "pending" ? "default" : "outline"}
            >
              Pending
            </Button>
            <Button
              onClick={() => setActiveTab("completed")}
              variant={activeTab === "completed" ? "default" : "outline"}
            >
              Completed
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by Lead Name, Lead ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <ColumnFilter
              columns={activeTab === "pending" ? pendingFilterColumns : completedFilterColumns}
              onFilterChange={setFilters}
            />
          </div>

          {/* Sub Tabs for Pending - Removed for aman@salesmanager.com */}
          {/* Commented out the sub tabs */}
          {/* {activeTab === "pending" && (
            <div className="flex gap-4 mb-6">
              <Button variant="outline" size="sm">Uploaded</Button>
              <Button variant="outline" size="sm">Pending</Button>
            </div>
          )} */}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Bank Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    {activeTab === "pending" ? "Pending Docs" : "Status"}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    {activeTab === "pending" ? "Upload Action" : "Action"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {activeTab === "pending" ? 
                  filteredPendingData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.leadId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.leadName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.bankName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.pendingDocs}</td>
                      <td className="px-6 py-4 text-sm">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUploadClick(item)}
                        >
                          <span className="mr-1">📤</span> {item.action}
                        </Button>
                      </td>
                    </tr>
                  )) :
                  filteredCompletedData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.leadId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.leadName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.bankName}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleStatusClick(item)}
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 cursor-pointer transition-colors"
                        >
                          {item.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={handleInitiateDisbursement}
                          >
                            {item.action}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadSanctionLetter(item.leadId)}
                            className="flex items-center space-x-1"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download Sanction Letter</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        pendingDocs={selectedLead?.pendingDocs || ""}
        leadName={selectedLead?.leadName || ""}
      />

      {/* Status Tracking Modal */}
      <StatusTrackingModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        leadName={selectedLead?.leadName || ""}
      />
    </Layout>
  );
};

export default BankSanctions;
