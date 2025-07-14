import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoanCoordinatorLayout from "../components/LoanCoordinatorLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import SanctionsDataTable from "../components/sanctions/SanctionsDataTable";
import DocumentUploadModal from "../components/sanctions/DocumentUploadModal";
import MultiDocumentUploadModal from "../components/sanctions/MultiDocumentUploadModal";

const LoanCoordinatorBankSanctions: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [multiUploadModalOpen, setMultiUploadModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  // Get lead name from URL parameters and set search term
  useEffect(() => {
    const leadName = searchParams.get('leadName');
    if (leadName) {
      setSearchTerm(leadName);
    }
  }, [searchParams]);

  const [pendingSanctionsData, setPendingSanctionsData] = useState([
    {
      leadId: "#8232",
      leadName: "Rajesh Sharma",
      bankName: "HDFC Bank",
      pendingDocs: "KYC, Salary Slip",
      action: "upload",
      uploadedPendingDocs: false,
      uploadedSanctionLetter: false,
      ipSanctionAmount: ""
    },
    {
      leadId: "#1232",
      leadName: "Priya Mehta",
      bankName: "SBI",
      pendingDocs: "PAN Card, Income Proof",
      action: "upload",
      uploadedPendingDocs: false,
      uploadedSanctionLetter: false,
      ipSanctionAmount: ""
    },
    {
      leadId: "#4232",
      leadName: "Anil Gupta",
      bankName: "HDFC Bank",
      pendingDocs: "Salary Slip, Income Proof",
      action: "done",
      uploadedPendingDocs: true,
      uploadedSanctionLetter: true,
      ipSanctionAmount: "₹25,00,000"
    },
    {
      leadId: "#5232",
      leadName: "Neha Verma",
      bankName: "ICICI Bank",
      pendingDocs: "Bank Statement, Address Proof",
      action: "upload",
      uploadedPendingDocs: false,
      uploadedSanctionLetter: false,
      ipSanctionAmount: ""
    },
    {
      leadId: "#6232",
      leadName: "Amit Singh",
      bankName: "SBI",
      pendingDocs: "Income Certificate, Property Papers",
      action: "upload",
      uploadedPendingDocs: false,
      uploadedSanctionLetter: false,
      ipSanctionAmount: ""
    }
  ]);

  const [completedSanctionsData, setCompletedSanctionsData] = useState([
    {
      leadId: "#3232",
      leadName: "Rohit Kumar",
      bankName: "HDFC Bank",
      sanctionDate: "13 Mar 2024",
      action: "view",
      ipSanctionAmount: "₹15,00,000"
    },
    {
      leadId: "#7232",
      leadName: "Sunita Devi",
      bankName: "SBI",
      sanctionDate: "12 Mar 2024",
      action: "view",
      ipSanctionAmount: "₹20,00,000"
    }
  ]);

  const handleTabChange = (tab: string): void => {
    setActiveTab(tab);
  };

  const handleSearchChange = (value: string): void => {
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

  const handleLeadNameClick = (leadName: string) => {
    navigate(`/loan-coordinator-document?leadName=${encodeURIComponent(leadName)}`);
  };

  const handleIPSanctionAmountChange = (leadId: string, amount: string) => {
    setPendingSanctionsData(prev => 
      prev.map(item => 
        item.leadId === leadId 
          ? { ...item, ipSanctionAmount: amount }
          : item
      )
    );
  };

  const handleConfirmRecord = (leadId: string) => {
    const record = pendingSanctionsData.find(item => item.leadId === leadId);
    if (record) {
      // Move to completed data
      const completedRecord = {
        ...record,
        sanctionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        action: "view"
      };
      setCompletedSanctionsData(prev => [...prev, completedRecord]);
      
      // Remove from pending data
      setPendingSanctionsData(prev => prev.filter(item => item.leadId !== leadId));
    }
  };

  return (
    <LoanCoordinatorLayout>
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
            onLeadNameClick={handleLeadNameClick}
            onIPSanctionAmountChange={handleIPSanctionAmountChange}
            onConfirmRecord={handleConfirmRecord}
            searchTerm={searchTerm}
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
    </LoanCoordinatorLayout>
  );
};

export default LoanCoordinatorBankSanctions;
