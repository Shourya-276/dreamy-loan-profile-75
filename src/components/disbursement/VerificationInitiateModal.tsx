
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";

interface VerificationInitiateModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadName: string;
  requestedAmount?: string;
}

const VerificationInitiateModal: React.FC<VerificationInitiateModalProps> = ({
  isOpen,
  onClose,
  leadName,
  requestedAmount
}) => {
  // Helper function to check if amount is greater than 1 crore
  const isAmountAbove1Crore = (amount: string = ""): boolean => {
    // Remove currency symbols and commas, parse the number
    const numericAmount = parseFloat(amount.replace(/[₹,]/g, ""));
    return numericAmount > 10000000; // 1 crore = 10,000,000
  };

  const isHighValue = isAmountAbove1Crore(requestedAmount || "");

  // Generate document types based on amount
  const getDocumentTypes = () => {
    const baseTypes = ["ROV", "From 26AS", "ITR"];
    
    if (isHighValue) {
      // For > 1 crore: 2 Legal and 2 Technical
      return [...baseTypes, "Legal 1", "Legal 2", "Technical 1", "Technical 2"];
    } else {
      // For ≤ 1 crore: 1 Legal and 1 Technical
      return [...baseTypes, "Legal", "Technical"];
    }
  };

  const documentTypes = getDocumentTypes();

  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { file: File | null; uploading: boolean }>>({});

  const handleFileUpload = async (docType: string, file: File | null) => {
    if (!file) return;

    // Set uploading state
    setUploadedDocs(prev => ({
      ...prev,
      [docType]: { file: null, uploading: true }
    }));

    // Simulate upload process
    setTimeout(() => {
      setUploadedDocs(prev => ({
        ...prev,
        [docType]: { file: file, uploading: false }
      }));
    }, 1500);
  };

  const handleUploadClick = (docType: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(docType, file);
      }
    };
    input.click();
  };

  const getUploadStatus = (docType: string) => {
    const status = uploadedDocs[docType];
    if (!status) return null;
    
    if (status.uploading) {
      return (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded">
            Uploading...
          </span>
        </div>
      );
    }
    
    if (status.file) {
      return (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-green-600 border border-green-200 px-2 py-1 rounded">
            Document Uploaded
          </span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📧</span>
            </div>
            <span>Send Email</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#4338ca #f3f4f6'
        }}>
          <style>
            {`
              .overflow-y-auto::-webkit-scrollbar {
                width: 6px;
              }
              .overflow-y-auto::-webkit-scrollbar-track {
                background: #f3f4f6;
                border-radius: 3px;
              }
              .overflow-y-auto::-webkit-scrollbar-thumb {
                background: #4338ca;
                border-radius: 3px;
              }
              .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                background: #3730a3;
              }
            `}
          </style>
          {documentTypes.map((docType, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 flex-1">
                <span className="text-sm font-medium min-w-[80px]">{docType}</span>
                {getUploadStatus(docType) || (
                  <button
                    onClick={() => handleUploadClick(docType)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-xs">Upload Document</span>
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Select>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue placeholder="Select Agency" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    <SelectItem value="agency1">Agency 1</SelectItem>
                    <SelectItem value="agency2">Agency 2</SelectItem>
                    <SelectItem value="agency3">Agency 3</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  className="bg-brand-purple hover:bg-brand-purple/90 text-xs px-4"
                  disabled={uploadedDocs[docType]?.uploading}
                >
                  Email
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-4 flex-shrink-0 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationInitiateModal;
