
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

const InitiateDocumentsRequestTab = () => {
  const [uploadedDocs, setUploadedDocs] = useState({
    ocrReceipt: null,
    ocrReflection: null,
    demandLetter: null,
    architectLetter: null,
    consentLetter: null,
  });

  const handleFileUpload = (docType: string, file: File | null) => {
    setUploadedDocs(prev => ({
      ...prev,
      [docType]: file
    }));
    if (file) {
      toast.success(`${docType} uploaded successfully`);
    }
  };

  const handleRequestDisbursement = () => {
    const hasUploadedDocs = Object.values(uploadedDocs).some(doc => doc !== null);
    if (!hasUploadedDocs) {
      toast.error("Please upload at least one document");
      return;
    }
    
    toast.success("Disbursement request submitted successfully!");
  };

  const renderDocumentUpload = (title: string, subtitle: string, docType: string) => (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="file"
          id={docType}
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => handleFileUpload(docType, e.target.files?.[0] || null)}
        />
        <label
          htmlFor={docType}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Upload className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {uploadedDocs[docType as keyof typeof uploadedDocs] ? 'Change file' : 'Drag file here or Browse'}
          </span>
        </label>
        {uploadedDocs[docType as keyof typeof uploadedDocs] && (
          <span className="text-xs text-green-600 dark:text-green-400">
            ✓ Uploaded
          </span>
        )}
      </div>
    </div>
  );

  const hasUploadedDocs = Object.values(uploadedDocs).some(doc => doc !== null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h2 className="text-xl font-semibold mb-2">Request For Part Disbursement</h2>
        <p className="text-gray-600 dark:text-gray-400">Upload the required documents to proceed with your disbursement request</p>
      </div>
      
      {/* Document Upload Section */}
      <div className="grid gap-6">
        {renderDocumentUpload("OCR receipt", "JPG/PNG/PDF format accepted", "ocrReceipt")}
        {renderDocumentUpload("OCR reflection", "JPG/PNG/PDF format accepted", "ocrReflection")}
        {renderDocumentUpload("Demand Letter", "JPG/PNG/PDF format accepted", "demandLetter")}
        {renderDocumentUpload("Architect Letter", "JPG/PNG/PDF format accepted", "architectLetter")}
        {renderDocumentUpload("Consent Letter", "JPG/PNG/PDF format accepted", "consentLetter")}
      </div>
      
      {/* Request Disbursement Button */}
      {hasUploadedDocs && (
        <div className="flex justify-center pt-6">
          <Button 
            onClick={handleRequestDisbursement}
            className="bg-brand-purple hover:bg-brand-purple/90 text-white px-8 py-2"
          >
            Request Disbursement
          </Button>
        </div>
      )}
    </div>
  );
};

export default InitiateDocumentsRequestTab;
