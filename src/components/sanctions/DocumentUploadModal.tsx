
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingDocs: string;
  leadName: string;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  pendingDocs,
  leadName
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({});
  
  const documentList = pendingDocs.split(', ').filter(doc => doc.trim());

  const handleFileUpload = (docType: string, file: File | null) => {
    setUploadedFiles(prev => ({
      ...prev,
      [docType]: file
    }));
  };

  const handleSubmit = () => {
    console.log('Uploading documents:', uploadedFiles);
    // TODO: Implement actual file upload logic
    onClose();
  };

  const handleClear = () => {
    setUploadedFiles({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border-0 shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <DialogTitle className="text-lg font-medium text-gray-900">
              Pending Document
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {documentList.map((docType, index) => (
            <div key={index} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {docType}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id={`file-${index}`}
                  className="hidden"
                  onChange={(e) => handleFileUpload(docType, e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label htmlFor={`file-${index}`} className="cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    {uploadedFiles[docType] ? (
                      <span className="text-green-600 font-medium">
                        {uploadedFiles[docType]?.name}
                      </span>
                    ) : (
                      <>
                        <span className="text-blue-600 underline">Drop file here or Browse</span>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1"
          >
            Clear
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadModal;
