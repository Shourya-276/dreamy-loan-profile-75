
/**
 * REFERRAL PAYOUT SUMMARY COMPONENT
 * 
 * This component displays the payout summary table with lead information
 * and corresponding loan amounts exactly as shown in the reference image.
 * 
 * USAGE:
 * - Used within ReferralDashboard.tsx when payout tab is active
 * - Shows financial summary of processed leads
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToExcel } from "../../utils/exportToExcel";

const ReferralPayoutSummary = () => {
  const payoutData = [
    { leadNumber: "#1", name: "Priya Mehta", loanType: "HL", loanAmount: "₹3,00,000", commissionAmount: "₹500", status: "Paid" },
    { leadNumber: "#2", name: "Rajesh Sharma", loanType: "HL", loanAmount: "₹2,00,000", commissionAmount: "₹750", status: "Pending" },
    { leadNumber: "#3", name: "Anil Gupta", loanType: "HL", loanAmount: "₹7,00,000", commissionAmount: "₹1,200", status: "Paid" },
    { leadNumber: "#4", name: "Rajesh Sharma", loanType: "HL", loanAmount: "₹8,00,000", commissionAmount: "₹900", status: "Pending" },
    { leadNumber: "#5", name: "Priya Mehta", loanType: "HL", loanAmount: "₹10,00,000", commissionAmount: "₹650", status: "Paid" },
    { leadNumber: "#6", name: "Priya Mehta", loanType: "HL", loanAmount: "₹22,00,000", commissionAmount: "₹1,100", status: "Paid" },
    { leadNumber: "#7", name: "Neha Verma", loanType: "HL", loanAmount: "₹5,00,000", commissionAmount: "₹800", status: "Pending" },
    { leadNumber: "#8", name: "Priya Mehta", loanType: "HL", loanAmount: "₹5,00,000", commissionAmount: "₹600", status: "Paid" },
    { leadNumber: "#9", name: "Anil Gupta", loanType: "HL", loanAmount: "₹5,00,000", commissionAmount: "₹700", status: "Paid" },
  ];

  const handleDownloadPayoutSummary = () => {
    const exportData = payoutData.map(item => ({
      'Lead Number': item.leadNumber,
      'Referral Name': item.name,
      'Loan Type': item.loanType,
      'Loan Amount': item.loanAmount,
      'Commission Amount': item.commissionAmount,
      'Status': item.status,
      'Date': new Date().toLocaleDateString('en-IN')
    }));

    exportToExcel(exportData, 'Payout_Summary_Export', 'Payout Summary');
  };

  return (
    <div className="max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Payout Summary</CardTitle>
            <Button
              onClick={handleDownloadPayoutSummary}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download in Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Lead Number</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Loan type</th>
                  <th className="text-left py-3 px-4">Loan Amount</th>
                  <th className="text-left py-3 px-4">Commission Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {payoutData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{item.leadNumber}</td>
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="py-3 px-4">{item.loanType}</td>
                    <td className="py-3 px-4 font-medium">{item.loanAmount}</td>
                    <td className="py-3 px-4 font-medium">{item.commissionAmount}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.status === 'Paid' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralPayoutSummary;
