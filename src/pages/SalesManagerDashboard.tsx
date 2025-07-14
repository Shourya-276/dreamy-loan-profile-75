import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { BarChart2, CheckSquare, Users, FileText, Target, DollarSign, Banknote, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

interface DashboardMetrics {
  totalLeads: number;
  lfiSanctions: string;
  bankSanctions: number;
  totalDisbursement: string;
  targetAchievement: string;
  disbursementCases: number;
}

interface RecentLead {
  id: string;
  name: string;
  status: string;
  contact: string;
  loanType: string;
}

const SalesManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const salesManagerId = Number(user?.id) || 1;

  const fetchDashboardMetrics = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/sales-manager/dashboard/metrics/${salesManagerId}`, {
        headers: {
          'x-user-role': 'salesmanager'
        }
      });
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError('Failed to load dashboard metrics');
      toast.error('Failed to load dashboard metrics');
      
      setDashboardData({
        totalLeads: 120,
        lfiSanctions: "₹50,00,000",
        bankSanctions: 20,
        totalDisbursement: "₹35,00,000",
        targetAchievement: "70% Complete",
        disbursementCases: 15
      });
    }
  };

  const fetchRecentLeads = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/sales-manager/dashboard/recent-leads/${salesManagerId}?limit=6`, {
        headers: {
          'x-user-role': 'salesmanager'
        }
      });
      setRecentLeads(response.data);
    } catch (err) {
      console.error('Error fetching recent leads:', err);
      setError('Failed to load recent leads');
      toast.error('Failed to load recent leads');
      
      setRecentLeads([
        { id: "123", name: "Rajesh Sharma", status: "Status Eligibility Checked", contact: "9876543210", loanType: "Home Loan" },
        { id: "124", name: "Priya Mehta", status: "LFI Sanction", contact: "8765432109", loanType: "Personal Loan" },
        { id: "125", name: "Anil Gupta", status: "Data Pending", contact: "7654321098", loanType: "Business Loan" },
        { id: "126", name: "Neha Verma", status: "Status Eligibility Checked", contact: "6543210987", loanType: "Home Loan" }
      ]);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchDashboardMetrics(),
          fetchRecentLeads()
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [salesManagerId]);

  const getDashboardMetrics = () => {
    if (!dashboardData) return [];

    return [
      {
        label: "Total Leads",
        value: dashboardData.totalLeads.toString(),
        icon: <Users className="w-6 h-6 text-blue-500" />,
        bg: "bg-blue-50",
        textColor: "text-blue-700 font-bold",
        border: "border-blue-200"
      },
      {
        label: "Total LFI Sanctions",
        value: dashboardData.lfiSanctions,
        icon: <CheckSquare className="w-6 h-6 text-green-500" />,
        bg: "bg-green-50",
        textColor: "text-green-700 font-bold",
        border: "border-green-200"
      },
      {
        label: "Total No. of Bank Sanctions",
        value: dashboardData.bankSanctions.toString(),
        icon: <Banknote className="w-6 h-6 text-indigo-500" />,
        bg: "bg-indigo-50",
        textColor: "text-indigo-700 font-bold",
        border: "border-indigo-200"
      },
      {
        label: "Total Disbursement",
        value: dashboardData.totalDisbursement,
        icon: <DollarSign className="w-6 h-6 text-yellow-500" />,
        bg: "bg-yellow-50",
        textColor: "text-yellow-700 font-bold",
        border: "border-yellow-200"
      },
      {
        label: "Target vs Achievement",
        value: dashboardData.targetAchievement,
        icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
        bg: "bg-orange-50",
        textColor: "text-orange-700 font-bold",
        border: "border-orange-200"
      },
      {
        label: "No. of Disbursement Cases",
        value: dashboardData.disbursementCases.toString(),
        icon: <FileText className="w-6 h-6 text-purple-500" />,
        bg: "bg-purple-50",
        textColor: "text-purple-700 font-bold",
        border: "border-purple-200"
      }
    ];
  };

  const handleRefresh = () => {
    fetchDashboardMetrics();
    fetchRecentLeads();
    toast.success('Dashboard refreshed');
  };

  const handleLeadNameClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Sales Manager Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Sales Manager Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name || 'Sales Manager'}</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            Refresh Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getDashboardMetrics().map((metric, index) => (
            <div
              key={index}
              className={`${metric.bg} ${metric.border} border rounded-lg p-6 flex flex-col space-y-2`}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{metric.label}</span>
                {metric.icon}
              </div>
              <span className={`text-2xl ${metric.textColor}`}>{metric.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Leads</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loan Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleLeadNameClick(lead.id)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {lead.name}
                      </button>
                    </td>
                    <td className="px-6 py-4">{lead.status}</td>
                    <td className="px-6 py-4">{lead.contact}</td>
                    <td className="px-6 py-4">{lead.loanType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SalesManagerDashboard;
