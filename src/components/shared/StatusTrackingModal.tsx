
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface StatusTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadName?: string;
}

const StatusTrackingModal: React.FC<StatusTrackingModalProps> = ({
  isOpen,
  onClose,
  leadName = "Customer"
}) => {
  const stages = [
    { id: 1, name: "Stage 1", status: "done", label: "Processing..." },
    { id: 2, name: "Stage 2", status: "done", label: "Done" },
    { id: 3, name: "Stage 3", status: "current", label: "Next Step" },
    { id: 4, name: "Stage 4", status: "pending", label: "Next Step" },
    { id: 5, name: "Stage 5", status: "pending", label: "Next Step" },
    { id: 6, name: "Stage 6", status: "pending", label: "Final Step" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg p-0">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="text-base font-medium text-gray-900 dark:text-white">
            Track your loan progress in real-time.
          </DialogTitle>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        <div className="p-6">
          {/* Progress Labels */}
          <div className="flex justify-between mb-3 text-xs text-gray-600 dark:text-gray-400">
            <span className="text-green-600 dark:text-green-400">✓ Done</span>
            <span className="text-green-600 dark:text-green-400">✓ Done</span>
            <span className="text-blue-600 dark:text-blue-400">● Next Step</span>
            <span className="text-gray-400 dark:text-gray-500">● Next Step</span>
            <span className="text-gray-400 dark:text-gray-500">● Next Step</span>
            <span className="text-gray-400 dark:text-gray-500">● Final Step</span>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-4">
            <div className="flex items-center">
              {stages.map((stage, index) => (
                <React.Fragment key={stage.id}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center z-10 ${
                    stage.status === 'done' ? 'bg-green-500' : 
                    stage.status === 'current' ? 'bg-blue-500' : 
                    'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {stage.status === 'done' ? (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    ) : stage.status === 'current' ? (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-500 rounded-full" />
                    )}
                  </div>
                  {index < stages.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${
                      index < 2 ? 'bg-green-500' : 
                      index === 2 ? 'bg-blue-500' : 
                      'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Stage Labels */}
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            {stages.map((stage) => (
              <span key={stage.id} className="text-center">
                {stage.name}
              </span>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusTrackingModal;
