
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadName: string;
}

const UploadReportModal: React.FC<UploadReportModalProps> = ({
  isOpen,
  onClose,
  leadName
}) => {
  const documentTypes = [
    "ROV",
    "Legal", 
    "Technical",
    "Business",
    "From 26AS",
    "ITR"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📄</span>
            </div>
            <span>Pending Document</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
          {documentTypes.map((docType, index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium">{docType}</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <span className="text-sm text-gray-500">Drag file here or </span>
                <button className="text-blue-600 text-sm hover:underline">Browse</button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Clear
          </Button>
          <Button className="bg-brand-purple hover:bg-brand-purple/90">
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadReportModal;
