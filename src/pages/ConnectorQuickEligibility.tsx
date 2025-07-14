
import React from "react";
import ConnectorLayout from "../components/ConnectorLayout";
import ConnectorEligibilityForm from "../components/forms/ConnectorEligibilityForm";

const ConnectorQuickEligibility = () => {
  return (
    <ConnectorLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              ← Back
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Check Customer Eligibility</h1>
        </div>
        
        <ConnectorEligibilityForm />
      </div>
    </ConnectorLayout>
  );
};

export default ConnectorQuickEligibility;
