import React, { useState } from "react";
import LoanAdministratorLayout from "../components/LoanAdministratorLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import SanctionsDataTable from "../components/sanctions/SanctionsDataTable";
import DocumentUploadModal from "../components/sanctions/DocumentUploadModal";
import MultiDocumentUploadModal from "../components/sanctions/MultiDocumentUploadModal";

const LoanAdministratorBankSanctions = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [multiUploadModalOpen, setMultiUploadModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const pendingSanctionsData = [
    {
      leadId: "#8232",
      leadName: "Rajesh Sharma",
      salesExecutive: "Amit Thakur",
      bankName: "HDFC Bank",
      pendingDocs: "KYC, Salary Slip",
      action: "upload",
      uploadedPendingDocs: false,
      uploadedSanctionLetter: false
    },
    {
      leadId: "#1232",
      leadName: "Priya Mehta",
      salesExecutive: "Neha Verma",
      bankName: "SBI",
      pendingDocs: "PAN Card, Income Proof",
      action: "upload",
      uploadedPendingDocs: false,
      uploadedSanctionLetter: false
    },
    {
      leadId: "#4232",
      leadName: "Anil Gupta",
      salesExecutive: "Rohit Singh",
      bankName: "HDFC Bank",
      pendingDocs: "Salary Slip, Income Proof",
      action: "done",
      uploadedPendingDocs: true,
      uploadedSanctionLetter: true
    },
    {
      leadId: "#1232",
      leadName: "Priya Mehta",
      salesExecutive: "Neha Verma",
      bankName: "SBI",
      pendingDocs: "PAN Card, Income Proof",
      action: "upload",
      uploadedPendingDocs: false,
      uploadedSanctionLetter: false
    },
    {
      leadId: "#8232",
      leadName: "Rajesh Sharma",
      salesExecutive: "Amit Thakur",
      bankName: "HDFC Bank",
      pendingDocs: "KYC, Salary Slip",
      action: "upload",
      uploadedPendingDocs: false,
      uploadedSanctionLetter: false
    },
    {
      leadId: "#4232",
      leadName: "Anil Gupta",
      salesExecutive: "Rohit Singh",
      bankName: "HDFC Bank",
      pendingDocs: "Salary Slip, Income Proof",
      action: "done",
      uploadedPendingDocs: true,
      uploadedSanctionLetter: true
    }
  ];

  const completedSanctionsData = [
    {
      leadId: "#8232",
      leadName: "Rajesh Sharma",
      salesExecutive: "Amit Thakur",
      bankName: "SBI Bank",
      sanctionDate: "13 Mar 2024",
      action: "view"
    },
    {
      leadId: "#8232",
      leadName: "Rajesh Sharma",
      salesExecutive: "Amit Thakur",
      bankName: "SBI Bank",
      sanctionDate: "13 Mar 2024",
      action: "view"
    },
    {
      leadId: "#8232",
      leadName: "Rajesh Sharma",
      salesExecutive: "Amit Thakur",
      bankName: "SBI Bank",
      sanctionDate: "13 Mar 2024",
      action: "view"
    }
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleUploadClick = (lead: any) => {
    setSelectedLead(lead);
    setUploadModalOpen(true);
  };

  const handleMultiUploadClick = (lead: any, docs: string[]) => {
    setSelectedLead(lead);
    setSelectedDocs(docs);
    setMultiUploadModalOpen(true);
  };

  const handleViewSanctionLetter = (leadId: string) => {
    console.log(`Viewing sanction letter for lead: ${leadId}`);
  };

  const handleUploadPendingDocs = (leadId: string, selectedDocs: string[]) => {
    console.log(`Uploading pending docs for lead ${leadId}:`, selectedDocs);
    // TODO: Implement actual upload logic
  };

  const handleUploadSanctionLetter = (leadId: string) => {
    console.log(`Uploading sanction letter for lead: ${leadId}`);
    // TODO: Implement actual upload logic
  };

  return (
    <LoanAdministratorLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bank Sanctions</h1>
        
        <Card className="bg-white dark:bg-gray-800 p-6">
          {/* Main Tab Navigation - Pending vs Completed */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => handleTabChange("pending")}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === "pending"
                  ? "bg-brand-purple text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => handleTabChange("completed")}
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
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </Button>
            </div>
          </div>

          {/* Data Table */}
          <SanctionsDataTable 
            data={activeTab === "pending" ? pendingSanctionsData : completedSanctionsData}
            activeTab={activeTab}
            onUploadClick={handleUploadClick}
            onMultiUploadClick={handleMultiUploadClick}
            onViewSanctionLetter={handleViewSanctionLetter}
            onUploadPendingDocs={handleUploadPendingDocs}
            onUploadSanctionLetter={handleUploadSanctionLetter}
          />
        </Card>
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        pendingDocs={selectedLead?.pendingDocs || ""}
        leadName={selectedLead?.leadName || ""}
      />

      {/* Multi Document Upload Modal */}
      <MultiDocumentUploadModal
        isOpen={multiUploadModalOpen}
        onClose={() => setMultiUploadModalOpen(false)}
        selectedDocs={selectedDocs}
        leadName={selectedLead?.leadName || ""}
      />
    </LoanAdministratorLayout>
  );
};

export default LoanAdministratorBankSanctions;
