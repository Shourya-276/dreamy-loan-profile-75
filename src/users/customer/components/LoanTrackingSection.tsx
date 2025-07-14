
import React from "react";
import { CheckCircle, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const LoanTrackingSection = () => {
  const stages = [
    { id: 1, name: "Stage1", status: "done" },
    { id: 2, name: "Stage2", status: "processing" },
    { id: 3, name: "Stage3", status: "next" },
    { id: 4, name: "Stage4", status: "next" },
    { id: 5, name: "Stage5", status: "next" },
    { id: 6, name: "Stage6", status: "final" },
  ];

  const getStatusButton = (status: string, name: string) => {
    switch (status) {
      case "done":
        return (
          <Button 
            size="sm" 
            className="bg-green-100 hover:bg-green-200 text-green-800 border border-green-300"
            variant="outline"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Done
          </Button>
        );
      case "processing":
        return (
          <Button 
            size="sm" 
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300"
            variant="outline"
          >
            <Clock className="w-4 h-4 mr-1" />
            Processing...
          </Button>
        );
      case "next":
        return (
          <Button 
            size="sm" 
            className="bg-green-100 hover:bg-green-200 text-green-800 border border-green-300"
            variant="outline"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Next Step
          </Button>
        );
      case "final":
        return (
          <Button 
            size="sm" 
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300"
            variant="outline"
          >
            <ArrowRight className="w-4 h-4 mr-1" />
            Final Step
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-2">Track Your Loan – Step by Step</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Track your loan progress in real-time.</p>
      
      <div className="space-y-6">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-4 h-4 rounded-full ${
                  stage.status === "done" 
                    ? "bg-brand-purple" 
                    : stage.status === "processing"
                    ? "bg-brand-purple"
                    : "bg-gray-300 dark:bg-gray-600"
                }`} />
                {index < stages.length - 1 && (
                  <div className="absolute top-4 left-2 w-px h-8 bg-gray-300 dark:bg-gray-600 -translate-x-1/2" />
                )}
              </div>
              <span className="font-medium">{stage.name}</span>
            </div>
            {getStatusButton(stage.status, stage.name)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoanTrackingSection;
