
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import DisbursementModal from "./DisbursementModal";

const NewDisbursementTab = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Disbursement Summary */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h2 className="text-xl font-semibold mb-4">Loan Disbursement Details</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Bank Name</p>
              <p className="font-semibold">HDFC Bank</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Loan Type</p>
              <p className="font-semibold">Home Loan</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Loan Amount Sanctioned</p>
              <p className="font-semibold">₹10,50,000</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Disbursement Amount Released</p>
              <p className="font-semibold">₹0</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Remaining Amount</p>
              <p className="font-semibold">₹10,50,000</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Request New Disbursement Button */}
      <div className="flex justify-center">
        <Button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2"
        >
          Request New Disbursement
        </Button>
      </div>
      
      {/* Disbursement History */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Disbursement History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Amt.</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Recipient Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">15-Mar-2025</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">₹2,00,000</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">Amit Verma</td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    In process
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <DisbursementModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title="Request Amount"
      />
    </div>
  );
};

export default NewDisbursementTab;
