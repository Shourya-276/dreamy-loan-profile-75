
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Trash2, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface ROIRange {
  id?: string;
  cibilMinValue: string;
  cibilMaxValue: string;
  minValue: string;
  maxValue: string;
  roiSalaried: string;
  roiNonSalaried: string;
  processingFee: string;
  notes: string;
}

interface Bank {
  id: number;
  bank_name: string;
  bank_code: string;
}

const AdminBankROIConfig = () => {
  const { bankId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const bankName = location.state?.bankName || "Unknown Bank";
  const { user } = useAuth();
  const [ranges, setRanges] = useState<ROIRange[]>([
    {
      id: "1",
      cibilMinValue: "",
      cibilMaxValue: "",
      minValue: "",
      maxValue: "",
      roiSalaried: "",
      roiNonSalaried: "",
      processingFee: "",
      notes: ""
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [bank, setBank] = useState<Bank | null>(null);

  // Get user ID from localStorage or context
  const getUserId = () => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.id;
    }
    return null;
  };

  // Fetch existing ROI configurations on component mount
  useEffect(() => {
    if (bankId) {
      fetchBankROIConfig();
    }
  }, [bankId]);

  const fetchBankROIConfig = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/admin/bank-roi/bank/${bankId}`, {
        headers: {
          'x-user-role': 'admin'
        }
      });

      if (response.status === 200) {
        const data = response.data;
        setBank(data.bank);
        
        if (data.configurations && data.configurations.length > 0) {
          // Map database configurations to component state
          const mappedRanges = data.configurations.map((config: any, index: number) => ({
            id: config.id?.toString() || (index + 1).toString(),
            cibilMinValue: config.cibil_min_score?.toString() || "",
            cibilMaxValue: config.cibil_max_score?.toString() || "",
            minValue: config.loan_amount_min?.toString() || "",
            maxValue: config.loan_amount_max?.toString() || "",
            roiSalaried: config.roi_salaried?.toString() || "",
            roiNonSalaried: config.roi_non_salaried?.toString() || "",
            processingFee: config.processing_fee?.toString() || "",
            notes: config.notes || ""
          }));
          setRanges(mappedRanges);
        }
      } else {
        const errorData = response.data;
        toast({
          title: "Error",
          description: errorData.error || "Failed to fetch ROI configurations",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching ROI config:", error);
      toast({
        title: "Error",
        description: "Failed to fetch ROI configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRange = () => {
    const newRange: ROIRange = {
      id: Date.now().toString(),
      cibilMinValue: "",
      cibilMaxValue: "",
      minValue: "",
      maxValue: "",
      roiSalaried: "",
      roiNonSalaried: "",
      processingFee: "",
      notes: ""
    };
    setRanges([...ranges, newRange]);
  };

  const deleteRange = (id: string) => {
    if (ranges.length > 1) {
      setRanges(ranges.filter(range => range.id !== id));
    }
  };

  const updateRange = (id: string, field: keyof ROIRange, value: string) => {
    setRanges(ranges.map(range => 
      range.id === id ? { ...range, [field]: value } : range
    ));
  };

  const validateRanges = () => {
    for (const range of ranges) {
      // Check required fields
      if (!range.cibilMinValue || !range.cibilMaxValue || !range.minValue || 
          !range.maxValue || !range.roiSalaried || !range.roiNonSalaried) {
        toast({
          title: "Validation Error",
          description: "All required fields must be filled",
          variant: "destructive",
        });
        return false;
      }

      // Validate CIBIL score range
      const cibilMin = parseInt(range.cibilMinValue);
      const cibilMax = parseInt(range.cibilMaxValue);
      if (cibilMin >= cibilMax) {
        toast({
          title: "Validation Error",
          description: "CIBIL min score must be less than max score",
          variant: "destructive",
        });
        return false;
      }

      // Validate loan amount range
      const loanMin = parseFloat(range.minValue);
      const loanMax = parseFloat(range.maxValue);
      if (loanMin >= loanMax) {
        toast({
          title: "Validation Error",
          description: "Loan amount min must be less than max",
          variant: "destructive",
        });
        return false;
      }

      // Validate CIBIL score range (300-900)
      if (cibilMin < 300 || cibilMax > 900) {
        toast({
          title: "Validation Error",
          description: "CIBIL score must be between 300 and 900",
          variant: "destructive",
        });
        return false;
      }

      // Validate ROI values
      const roiSalaried = parseFloat(range.roiSalaried);
      const roiNonSalaried = parseFloat(range.roiNonSalaried);
      if (roiSalaried < 0 || roiNonSalaried < 0) {
        toast({
          title: "Validation Error",
          description: "ROI values must be positive",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateRanges()) {
      return;
    }

    const userId = user?.id || "";
    if (!userId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setSaveLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/admin/bank-roi/bank/${bankId}`,
        {
          configurations: ranges,
          userId: userId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': 'admin'
          }
        }
      );

      if (response.status === 200) {
        const data = response.data;
        toast({
          title: "Success",
          description: data.message || "ROI configuration saved successfully!",
        });
        
        // Refresh the configurations
        await fetchBankROIConfig();
      } else {
        const errorData = response.data;
        toast({
          title: "Error",
          description: errorData.error || "Failed to save ROI configuration",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving ROI config:", error);
      toast({
        title: "Error",
        description: "Failed to save ROI configuration",
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleClear = () => {
    setRanges([{
      id: "1",
      cibilMinValue: "",
      cibilMaxValue: "",
      minValue: "",
      maxValue: "",
      roiSalaried: "",
      roiNonSalaried: "",
      processingFee: "",
      notes: ""
    }]);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading ROI configurations...</span>
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
            onClick={() => navigate("/admin-bank-roi-master")}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Bank Selection</span>
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ROI Master - {bank?.bank_name || bankName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Configure ROI rates and processing fees</p>
        </div>

        {/* ROI Ranges */}
        <div className="space-y-4">
          {ranges.map((range, index) => (
            <Card key={range.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Range {index + 1}</CardTitle>
                {ranges.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRange(range.id!)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* CIBIL Score Range - First Column */}
                  <div className="space-y-2">
                    <Label htmlFor={`cibil-${range.id}`}>CIBIL Score Range *</Label>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Label className="text-xs text-gray-500">From</Label>
                        <Input
                          id={`cibil-${range.id}`}
                          placeholder="e.g., 800"
                          type="number"
                          min="300"
                          max="900"
                          value={range.cibilMinValue}
                          onChange={(e) => updateRange(range.id!, 'cibilMinValue', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-gray-500">To</Label>
                        <Input
                          placeholder="e.g., 825"
                          type="number"
                          min="300"
                          max="900"
                          value={range.cibilMaxValue}
                          onChange={(e) => updateRange(range.id!, 'cibilMaxValue', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Loan Amount Range - Second Column */}
                  <div className="space-y-2">
                    <Label htmlFor={`min-${range.id}`}>Loan Amount Range (₹) *</Label>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Label className="text-xs text-gray-500">From</Label>
                        <Input
                          id={`min-${range.id}`}
                          placeholder="e.g., 1000000"
                          type="number"
                          min="0"
                          value={range.minValue}
                          onChange={(e) => updateRange(range.id!, 'minValue', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-gray-500">To</Label>
                        <Input
                          placeholder="e.g., 5000000"
                          type="number"
                          min="0"
                          value={range.maxValue}
                          onChange={(e) => updateRange(range.id!, 'maxValue', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* ROI (Salaried) - Third Column */}
                  <div className="space-y-2">
                    <Label>ROI (Salaried) % *</Label>
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500">Interest Rate</Label>
                      <Input
                        id={`roiSalaried-${range.id}`}
                        placeholder="e.g., 7.25"
                        type="number"
                        step="0.01"
                        min="0"
                        value={range.roiSalaried}
                        onChange={(e) => updateRange(range.id!, 'roiSalaried', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* ROI (Non-Salaried) - Fourth Column */}
                  <div className="space-y-2">
                    <Label>ROI (Non-Salaried) % *</Label>
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500">Interest Rate</Label>
                      <Input
                        id={`roiNonSalaried-${range.id}`}
                        placeholder="e.g., 7.75"
                        type="number"
                        step="0.01"
                        min="0"
                        value={range.roiNonSalaried}
                        onChange={(e) => updateRange(range.id!, 'roiNonSalaried', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor={`processing-fee-${range.id}`}>Processing Fee %</Label>
                    <Input
                      id={`processing-fee-${range.id}`}
                      placeholder="e.g., 0.5"
                      type="number"
                      step="0.01"
                      min="0"
                      value={range.processingFee}
                      onChange={(e) => updateRange(range.id!, 'processingFee', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`notes-${range.id}`}>Notes</Label>
                    <Input
                      id={`notes-${range.id}`}
                      placeholder="Additional notes..."
                      value={range.notes}
                      onChange={(e) => updateRange(range.id!, 'notes', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Range Button */}
        <Button
          onClick={addRange}
          className="flex items-center space-x-2"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          <span>Add Range</span>
        </Button>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button 
            onClick={handleSave} 
            className="flex-1 max-w-xs"
            disabled={saveLoading}
          >
            {saveLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
          <Button 
            onClick={handleClear} 
            variant="outline" 
            className="flex-1 max-w-xs"
            disabled={saveLoading}
          >
            Clear
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBankROIConfig;
