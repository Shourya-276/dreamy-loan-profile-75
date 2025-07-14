
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Bank {
  id: number;
  bank_name: string;
  bank_code: string;
  is_active: boolean;
}

const AdminBankROIMaster = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedBank, setSelectedBank] = useState("");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch banks from database on component mount
  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/admin/bank-roi/banks`, {
        headers: {
          'x-user-role': 'admin'
        }
      });

      if (response.status === 200) {
        setBanks(response.data.banks || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch banks",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch banks from database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    const bank = banks.find(b => b.id.toString() === bankId);
    if (bank) {
      navigate(`/admin-bank-roi-config/${bankId}`, { 
        state: { bankName: bank.bank_name } 
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading banks...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin-masters")}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Masters</span>
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bank wise ROI</h1>
          <p className="text-gray-600 dark:text-gray-400">Select a bank to configure ROI rates</p>
        </div>

        {/* Bank Selection Card */}
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-lg">Select Bank</CardTitle>
          </CardHeader>
          <CardContent>
            {banks.length === 0 ? (
              <p className="text-gray-500">No banks available</p>
            ) : (
              <Select value={selectedBank} onValueChange={handleBankSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a bank..." />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {bank.bank_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>{bank.bank_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminBankROIMaster;
