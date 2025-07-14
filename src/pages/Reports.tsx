
import React, { useState } from "react";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("monthly");

  const bankWiseData = [
    { bankName: "Bank A", sanctions: "₹50 Cr", disbursements: "₹32 Cr", achieved: "80%" },
    { bankName: "Bank B", sanctions: "₹210 Cr", disbursements: "₹67 Cr", achieved: "43%" },
    { bankName: "Bank C", sanctions: "₹20 Cr", disbursements: "₹23 Cr", achieved: "20%" },
    { bankName: "Bank A", sanctions: "₹50 Cr", disbursements: "₹32 Cr", achieved: "80%" },
    { bankName: "Bank B", sanctions: "₹210 Cr", disbursements: "₹67 Cr", achieved: "43%" },
    { bankName: "Bank C", sanctions: "₹20 Cr", disbursements: "₹23 Cr", achieved: "20%" }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Loan Performance Reports</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => setActiveTab("monthly")}
              variant={activeTab === "monthly" ? "default" : "outline"}
            >
              Monthly
            </Button>
            <Button
              onClick={() => setActiveTab("quarterly")}
              variant={activeTab === "quarterly" ? "default" : "outline"}
            >
              Quarterly
            </Button>
            <Button
              onClick={() => setActiveTab("yearly")}
              variant={activeTab === "yearly" ? "default" : "outline"}
            >
              Yearly
            </Button>
            <div className="ml-auto">
              <Button variant="outline">
                <span className="mr-2">🔍</span> Filter
              </Button>
            </div>
          </div>

          {/* Reporting Period */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Reporting Period:</span> 15 Mar - 15 Apr 2025
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Sanctions</p>
              <p className="text-2xl font-bold">₹12.08 Cr</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Disbursements</p>
              <p className="text-2xl font-bold">₹102.12 Cr</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Sanctions</p>
              <p className="text-2xl font-bold">102</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Leads</p>
              <p className="text-2xl font-bold">130</p>
            </div>
          </div>

          {/* Achievement vs Target and Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Achievement vs Target</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      className="text-gray-300"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-green-500"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="80, 100"
                      strokeLinecap="round"
                      fill="transparent"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">80%</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Achievement: ₹45,00,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm">Target: ₹50,00,000</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Feedback & Reviews</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Rating</p>
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      ⭐⭐⭐⭐⭐
                    </div>
                    <span className="text-2xl font-bold">3.2</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Videos Recorded</p>
                    <p className="text-xl font-bold">92</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Google Reviews</p>
                    <p className="text-xl font-bold">92</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">View All Reviews</Button>
              </div>
            </div>
          </div>

          {/* Bank-Wise Report */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Bank-Wise Sanction & Disbursement Report</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Bank Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Sanctions (₹ Cr)</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Disbursements (₹ Cr)</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">% Achieved</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {bankWiseData.map((bank, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{bank.bankName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{bank.sanctions}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{bank.disbursements}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{bank.achieved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline">Show More</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
