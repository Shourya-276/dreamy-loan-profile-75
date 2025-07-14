
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLoan } from "../../contexts/LoanContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Import shared option lists so this form matches IncomeDetailsForm exactly
import {
  employmentTypeOptions,
  employerTypeOptions,
  loanTypeOptions,
} from "@/utils/formOptions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const eligibilitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  alternateMobile: z.string().optional(),

  // Match IncomeDetailsForm: first choose employment type, then employer type for salaried
  employmentType: z.string().min(1, "Please select employment type"),
  employerType: z.string().optional(),

  grossSalary: z.string().optional(),
  netSalary: z.string().optional(),
  grossITRIncome: z.string().optional(),
  netITRIncome: z.string().optional(),
  rentIncome: z.string().optional(),
  annualBonus: z.string().optional(),
  monthlyIncentive: z.string().optional(),
  gstReturn: z.string().optional(),

  existingLoan: z.string().min(1, "Please select if you have existing loans"),
  existingLoans: z.array(z.object({
    type: z.string().min(1, "Loan type is required"),
    emiRate: z.string().min(1, "EMI amount is required"),
    outstandingAmount: z.string().min(1, "Outstanding amount is required"),
    balanceTenure: z.string().min(1, "Balance tenure is required"),
  })).optional(),
  salesExecutive: z.string().optional(),
  connectorName: z.string().optional(),
  dateOfBirth: z.date().optional(),
});

type EligibilityFormValues = z.infer<typeof eligibilitySchema>;

// Removed duplicated employerTypeOptions – now imported from utils

const SalesManagerEligibilityForm = () => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<EligibilityFormValues | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Sanction data states
  const [lfiSanctions, setLfiSanctions] = useState<any | null>(null);
  const [sanctionError, setSanctionError] = useState<string | null>(null);
  const [isLoadingSanction, setIsLoadingSanction] = useState(false);

  const form = useForm<EligibilityFormValues>({
    resolver: zodResolver(eligibilitySchema),
    defaultValues: {
      name: "",
      middleName: "",
      lastName: "",
      email: "",
      mobile: "",
      alternateMobile: "",
      employmentType: "",
      employerType: "",
      grossSalary: "",
      netSalary: "",
      grossITRIncome: "",
      netITRIncome: "",
      rentIncome: "",
      annualBonus: "",
      monthlyIncentive: "",
      gstReturn: "",
      existingLoan: "no",
      existingLoans: [],
      salesExecutive: "",
      connectorName: "",
      dateOfBirth: new Date(),
    },
  });

  const { user } = useAuth();

  // Watchers for conditional rendering
  const selectedEmploymentType = form.watch("employmentType");
  const selectedEmployerType = form.watch("employerType");
  const watchedExistingLoan = form.watch("existingLoan");

  // Automatically add a blank loan entry when user selects "yes" for existing loan
  useEffect(() => {
    if (watchedExistingLoan === "yes") {
      const currentLoans = form.getValues("existingLoans") || [];
      if (currentLoans.length === 0) {
        form.setValue("existingLoans", [
          { type: "", emiRate: "", outstandingAmount: "", balanceTenure: "" },
        ]);
      }
    } else if (watchedExistingLoan === "no") {
      form.setValue("existingLoans", []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedExistingLoan]);

  const addExistingLoan = () => {
    const currentLoans = form.getValues("existingLoans") || [];
    form.setValue("existingLoans", [
      ...currentLoans,
      { type: "", emiRate: "", outstandingAmount: "", balanceTenure: "" }
    ]);
  };

  const removeExistingLoan = (index: number) => {
    const currentLoans = form.getValues("existingLoans") || [];
    if (currentLoans.length <= 1) return; // Prevent removing the last loan entry
    form.setValue("existingLoans", currentLoans.filter((_, i) => i !== index));
  };

  const handlePreviewAndSave = (data: EligibilityFormValues) => {
    setPreviewData(data);
    setShowPreview(true);
  };

  const onSubmit = async (data: EligibilityFormValues) => {
    if (!user) {
      toast.error("You are not logged in");
      return;
    }

    try {
      console.log("data", data);
      const serverUrl = import.meta.env.VITE_SERVER_URL;
      const payload = {
        ...data,
        salesManagerId: user.id,
      };

      const response = await axios.post(`${serverUrl}/sales-manager/eligibility`, payload, {
        headers: {
          'x-user-role': 'salesmanager',
        },
      });
      console.log(response.data);
      

      // Success: proceed with redirection/animation
      setCustomerId(response.data.userId);
      toast.success("Eligibility details saved successfully");

      // Close preview and show congratulations UI
      setShowPreview(false);
      setShowCongrats(true);
      setTimeout(() => {
        setShowConfetti(true);
        setShowSuccessAnimation(true);
      }, 500);

    } catch (error: any) {
      console.error("Error saving eligibility:", error);
      toast.error("Failed to save eligibility details");
      // Keep the preview dialog open for corrections; do not redirect
    }
  };

  // Fetch LFI sanctions once we have a customerId and congrats screen is showing
  useEffect(() => {
    if (!customerId || !showCongrats) return;

    const fetchLFISanctions = async () => {
      try {
        setIsLoadingSanction(true);
        const serverUrl = import.meta.env.VITE_SERVER_URL;

        // 1. Try to get existing sanctions
        let sanctionsResp = await axios.get(`${serverUrl}/loan-offers/lfi-sanctions/${customerId}`);
        if (
          sanctionsResp.data?.sanctions?.length === 0 ||
          sanctionsResp.data?.message === "No active LFI sanctions found"
        ) {
          // 2. If none found, trigger calculation endpoint
          await axios.get(`${serverUrl}/loan-offers/${customerId}`, {
            headers: {
              'x-user-role': 'salesmanager',
            },
          });
          // 3. Fetch again
          sanctionsResp = await axios.get(`${serverUrl}/loan-offers/lfi-sanctions/${customerId}`);
        }

        console.log(sanctionsResp.data);
        setLfiSanctions(sanctionsResp.data);
        setSanctionError(null);
      } catch (err) {
        console.error("Error fetching LFI sanctions:", err);
        setSanctionError("Failed to load loan eligibility data");
        // fallback display
        setLfiSanctions({ amountRangeFormatted: "₹50,00,000 - ₹90,00,000", maxAmountFormatted: "₹90,00,000", sanctions: [], count: 0 });
      } finally {
        setIsLoadingSanction(false);
      }
    };

    fetchLFISanctions();
  }, [customerId, showCongrats]);

  const handleClear = () => {
    form.reset();
  };

  const handleBackToForm = () => {
    setShowCongrats(false);
    setShowConfetti(false);
    setShowSuccessAnimation(false);
    form.reset();
  };

  const handleExploreOffers = () => {
    // Navigate to loan offers or similar page
    window.location.href = "/sales-manager-loan-offers";
  };

  const handleDownloadLetter = async () => {
    if (!customerId) {
      toast.error("Customer ID not found. Please try again.");
      return;
    }

    try {
      setIsDownloading(true);
      toast.info("Generating sanction letter...");
      
      // Download PDF directly from backend
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/loan-offers/lfi-sanction-letter/${customerId}`,
        {
          responseType: 'blob', // Important for binary data
        }
      );
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'LFI_Sanction_Letter.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Sanction letter downloaded successfully!");
      
    } catch (error) {
      console.error("Error downloading sanction letter:", error);
      if (error.response?.status === 404) {
        toast.error("No active loan sanction found. Please complete the loan application first.");
      } else {
        toast.error("Failed to download sanction letter. Please try again later.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDisplayValue = (value: any) => {
    if (!value) return "Not provided";
    return value;
  };

  // Generate enhanced confetti elements with better animation
  const generateConfetti = () => {
    const confettiElements = [];
    const colors = ["#FF9A3C", "#4F4799", "#2AAB5B", "#FF6B6B", "#46B3E6", "#FFD700", "#FF69B4", "#00CED1"];
    
    for (let i = 0; i < 80; i++) {
      const left = Math.random() * 100;
      const animationDelay = Math.random() * 2;
      const animationDuration = Math.random() * 2 + 3;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 6;
      const rotation = Math.random() * 360;
      
      confettiElements.push(
        <div
          key={i}
          className="absolute rounded-sm animate-pulse"
          style={{
            left: `${left}%`,
            top: `-30px`,
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color,
            transform: `rotate(${rotation}deg)`,
            animation: `confettiFall ${animationDuration}s ease-out ${animationDelay}s forwards, rotate ${animationDuration}s linear ${animationDelay}s infinite`,
            opacity: showConfetti ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
        />
      );
    }
    
    return confettiElements;
  };

  const renderPreviewContent = () => {
    if (!previewData) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Personal Details */}
          <div className="md:col-span-2"><h4 className="font-semibold text-base mb-2">Personal Details</h4></div>
          <div><strong>Name:</strong> {formatDisplayValue(previewData.name)}</div>
          <div><strong>Middle Name:</strong> {formatDisplayValue(previewData.middleName)}</div>
          <div><strong>Last Name:</strong> {formatDisplayValue(previewData.lastName)}</div>
          <div><strong>Email:</strong> {formatDisplayValue(previewData.email)}</div>
          <div><strong>Mobile:</strong> {formatDisplayValue(previewData.mobile)}</div>
          <div><strong>Alternate Mobile:</strong> {formatDisplayValue(previewData.alternateMobile)}</div>
          
          {/* Income Details */}
          <div className="md:col-span-2"><h4 className="font-semibold text-base mb-2 mt-4">Income Details</h4></div>
          <div><strong>Employment Type:</strong> {formatDisplayValue(previewData.employmentType)}</div>
          {previewData.employmentType === "salaried" && (
            <>
              <div><strong>Employer Type:</strong> {formatDisplayValue(previewData.employerType)}</div>
              <div><strong>Gross Salary:</strong> ₹{formatDisplayValue(previewData.grossSalary)}</div>
              <div><strong>Net Salary:</strong> ₹{formatDisplayValue(previewData.netSalary)}</div>
              <div><strong>Rent Income:</strong> ₹{formatDisplayValue(previewData.rentIncome)}</div>
              <div><strong>Annual Bonus:</strong> ₹{formatDisplayValue(previewData.annualBonus)}</div>
              <div><strong>Monthly Incentive:</strong> ₹{formatDisplayValue(previewData.monthlyIncentive)}</div>
            </>
          )}
          {previewData.employmentType === "self-employed" && (
            <>
              <div><strong>Gross ITR Income:</strong> ₹{formatDisplayValue(previewData.grossITRIncome)}</div>
              <div><strong>Net ITR Income:</strong> ₹{formatDisplayValue(previewData.netITRIncome)}</div>
              <div><strong>Rent Income:</strong> ₹{formatDisplayValue(previewData.rentIncome)}</div>
              <div><strong>GST Return:</strong> {formatDisplayValue(previewData.gstReturn)}</div>
            </>
          )}
          <div><strong>Existing Loan:</strong> {formatDisplayValue(previewData.existingLoan)}</div>

          {previewData.existingLoan === "yes" && previewData.existingLoans && previewData.existingLoans.length > 0 && (
            <>
              <div className="md:col-span-2"><h4 className="font-medium mb-2">Existing Loans:</h4></div>
              {previewData.existingLoans.map((loan, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded mb-2 md:col-span-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Type:</strong> {loan.type}</div>
                    <div><strong>EMI Rate:</strong> ₹{loan.emiRate}</div>
                    <div><strong>Outstanding:</strong> ₹{loan.outstandingAmount}</div>
                    <div><strong>Balance Tenure:</strong> {loan.balanceTenure} months</div>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {/* Names */}
          <div className="md:col-span-2"><h4 className="font-semibold text-base mb-2 mt-4">Names</h4></div>
          <div><strong>Sales Executive:</strong> {formatDisplayValue(previewData.salesExecutive)}</div>
          <div><strong>Connector Name:</strong> {formatDisplayValue(previewData.connectorName)}</div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
            ⚠️ Important: You cannot change this information again once saved. Please verify all details carefully.
          </p>
        </div>
      </div>
    );
  };

  if (showCongrats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <style>{`
          @keyframes confettiFall {
            0% {
              transform: translateY(-30px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
          
          @keyframes successPulse {
            0% {
              transform: scale(1);
              filter: brightness(1);
            }
            50% {
              transform: scale(1.05);
              filter: brightness(1.1);
            }
            100% {
              transform: scale(1);
              filter: brightness(1);
            }
          }
          
          @keyframes celebrationGlow {
            0% {
              box-shadow: 0 0 20px rgba(79, 71, 153, 0.3);
            }
            50% {
              box-shadow: 0 0 40px rgba(79, 71, 153, 0.6);
            }
            100% {
              box-shadow: 0 0 20px rgba(79, 71, 153, 0.3);
            }
          }
          
          .success-card {
            animation: ${showSuccessAnimation ? 'successPulse 2s ease-in-out, celebrationGlow 3s ease-in-out infinite' : 'none'};
          }
          
          .celebration-text {
            background: linear-gradient(45deg, #4F4799, #FF9A3C, #2AAB5B);
            background-size: 300% 300%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: ${showSuccessAnimation ? 'gradientShift 3s ease-in-out infinite' : 'none'};
          }
          
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center overflow-hidden success-card">
          {/* Enhanced Confetti effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {generateConfetti()}
            </div>
          )}
          
          {/* Success Badge Animation */}
          {showSuccessAnimation && (
            <div className="absolute top-4 right-4 flex items-center justify-center w-16 h-16 bg-green-500 rounded-full animate-bounce">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          <h1 className="text-4xl font-bold mb-4 celebration-text">🎉 Congratulations! 🎉</h1>
          <p className="text-2xl mb-8 text-green-600 dark:text-green-400 font-semibold animate-pulse">Customer is eligible for a loan</p>
          
          <div className="mb-8 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg p-6 bg-green-50 dark:bg-green-900/20">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-3">🏆 Customer can avail a loan between</p>
            {isLoadingSanction ? (
              <p className="text-4xl font-bold text-brand-purple animate-pulse">Loading...</p>
            ) : (
              <p className="text-4xl font-bold text-brand-purple animate-pulse">{lfiSanctions?.amountRangeFormatted || "₹50 Lakh - ₹90 Lakh"}</p>
            )}
          </div>

          {sanctionError && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">⚠️ {sanctionError}</p>
            </div>
          )}

          <p className="mb-8 text-gray-600 dark:text-gray-400 text-lg">Based on customer profile. Eligibility check complete!</p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button 
              onClick={handleExploreOffers}
              className="bg-brand-purple hover:bg-brand-purple/90 text-lg py-6 px-8 rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ✨ Explore Loan Offers ✨
            </Button>
            <Button 
              onClick={handleDownloadLetter} 
              variant="outline" 
              disabled={isDownloading}
              className="text-lg py-6 px-8 rounded-lg border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  📄 Download Sanction Letter
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-6">
            <Button 
              onClick={handleBackToForm}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Back to Form
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Eligibility Form</h2>
      <h3 className="text-lg font-medium mb-4">Personal Details*</h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handlePreviewAndSave)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Existing form fields */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Name*" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Middle Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address*</FormLabel>
                  <FormControl>
                    <Input placeholder="Email Address*" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number*</FormLabel>
                  <FormControl>
                    <Input placeholder="Mobile Number*" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of Birth field */}
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => {
                const [isCalendarOpen, setIsCalendarOpen] = useState(false);
                
                const handleDateSelect = (date: Date | undefined) => {
                  field.onChange(date);
                  setIsCalendarOpen(false);
                };

                return (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-black border-gray-700" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={handleDateSelect}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          defaultMonth={field.value ? new Date(field.value) : undefined}
                          initialFocus
                          className={cn("p-3 pointer-events-auto bg-black text-white border-gray-700")}
                          captionLayout="dropdown-buttons"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Alternate Mobile Number field */}
            <FormField
              control={form.control}
              name="alternateMobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alternate Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Alternate Mobile Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Income Details Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Income Details*</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employment Type */}
              <FormField
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Employment Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employmentTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Employer Type - only for salaried */}
              {selectedEmploymentType === "salaried" && (
                <FormField
                  control={form.control}
                  name="employerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Employer Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employerTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Salaried Fields */}
              {selectedEmploymentType === "salaried" && (
                <>
                  <FormField
                    control={form.control}
                    name="grossSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Gross Salary (₹)</FormLabel>
                        <FormControl>
                          <Input placeholder="Monthly Gross Salary" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="netSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Net Salary (₹)</FormLabel>
                        <FormControl>
                          <Input placeholder="Monthly Net Salary" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rentIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rent Income (₹) – Optional</FormLabel>
                        <FormControl>
                          <Input placeholder="Rent Income" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="annualBonus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Bonus (₹) – Optional</FormLabel>
                        <FormControl>
                          <Input placeholder="Annual Bonus" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyIncentive"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Incentive (₹) – Optional</FormLabel>
                        <FormControl>
                          <Input placeholder="Monthly Incentive" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Self-Employed Fields */}
              {selectedEmploymentType === "self-employed" && (
                <>
                  <FormField
                    control={form.control}
                    name="grossITRIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gross ITR Income (₹)</FormLabel>
                        <FormControl>
                          <Input placeholder="Gross ITR Income" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="netITRIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Net ITR Income (₹)</FormLabel>
                        <FormControl>
                          <Input placeholder="Net ITR Income" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rentIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rent Income (₹) – Optional</FormLabel>
                        <FormControl>
                          <Input placeholder="Rent Income" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gstReturn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GST Return – Optional</FormLabel>
                        <FormControl>
                          <Input placeholder="GST Return" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Existing Loan Select (placed on new line) */}
            </div> {/* close grid */}

            <div className="space-y-4 mt-6">
              <FormField
                control={form.control}
                name="existingLoan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do you have any existing loans?</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedExistingLoan === "yes" && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Existing Loans</CardTitle>
                    <Button type="button" onClick={addExistingLoan} variant="outline" size="sm">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Loan
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(form.watch("existingLoans") || []).map((_, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Loan {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExistingLoan(index)}
                            disabled={(form.watch("existingLoans") || []).length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`existingLoans.${index}.type` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Loan Type</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Loan Type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {loanTypeOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`existingLoans.${index}.emiRate` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>EMI Amount (₹)</FormLabel>
                                <FormControl>
                                  <Input placeholder="EMI Amount" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`existingLoans.${index}.outstandingAmount` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Outstanding Amount (₹)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Outstanding Amount" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`existingLoans.${index}.balanceTenure` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Balance Tenure (Months)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Balance Tenure" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Names Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Names</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="salesExecutive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Executive</FormLabel>
                    <FormControl>
                      <Input placeholder="Sales Executive" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="connectorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connector Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Connector Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button type="button" variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button type="submit" className="bg-brand-purple hover:bg-brand-purple/90">
              Preview & Check Eligibility
            </Button>
          </div>
        </form>
      </Form>

      {/* Preview and Confirmation Dialog */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Preview Eligibility Details</AlertDialogTitle>
            <AlertDialogDescription>
              Please review the customer information carefully. You cannot change this information again once saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {renderPreviewContent()}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back & Edit</AlertDialogCancel>
            <AlertDialogAction onClick={() => previewData && onSubmit(previewData)}>
              Confirm & Check Eligibility
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SalesManagerEligibilityForm;
