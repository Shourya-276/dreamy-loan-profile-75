
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";

interface MultiDocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDocs: string[];
  leadName: string;
}

const MultiDocumentUploadModal: React.FC<MultiDocumentUploadModalProps> = ({
  isOpen,
  onClose,
  selectedDocs,
  leadName
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});

  const handleFileUpload = (docType: string, file: File | null) => {
    setUploadedFiles(prev => ({
      ...prev,
      [docType]: file
    }));
  };

  const handleBrowseClick = (docType: string) => {
    const input = window.document.createElement('input');
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

  const handleSubmit = () => {
    console.log('Uploading files:', uploadedFiles);
    // TODO: Implement actual upload logic
    onClose();
  };

  const handleClear = () => {
    setUploadedFiles({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-800">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Upload className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-lg font-semibold">Pending Document</DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {selectedDocs.map((docType) => (
            <div key={docType} className="space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{docType}</h3>
              
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                onClick={() => handleBrowseClick(docType)}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {uploadedFiles[docType] ? (
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      ✓ {uploadedFiles[docType]?.name}
                    </span>
                  ) : (
                    <>
                      Drag file here or{" "}
                      <span className="text-blue-600 dark:text-blue-400 hover:underline">
                        Browse
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3 mt-6">
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="flex-1"
          >
            Clear
          </Button>
          <Button 
            onClick={handleSubmit}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultiDocumentUploadModal;
