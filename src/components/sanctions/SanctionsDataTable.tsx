
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, Check } from "lucide-react";

interface SanctionItem {
  leadId: string;
  leadName: string;
  salesExecutive?: string;
  bankName: string;
  pendingDocs?: string;
  sanctionDate?: string;
  action: string;
  uploadedPendingDocs?: boolean;
  uploadedSanctionLetter?: boolean;
  ipSanctionAmount?: string;
}

interface SanctionsDataTableProps {
  data: SanctionItem[];
  activeTab: string;
  onUploadClick?: (lead: SanctionItem) => void;
  onMultiUploadClick?: (lead: SanctionItem, docs: string[]) => void;
  onViewSanctionLetter?: (leadId: string) => void;
  onUploadPendingDocs?: (leadId: string, selectedDocs: string[]) => void;
  onUploadSanctionLetter?: (leadId: string) => void;
  onLeadNameClick?: (leadName: string) => void;
  onIPSanctionAmountChange?: (leadId: string, amount: string) => void;
  onConfirmRecord?: (leadId: string) => void;
  searchTerm?: string;
}

const SanctionsDataTable: React.FC<SanctionsDataTableProps> = ({ 
  data, 
  activeTab, 
  onUploadClick, 
  onMultiUploadClick,
  onViewSanctionLetter,
  onUploadPendingDocs,
  onUploadSanctionLetter,
  onLeadNameClick,
  onIPSanctionAmountChange,
  onConfirmRecord,
  searchTerm
}) => {
  const [selectedPendingDocs, setSelectedPendingDocs] = useState<Record<string, string[]>>({});
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedLeadForConfirm, setSelectedLeadForConfirm] = useState<SanctionItem | null>(null);
  
  const showSalesExecutive = data.some(item => item.salesExecutive !== undefined);

  // Filter data based on search term
  const filteredData = searchTerm
    ? data.filter(item => 
        item.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.leadId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : data;

  const documentOptions = [
    "Bank Statement",
    "KYC Slip",
    "Income Proof",
    "Address Proof",
    "PAN Card",
    "Salary Slip"
  ];

  const handlePendingDocsChange = (leadId: string, doc: string, checked: boolean) => {
    setSelectedPendingDocs(prev => {
      const currentDocs = prev[leadId] || [];
      const newDocs = checked 
        ? [...currentDocs, doc]
        : currentDocs.filter(d => d !== doc);
      
      return {
        ...prev,
        [leadId]: newDocs
      };
    });
  };

  const handleUploadPendingDocs = (leadId: string) => {
    const selectedDocs = selectedPendingDocs[leadId] || [];
    if (selectedDocs.length > 0) {
      const lead = data.find(item => item.leadId === leadId);
      if (lead && onMultiUploadClick) {
        onMultiUploadClick(lead, selectedDocs);
      }
    }
  };

  const handleFileUpload = (leadId: string) => {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onUploadSanctionLetter?.(leadId);
      }
    };
    input.click();
  };

  const handleConfirmClick = (item: SanctionItem) => {
    setSelectedLeadForConfirm(item);
    setConfirmModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (selectedLeadForConfirm) {
      onConfirmRecord?.(selectedLeadForConfirm.leadId);
      setConfirmModalOpen(false);
      setSelectedLeadForConfirm(null);
    }
  };

  const renderActionButton = (item: SanctionItem) => {
    if (activeTab === "pending") {
      if (item.action === "upload") {
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center space-x-1"
            onClick={() => onUploadClick?.(item)}
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </Button>
        );
      } else {
        return (
          <Badge className="bg-green-100 text-green-800">
            ✓ Done
          </Badge>
        );
      }
    } else {
      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewSanctionLetter?.(item.leadId)}
        >
          View
        </Button>
      );
    }
  };

  const renderTableHeaders = () => {
    if (activeTab === "pending") {
      return (
        <>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead ID</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead Name</th>
          {showSalesExecutive && (
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Sales Executive</th>
          )}
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Bank Name</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Pending Docs</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Upload Pending Docs</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Upload Sanction Letter</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">IP Sanction Amount</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Confirm</th>
        </>
      );
    } else {
      return (
        <>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead ID</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead Name</th>
          {showSalesExecutive && (
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Sales Executive</th>
          )}
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Bank Name</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Sanction Date</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">IP Sanction Amount</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Sanction Letter</th>
        </>
      );
    }
  };

  const renderTableCells = (item: SanctionItem) => {
    if (activeTab === "pending") {
      return (
        <>
          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.leadId}</td>
          <td className="px-6 py-4 text-sm">
            <button
              onClick={() => onLeadNameClick?.(item.leadName)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer"
            >
              {item.leadName}
            </button>
          </td>
          {showSalesExecutive && (
            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.salesExecutive || ""}</td>
          )}
          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.bankName}</td>
          <td className="px-6 py-4 text-sm">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-32 text-xs justify-between">
                  {selectedPendingDocs[item.leadId]?.length > 0 
                    ? `${selectedPendingDocs[item.leadId].length} selected`
                    : "Select docs"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3 bg-white dark:bg-gray-800 z-50">
                <div className="space-y-2">
                  <div className="font-medium text-sm">Select Documents:</div>
                  {documentOptions.map((doc) => (
                    <label key={doc} className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={selectedPendingDocs[item.leadId]?.includes(doc) || false}
                        onChange={(e) => {
                          handlePendingDocsChange(item.leadId, doc, e.target.checked);
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{doc}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </td>
          <td className="px-6 py-4 text-sm">
            {item.uploadedPendingDocs ? (
              <div className="flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUploadPendingDocs(item.leadId)}
                disabled={!selectedPendingDocs[item.leadId]?.length}
                className="flex items-center space-x-1"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </Button>
            )}
          </td>
          <td className="px-6 py-4 text-sm">
            {item.uploadedSanctionLetter ? (
              <div className="flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFileUpload(item.leadId)}
                className="flex items-center space-x-1"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </Button>
            )}
          </td>
          <td className="px-6 py-4 text-sm">
            <Input
              type="text"
              placeholder="₹0"
              value={item.ipSanctionAmount || ""}
              onChange={(e) => onIPSanctionAmountChange?.(item.leadId, e.target.value)}
              className="w-32"
            />
          </td>
          <td className="px-6 py-4 text-sm">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleConfirmClick(item)}
              disabled={!item.ipSanctionAmount}
              className="bg-brand-purple hover:bg-brand-purple/90"
            >
              Confirm
            </Button>
          </td>
        </>
      );
    } else {
      return (
        <>
          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.leadId}</td>
          <td className="px-6 py-4 text-sm">
            <button
              onClick={() => onLeadNameClick?.(item.leadName)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer"
            >
              {item.leadName}
            </button>
          </td>
          {showSalesExecutive && (
            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.salesExecutive || ""}</td>
          )}
          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.bankName}</td>
          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.sanctionDate}</td>
          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.ipSanctionAmount}</td>
          <td className="px-6 py-4 text-sm">
            {renderActionButton(item)}
          </td>
        </>
      );
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            {renderTableHeaders()}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredData.map((item, index) => (
            <tr key={index}>
              {renderTableCells(item)}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm Record Submission</DialogTitle>
          </DialogHeader>
          
          {selectedLeadForConfirm && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                <div><strong>Lead ID:</strong> {selectedLeadForConfirm.leadId}</div>
                <div><strong>Lead Name:</strong> {selectedLeadForConfirm.leadName}</div>
                <div><strong>Bank Name:</strong> {selectedLeadForConfirm.bankName}</div>
                <div><strong>IP Sanction Amount:</strong> {selectedLeadForConfirm.ipSanctionAmount}</div>
              </div>
              
              <div className="text-red-600 text-sm font-medium">
                ⚠️ Please confirm carefully. Once submitted, this data cannot be modified.
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit} className="bg-brand-purple hover:bg-brand-purple/90">
              Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SanctionsDataTable;
