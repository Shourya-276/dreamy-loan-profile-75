
import React from "react";
import ConnectorLayout from "../components/ConnectorLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToExcel } from "../utils/exportToExcel";

const ConnectorDashboard = () => {
  const performanceData = [
    { month: 'Jan', value: 80 },
    { month: 'Feb', value: 65 },
    { month: 'Mar', value: 45 },
    { month: 'Apr', value: 60 },
    { month: 'May', value: 85 },
    { month: 'Jun', value: 70 },
  ];

  const recentLeads = [
    { id: '#80', name: 'Priya Mehta', type: 'HL', bank: 'Sbi', converted: 'Yes' },
    { id: '#221', name: 'Rajesh Sharma', type: 'HL', bank: 'Hdfc', converted: 'No' },
    { id: '#140', name: 'Anil Gupta', type: 'HL', bank: 'kotak', converted: 'Yes' },
    { id: '#40', name: 'Rajesh Sharma', type: 'HL', bank: 'ICIC', converted: 'Pending' },
  ];

  const handleDownloadRecentLeads = () => {
    const exportData = recentLeads.map(lead => ({
      'Lead Number': lead.id,
      'Name': lead.name,
      'Loan Type': lead.type,
      'Bank Name': lead.bank,
      'Converted': lead.converted,
      'Date': new Date().toLocaleDateString('en-IN')
    }));

    exportToExcel(exportData, 'Connector_Recent_Leads_Export', 'Recent Leads');
  };

  return (
    <ConnectorLayout>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Performance Metrics */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Performance Metrics</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Month wise Overview</p>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Leads Received</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">150</p>
                <p className="text-sm text-green-600 dark:text-green-400">+20%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Leads Converted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">75</p>
                <p className="text-sm text-green-600 dark:text-green-400">+10%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Disbursement</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹50,000</p>
                <p className="text-sm text-green-600 dark:text-green-400">+15%</p>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-2 text-gray-900 dark:text-white">Monthly Performance</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Performance Metrics</p>
              
              <div className="h-64 bg-white dark:bg-gray-800 rounded-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgb(31 41 55)',
                        border: '1px solid rgb(75 85 99)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Bar dataKey="value" fill="#6366F1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Leads</h3>
              <Button
                onClick={handleDownloadRecentLeads}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Lead Number</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Name</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Loan type</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Bank Name</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Converted</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 text-sm text-gray-900 dark:text-white">{lead.id}</td>
                      <td className="py-3 text-sm text-gray-900 dark:text-white">{lead.name}</td>
                      <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{lead.type}</td>
                      <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{lead.bank}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          lead.converted === 'Yes' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                          lead.converted === 'No' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                          'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {lead.converted}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ConnectorLayout>
  );
};

export default ConnectorDashboard;
