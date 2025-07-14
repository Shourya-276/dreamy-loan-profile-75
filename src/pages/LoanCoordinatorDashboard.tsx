
import React from "react";
import { useNavigate } from "react-router-dom";
import LoanCoordinatorLayout from "../components/LoanCoordinatorLayout";

const LoanCoordinatorDashboard = () => {
  const navigate = useNavigate();
  const stats = [
    {
      title: "No. of Sanctions Pending",
      value: "25",
      icon: "⏳",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600"
    },
    {
      title: "No. of Sanctions Received",
      value: "78",
      icon: "📨",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "No. of First Disbursement Pending",
      value: "12",
      icon: "💼",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      title: "No. of First Disbursed Cases",
      value: "45",
      icon: "✅",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "No. of Part Disbursement Pending",
      value: "8",
      icon: "⏰",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "No. of Part Disbursed Cases",
      value: "32",
      icon: "🎯",
      bgColor: "bg-red-50",
      textColor: "text-red-600"
    }
  ];

  const ongoingTasks = [
    {
      name: "Rajesh Sharma",
      bankName: "HDFC Bank",
      contact: "9876543210",
      loanType: "Home Loan"
    },
    {
      name: "Priya Mehta",
      bankName: "SBI",
      contact: "8765432109",
      loanType: "Home Loan"
    },
    {
      name: "Anil Gupta",
      bankName: "ICICI Bank",
      contact: "7654321098",
      loanType: "Home Loan"
    },
    {
      name: "Neha Verma",
      bankName: "HDFC Bank",
      contact: "6543210987",
      loanType: "Home Loan"
    },
    {
      name: "Amit Singh",
      bankName: "SBI",
      contact: "9123456789",
      loanType: "Home Loan"
    }
  ];

  return (
    <LoanCoordinatorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Loan Coordinator Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage loan processing and coordination</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} border border-gray-200 dark:border-gray-700 rounded-lg p-6 relative`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className="text-2xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Ongoing Task Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Ongoing Task</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lead Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Bank Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Contact</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Loan Type</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {ongoingTasks.map((task, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => navigate(`/loan-coordinator-bank-sanctions?leadName=${encodeURIComponent(task.name)}`)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer"
                      >
                        {task.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{task.bankName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{task.contact}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{task.loanType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LoanCoordinatorLayout>
  );
};

export default LoanCoordinatorDashboard;
