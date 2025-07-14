
import React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DocumentChecklistOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentChecklistOverlay = ({ isOpen, onClose }: DocumentChecklistOverlayProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0">
        <div className="flex gap-4 p-6">
          {/* Document Checklist Section */}
          <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Document Checklist</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Identity Proof</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Aadhaar Card / PAN Card / Passport</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Address Proof</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Utility Bill / Rent Agreement / Passport / Driving licence / Voter ID</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Income Proof</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Salary Slips / Bank Statements / ITR / Form 16</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Property Papers</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sale Deed / Title Documents</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Business Proof (For Self-employed)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">GST Registration</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Additional Documents (if required)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Co-applicant KYC</p>
              </div>
            </div>
          </div>

          {/* Charges & Fees Section */}
          <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">₹</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Charges & Fees</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Processing Fees</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">₹1,200</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Legal Charges</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">₹900</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Technical Charges</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">₹200</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Stamp Duty</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">₹1,200</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">NOI (Noting of Interest)</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">₹1,200</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">CERSAI Tax</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">₹1,900</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Stamp Paper</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">₹200</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Other Charges</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">₹800</span>
              </div>

              <div className="flex justify-between items-center py-3 mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg px-4">
                <span className="text-base font-semibold text-gray-800 dark:text-gray-100">Total</span>
                <span className="text-base font-bold text-gray-800 dark:text-gray-100">₹7,200</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentChecklistOverlay;
