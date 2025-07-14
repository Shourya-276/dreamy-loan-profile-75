
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

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
      <DialogContent className="max-w-2xl bg-white border-0 shadow-lg">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-lg font-medium text-gray-900">
            Track your loan progress in real-time.
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {/* Progress Labels */}
          <div className="flex justify-between mb-4 text-sm">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex flex-col items-center">
                <span className={`mb-2 ${
                  stage.status === 'done' ? 'text-green-600' : 
                  stage.status === 'current' ? 'text-blue-600' : 
                  'text-gray-400'
                }`}>
                  {stage.status === 'done' ? '✓ Done' : 
                   stage.status === 'current' ? '● Next Step' : 
                   '○ Next Step'}
                </span>
                {index === stages.length - 1 && stage.status === 'pending' && (
                  <span className="text-gray-400">● Final Step</span>
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="relative mb-6">
            <div className="flex items-center">
              {stages.map((stage, index) => (
                <React.Fragment key={stage.id}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                    stage.status === 'done' ? 'bg-green-500' : 
                    stage.status === 'current' ? 'bg-blue-500' : 
                    'bg-gray-300'
                  }`}>
                    {stage.status === 'done' ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <div className={`w-3 h-3 rounded-full ${
                        stage.status === 'current' ? 'bg-white' : 'bg-gray-500'
                      }`} />
                    )}
                  </div>
                  {index < stages.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      index < 2 ? 'bg-green-500' : 
                      index === 2 ? 'bg-blue-500' : 
                      'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Stage Labels */}
          <div className="flex justify-between text-sm text-gray-600">
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
