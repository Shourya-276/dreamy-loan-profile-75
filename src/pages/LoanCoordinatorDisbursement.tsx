import React, { useState, useMemo } from "react";
import LoanCoordinatorLayout from "../components/LoanCoordinatorLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Upload, Download, CalendarIcon, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import PendingDocsModal from "../components/disbursement/PendingDocsModal";
import VerificationInitiateModal from "../components/disbursement/VerificationInitiateModal";
import UploadReportModal from "../components/disbursement/UploadReportModal";

/**
 * Interface for comprehensive disbursement tracking data
 * Defines structure for detailed pending disbursement records
 */
interface DetailedDisbursementRecord {
  leadId: string;
  leadName: string;
  salesExecutive: string;
  bankName: string;
  disbursementType?: string;
  pendingDoc?: string[];
  hardCopy?: boolean;
  verificationInitiate?: boolean;
  uploadReports?: boolean;
  scan?: boolean;
  raas?: boolean;
  rlms?: boolean;
  cod?: boolean;
  poAssigned?: boolean;
  income?: boolean;
  lnt?: boolean;
  requestedAmount?: string;
  sanctionAmt?: string;
  postSanctionDate?: Date;
  appointmentFixed?: boolean;
  appointmentDate?: Date;
  appointmentTime?: string;
  documentation?: boolean;
  documentationDate?: Date | string;
  disbursementDone?: string;
  utr?: string;
  status?: string;
  paymentAmount?: string;
}

/**
 * Interface for simple completed disbursement records
 */
interface CompletedDisbursementRecord {
  leadId: string;
  leadName: string;
  salesExecutive: string;
  bankName: string;
  status?: string;
  paymentAmount?: string;
  utr?: string;
}

/**
 * Loan Coordinator Disbursement Management Page
 * Handles tracking of loan disbursements in pending and completed states
 * Features toggle switches for hard copy document status and comprehensive data views
 */
const LoanCoordinatorDisbursement: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<DetailedDisbursementRecord | null>(null);
  
  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [leadIdFilter, setLeadIdFilter] = useState("");
  const [bankNameFilter, setBankNameFilter] = useState("");
  
  // Modal states
  const [pendingDocsModal, setPendingDocsModal] = useState<{
    isOpen: boolean;
    leadName: string;
    pendingDocs: string;
  }>({ isOpen: false, leadName: "", pendingDocs: "" });
  
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean;
    leadName: string;
  }>({ isOpen: false, leadName: "" });
  
  const [uploadReportModal, setUploadReportModal] = useState<{
    isOpen: boolean;
    leadName: string;
  }>({ isOpen: false, leadName: "" });

  const [pendingRecords, setPendingRecords] = useState<DetailedDisbursementRecord[]>([
    {
      leadId: "#8232",
      leadName: "Rajesh Sharma",
      salesExecutive: "Amit Thakur",
      bankName: "SBI",
      disbursementType: "New",
      pendingDoc: ["KYC Slip"],
      hardCopy: true,
      verificationInitiate: false,
      uploadReports: false,
      scan: true,
      raas: false,
      rlms: true,
      cod: true,
      poAssigned: false,
      income: true,
      lnt: true,
      requestedAmount: "₹50,00,000",
      sanctionAmt: "₹5,00,000",
      postSanctionDate: new Date("2024-03-15"),
      appointmentFixed: false,
      appointmentDate: new Date("2024-03-15"),
      appointmentTime: "11:00 AM",
      documentation: false,
      documentationDate: new Date("2024-03-15"),
      disbursementDone: "₹5,00,000",
      utr: "#8232001"
    },
    {
      leadId: "#1232",
      leadName: "Priya Mehta",
      salesExecutive: "Neha Verma",
      bankName: "HDFC",
      disbursementType: "Part",
      pendingDoc: ["Bank Statements"],
      hardCopy: false,
      verificationInitiate: false,
      uploadReports: true,
      scan: false,
      raas: true,
      rlms: false,
      cod: true,
      poAssigned: true,
      income: false,
      lnt: true,
      requestedAmount: "₹1,20,00,000",
      sanctionAmt: "₹3,50,000",
      postSanctionDate: new Date("2024-03-14"),
      appointmentFixed: true,
      appointmentDate: new Date("2024-03-14"),
      appointmentTime: "2:30 PM",
      documentation: true,
      documentationDate: new Date("2024-03-14"),
      disbursementDone: "₹3,50,000",
      utr: "#1232001"
    },
    {
      leadId: "#4232",
      leadName: "Anil Gupta",
      salesExecutive: "Rohit Singh",
      bankName: "ICICI",
      disbursementType: "New",
      pendingDoc: [],
      hardCopy: true,
      verificationInitiate: false,
      uploadReports: true,
      scan: true,
      raas: true,
      rlms: true,
      cod: false,
      poAssigned: true,
      income: true,
      lnt: true,
      requestedAmount: "₹75,00,000",
      sanctionAmt: "₹7,00,000",
      postSanctionDate: new Date("2024-03-17"),
      appointmentFixed: true,
      appointmentDate: new Date("2024-03-17"),
      appointmentTime: "4:15 PM",
      documentation: false,
      documentationDate: new Date("2024-03-17"),
      disbursementDone: "₹7,00,000",
      utr: "#4232001"
    }
  ]);

  // Time slots for appointment dropdown
  const timeSlots = [
    "10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM",
    "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM",
    "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM",
    "1:00 PM", "1:15 PM", "1:30 PM", "1:45 PM",
    "2:00 PM", "2:15 PM", "2:30 PM", "2:45 PM",
    "3:00 PM", "3:15 PM", "3:30 PM", "3:45 PM",
    "4:00 PM", "4:15 PM", "4:30 PM", "4:45 PM",
    "5:00 PM", "5:15 PM", "5:30 PM", "5:45 PM",
    "6:00 PM"
  ];

  /**
   * Sample data for completed disbursements
   * Shows final disbursement records with payment details
   */
  const completedRecords: CompletedDisbursementRecord[] = [
    {
      leadId: "#8230",
      leadName: "Rajesh Gupta",
      salesExecutive: "Amit Thakur",
      bankName: "HDFC",
      status: "Completed",
      paymentAmount: "₹12,20,000",
      utr: "UTR123456789"
    },
    {
      leadId: "#1230",
      leadName: "Neha Sharma",
      salesExecutive: "Neha Verma",
      bankName: "SBI",
      status: "Completed",
      paymentAmount: "₹8,50,000",
      utr: "UTR987654321"
    },
    {
      leadId: "#4230",
      leadName: "Vikash Mehta",
      salesExecutive: "Rohit Singh",
      bankName: "ICICI",
      status: "Completed",
      paymentAmount: "₹15,75,000",
      utr: "UTR456789123"
    }
  ];

  /**
   * Handles tab switching between pending and completed disbursements
   */
  const handleTabChange = (tab: string): void => {
    setActiveTab(tab);
  };

  /**
   * Handles search input changes for filtering records
   */
  const handleSearchChange = (value: string): void => {
    setSearchTerm(value);
  };

  /**
   * Handles toggle switch changes for any boolean field in pending records
   */
  const handleToggleChange = (index: number, field: keyof DetailedDisbursementRecord, checked: boolean): void => {
    setPendingRecords(prev => 
      prev.map((record, i) => {
        if (i === index) {
          const updatedRecord = { ...record, [field]: checked };
          return updatedRecord;
        }
        return record;
      })
    );

    if (field === 'verificationInitiate' && checked) {
      const record = pendingRecords[index];
      setVerificationModal({
        isOpen: true,
        leadName: record.leadName
      });
    }
  };

  const handleInputChange = (index: number, field: keyof DetailedDisbursementRecord, value: string): void => {
    setPendingRecords(prev => 
      prev.map((record, i) => 
        i === index ? { ...record, [field]: value } : record
      )
    );
  };

  const handleDateChange = (index: number, field: keyof DetailedDisbursementRecord, date: Date | undefined): void => {
    setPendingRecords(prev => 
      prev.map((record, i) => 
        i === index ? { ...record, [field]: date } : record
      )
    );
  };

  const handlePendingDocChange = (index: number, selectedDocs: string[]): void => {
    setPendingRecords(prev => 
      prev.map((record, i) => 
        i === index ? { ...record, pendingDoc: selectedDocs } : record
      )
    );
  };

  const handlePendingDocsClick = (leadName: string, pendingDocs: string) => {
    setPendingDocsModal({
      isOpen: true,
      leadName,
      pendingDocs
    });
  };

  const handleUploadReportClick = (leadName: string) => {
    setUploadReportModal({
      isOpen: true,
      leadName
    });
  };

  const handleVerificationModalClose = () => {
    setVerificationModal({ isOpen: false, leadName: "" });
    setPendingRecords(prev => 
      prev.map(record => ({ ...record, verificationInitiate: false }))
    );
  };

  const handleConfirmClick = (record: DetailedDisbursementRecord) => {
    setSelectedRowData(record);
    setConfirmModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (selectedRowData) {
      // Move to completed records (in real app, this would be an API call)
      setPendingRecords(prev => prev.filter(record => record.leadId !== selectedRowData.leadId));
      setConfirmModalOpen(false);
      setSelectedRowData(null);
    }
  };

  const handleDownloadCompletedExcel = async () => {
    try {
      const XLSXModule = await import('xlsx');
      const { saveAs } = await import('file-saver');
      
      const XLSX = XLSXModule.default || XLSXModule;

      const excelData = completedRecords.map(record => ({
        'Lead ID': record.leadId,
        'Lead Name': record.leadName,
        'Sales Executive': record.salesExecutive,
        'Bank Name': record.bankName,
        'Status': record.status,
        'Payment Amount': record.paymentAmount,
        'UTR': record.utr
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      const colWidths = [
        { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 15 }
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Completed Disbursements');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const fileName = `Completed_Disbursements_${dateStr}.xlsx`;

      saveAs(data, fileName);
    } catch (error) {
      console.error('Error downloading Completed Disbursements Excel file:', error);
      alert('Error downloading Excel file. Please try again.');
    }
  };

  /**
   * Handles navigation to document page with lead name pre-filled
   */
  const handleLeadNameClick = (leadName: string): void => {
    navigate(`/loan-coordinator-document?leadName=${encodeURIComponent(leadName)}`);
  };

  // Filter the pending records based on filters
  const filteredPendingRecords = useMemo(() => {
    return pendingRecords.filter(record => {
      const matchesSearch = searchTerm === "" || 
        record.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.leadId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesName = nameFilter === "" || 
        record.leadName.toLowerCase().includes(nameFilter.toLowerCase());
      
      const matchesLeadId = leadIdFilter === "" || 
        record.leadId.toLowerCase().includes(leadIdFilter.toLowerCase());
      
      const matchesBank = bankNameFilter === "" || 
        record.bankName.toLowerCase().includes(bankNameFilter.toLowerCase());
      
      return matchesSearch && matchesName && matchesLeadId && matchesBank;
    });
  }, [pendingRecords, searchTerm, nameFilter, leadIdFilter, bankNameFilter]);

  // Filter the completed records based on filters
  const filteredCompletedRecords = useMemo(() => {
    return completedRecords.filter(record => {
      const matchesSearch = searchTerm === "" || 
        record.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.leadId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesName = nameFilter === "" || 
        record.leadName.toLowerCase().includes(nameFilter.toLowerCase());
      
      const matchesLeadId = leadIdFilter === "" || 
        record.leadId.toLowerCase().includes(leadIdFilter.toLowerCase());
      
      const matchesBank = bankNameFilter === "" || 
        record.bankName.toLowerCase().includes(bankNameFilter.toLowerCase());
      
      return matchesSearch && matchesName && matchesLeadId && matchesBank;
    });
  }, [completedRecords, searchTerm, nameFilter, leadIdFilter, bankNameFilter]);

  const renderPendingTable = () => (
    <div className="overflow-x-auto pr-12" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#4338ca #f3f4f6'
    }}>
      <style>
        {`
          .overflow-x-auto::-webkit-scrollbar {
            height: 8px;
          }
          .overflow-x-auto::-webkit-scrollbar-track {
            background: #f3f4f6;
            border-radius: 4px;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb {
            background: #4338ca;
            border-radius: 4px;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb:hover {
            background: #3730a3;
          }
        `}
      </style>
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Lead ID</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Lead Name</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Sales Executive</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Bank Name</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Disbursement Type</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Pending Doc</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Hard Copy</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Verification Initiate</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Upload Reports</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">SCAN</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">RAAS</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">RLMS</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">COD</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">PO Assigned</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Income</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">L&T</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Requested Amount</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Sanction Amt</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Date</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Appointment Fixed</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Appointment Date</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Appointment Time</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Documentation</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Documentation Date</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Disbursement Done</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">UTR</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredPendingRecords.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{item.leadId}</td>
              <td className="px-3 py-4 text-sm text-blue-600 dark:text-blue-400 whitespace-nowrap hover:underline cursor-pointer"
                  onClick={() => handleLeadNameClick(item.leadName)}>
                {item.leadName}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{item.salesExecutive}</td>
              <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{item.bankName}</td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Select
                  value={item.disbursementType || ""}
                  onValueChange={(value) => handleInputChange(index, 'disbursementType', value)}
                >
                  <SelectTrigger className="w-24 text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 z-50">
                    <SelectItem value="Part">Part</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-32 text-xs justify-between">
                        {item.pendingDoc && item.pendingDoc.length > 0 
                          ? `${item.pendingDoc.length} selected`
                          : "Select docs"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3 bg-white dark:bg-gray-800 z-50">
                      <div className="space-y-2">
                        <div className="font-medium text-sm">Select Documents:</div>
                        {["KYC Slip", "Bank Statements"].map((doc) => (
                          <label key={doc} className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={item.pendingDoc?.includes(doc) || false}
                              onChange={(e) => {
                                const currentDocs = item.pendingDoc || [];
                                let newDocs;
                                if (e.target.checked) {
                                  newDocs = [...currentDocs, doc];
                                } else {
                                  newDocs = currentDocs.filter(d => d !== doc);
                                }
                                handlePendingDocChange(index, newDocs);
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{doc}</span>
                          </label>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {item.pendingDoc && item.pendingDoc.length > 0 ? (
                    <button 
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      onClick={() => handlePendingDocsClick(item.leadName, item.pendingDoc?.join(', ') || "")}
                    >
                      <Upload className="w-4 h-4 text-blue-600" />
                    </button>
                  ) : (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Switch 
                  checked={item.hardCopy || false} 
                  onCheckedChange={(checked) => handleToggleChange(index, 'hardCopy', checked)}
                  className="data-[state=checked]:bg-green-500"
                />
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Switch 
                  checked={item.verificationInitiate || false} 
                  onCheckedChange={(checked) => handleToggleChange(index, 'verificationInitiate', checked)}
                  className="data-[state=checked]:bg-green-500"
                />
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <button 
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => handleUploadReportClick(item.leadName)}
                >
                  <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Switch 
                  checked={item.scan || false} 
                  onCheckedChange={(checked) => handleToggleChange(index, 'scan', checked)}
                  className="data-[state=checked]:bg-green-500"
                />
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Switch 
                  checked={item.raas || false} 
                  onCheckedChange={(checked) => handleToggleChange(index, 'raas', checked)}
                  className="data-[state=checked]:bg-green-500"
                />
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Switch 
                  checked={item.rlms || false} 
                  onCheckedChange={(checked) => handleToggleChange(index, 'rlms', checked)}
                  className="data-[state=checked]:bg-green-500"
                />
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Switch 
                  checked={item.cod || false} 
                  onCheckedChange={(checked) => handleToggleChange(index, 'cod', checked)}
                  className="data-[state=checked]:bg-green-500"
                />
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Switch 
                  checked={item.poAssigned || false} 
                  onCheckedChange={(checked) => handleToggleChange(index, 'poAssigned', checked)}
                  className="data-[state=checked]:bg-green-500"
                />
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Switch 
                  checked={item.income || false} 
                  onCheckedChange={(checked) => handleToggleChange(index, 'income', checked)}
                  className="data-[state=checked]:bg-green-500"
                />
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Switch 
                  checked={item.lnt || false} 
                  onCheckedChange={(checked) => handleToggleChange(index, 'lnt', checked)}
                  className="data-[state=checked]:bg-green-500"
                />
              </td>
              <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {item.requestedAmount || "-"}
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Input
                  value={item.sanctionAmt || ""}
                  onChange={(e) => handleInputChange(index, 'sanctionAmt', e.target.value)}
                  className="w-28 text-sm"
                  placeholder="Amount"
                />
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-32 justify-start text-left font-normal text-xs",
                        !item.postSanctionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {item.postSanctionDate ? format(item.postSanctionDate, "dd/MM/yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={item.postSanctionDate}
                      onSelect={(date) => handleDateChange(index, 'postSanctionDate', date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Switch 
                  checked={item.appointmentFixed || false} 
                  onCheckedChange={(checked) => handleToggleChange(index, 'appointmentFixed', checked)}
                  className="data-[state=checked]:bg-green-500"
                />
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-32 justify-start text-left font-normal text-xs",
                        !item.appointmentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {item.appointmentDate ? format(item.appointmentDate, "dd/MM/yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={item.appointmentDate}
                      onSelect={(date) => handleDateChange(index, 'appointmentDate', date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Select
                  value={item.appointmentTime || ""}
                  onValueChange={(value) => handleInputChange(index, 'appointmentTime', value)}
                >
                  <SelectTrigger className="w-24 text-xs">
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 z-50 max-h-60">
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Switch 
                  checked={item.documentation || false} 
                  onCheckedChange={(checked) => handleToggleChange(index, 'documentation', checked)}
                  className="data-[state=checked]:bg-green-500"
                />
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-32 justify-start text-left font-normal text-xs",
                        !item.documentationDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {item.documentationDate ? 
                        (item.documentationDate instanceof Date ? 
                          format(item.documentationDate, "dd/MM/yyyy") : 
                          item.documentationDate) : 
                        "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={item.documentationDate instanceof Date ? item.documentationDate : undefined}
                      onSelect={(date) => handleDateChange(index, 'documentationDate', date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Input
                  value={item.disbursementDone || ""}
                  onChange={(e) => handleInputChange(index, 'disbursementDone', e.target.value)}
                  className="w-28 text-sm"
                  placeholder="Amount"
                />
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Input
                  value={item.utr || ""}
                  onChange={(e) => handleInputChange(index, 'utr', e.target.value)}
                  className="w-24 text-sm"
                  placeholder="UTR"
                />
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <Button
                  onClick={() => handleConfirmClick(item)}
                  className="bg-brand-purple hover:bg-brand-purple/90 text-white text-xs px-3 py-1"
                >
                  Confirm
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCompletedTable = () => (
    <div className="overflow-x-auto pr-8">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead ID</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Sales Executive</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Bank Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Payment Amount</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">UTR</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredCompletedRecords.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{item.leadId}</td>
              <td className="px-4 py-4 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  onClick={() => handleLeadNameClick(item.leadName)}>
                {item.leadName}
              </td>
              <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{item.salesExecutive}</td>
              <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">{item.bankName}</td>
              <td className="px-4 py-4 text-sm text-green-600 font-medium">{item.status}</td>
              <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">{item.paymentAmount}</td>
              <td className="px-4 py-4 text-sm text-blue-600">{item.utr}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <LoanCoordinatorLayout>
      <div className="max-w-7xl mx-auto space-y-6 pr-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disbursement Review</h1>
          {activeTab === "completed" && (
            <Button 
              onClick={handleDownloadCompletedExcel}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download in Excel
            </Button>
          )}
        </div>
        
        <Card className="bg-white dark:bg-gray-800 p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => handleTabChange("pending")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "pending"
                  ? "bg-brand-purple text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => handleTabChange("completed")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "completed"
                  ? "bg-brand-purple text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Completed
            </button>
          </div>

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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 bg-white dark:bg-gray-800 z-50">
                  <div className="space-y-4">
                    <div className="font-medium text-sm">Column Filters</div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Name</label>
                        <Input
                          placeholder="Filter by name"
                          value={nameFilter}
                          onChange={(e) => setNameFilter(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Lead ID</label>
                        <Input
                          placeholder="Filter by Lead ID"
                          value={leadIdFilter}
                          onChange={(e) => setLeadIdFilter(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Bank Name</label>
                        <Input
                          placeholder="Filter by Bank Name"
                          value={bankNameFilter}
                          onChange={(e) => setBankNameFilter(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNameFilter("");
                            setLeadIdFilter("");
                            setBankNameFilter("");
                          }}
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {activeTab === "pending" ? renderPendingTable() : renderCompletedTable()}
        </Card>

        <PendingDocsModal
          isOpen={pendingDocsModal.isOpen}
          onClose={() => setPendingDocsModal({ isOpen: false, leadName: "", pendingDocs: "" })}
          leadName={pendingDocsModal.leadName}
          pendingDocs={pendingDocsModal.pendingDocs}
        />

        <VerificationInitiateModal
          isOpen={verificationModal.isOpen}
          onClose={handleVerificationModalClose}
          leadName={verificationModal.leadName}
          requestedAmount={pendingRecords.find(r => r.leadName === verificationModal.leadName)?.requestedAmount}
        />

        <UploadReportModal
          isOpen={uploadReportModal.isOpen}
          onClose={() => setUploadReportModal({ isOpen: false, leadName: "" })}
          leadName={uploadReportModal.leadName}
        />

        {/* Confirmation Modal */}
        <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle>Confirm Lead Details</DialogTitle>
            </DialogHeader>
            {selectedRowData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Lead ID:</strong> {selectedRowData.leadId}</div>
                  <div><strong>Lead Name:</strong> {selectedRowData.leadName}</div>
                  <div><strong>Sales Executive:</strong> {selectedRowData.salesExecutive}</div>
                  <div><strong>Bank Name:</strong> {selectedRowData.bankName}</div>
                  <div><strong>Disbursement Type:</strong> {selectedRowData.disbursementType}</div>
                  <div><strong>Pending Documents:</strong> {selectedRowData.pendingDoc?.join(', ') || 'None'}</div>
                  <div><strong>Hard Copy:</strong> {selectedRowData.hardCopy ? 'Yes' : 'No'}</div>
                  <div><strong>SCAN:</strong> {selectedRowData.scan ? 'Yes' : 'No'}</div>
                  <div><strong>RAAS:</strong> {selectedRowData.raas ? 'Yes' : 'No'}</div>
                  <div><strong>RLMS:</strong> {selectedRowData.rlms ? 'Yes' : 'No'}</div>
                  <div><strong>COD:</strong> {selectedRowData.cod ? 'Yes' : 'No'}</div>
                  <div><strong>PO Assigned:</strong> {selectedRowData.poAssigned ? 'Yes' : 'No'}</div>
                  <div><strong>Income:</strong> {selectedRowData.income ? 'Yes' : 'No'}</div>
                  <div><strong>L&T:</strong> {selectedRowData.lnt ? 'Yes' : 'No'}</div>
                  <div><strong>Sanction Amount:</strong> {selectedRowData.sanctionAmt}</div>
                  <div><strong>Date:</strong> {selectedRowData.postSanctionDate ? format(selectedRowData.postSanctionDate, "dd/MM/yyyy") : 'Not set'}</div>
                  <div><strong>Appointment Fixed:</strong> {selectedRowData.appointmentFixed ? 'Yes' : 'No'}</div>
                  <div><strong>Appointment Date:</strong> {selectedRowData.appointmentDate ? format(selectedRowData.appointmentDate, "dd/MM/yyyy") : 'Not set'}</div>
                  <div><strong>Appointment Time:</strong> {selectedRowData.appointmentTime || 'Not set'}</div>
                  <div><strong>Documentation:</strong> {selectedRowData.documentation ? 'Yes' : 'No'}</div>
                  <div><strong>Documentation Date:</strong> {
                    selectedRowData.documentationDate ? 
                      (selectedRowData.documentationDate instanceof Date ? 
                        format(selectedRowData.documentationDate, "dd/MM/yyyy") : 
                        selectedRowData.documentationDate) : 
                      'Not set'
                  }</div>
                  <div><strong>Disbursement Done:</strong> {selectedRowData.disbursementDone}</div>
                  <div><strong>UTR:</strong> {selectedRowData.utr}</div>
                </div>
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Disclaimer:</strong> Please check all information carefully. Once confirmed, changes cannot be made.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmSubmit} className="bg-brand-purple hover:bg-brand-purple/90">
                Confirm & Move to Completed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LoanCoordinatorLayout>
  );
};

export default LoanCoordinatorDisbursement;
