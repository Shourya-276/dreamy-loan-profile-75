import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoan} from "../../contexts/LoanContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Import types from LoanContext
import type { EmployedIncomeDetails, IncomeDetails, SelfEmployedIncomeDetails } from "../../contexts/LoanContext";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { employmentTypeOptions, employerTypeOptions, loanTypeOptions } from "@/utils/formOptions";
// Updated employment type options - removed "professional"
// const employmentTypeOptions = [
//   { value: "salaried", label: "Salaried" },
//   { value: "self-employed", label: "Self-Employed" },
//   { value: "retired", label: "Retired" },
//   { value: "housewife", label: "Housewife" },
//   { value: "student", label: "Student" },
// ];

// const loanTypeOptions = [
//   { value: "home-loan", label: "Home Loan" },
//   { value: "personal-loan", label: "Personal Loan" },
//   { value: "car-loan", label: "Car Loan" },
//   { value: "education-loan", label: "Education Loan" },
//   { value: "business-loan", label: "Business Loan" },
// ];

// Unified schema that handles all employment types with conditional validation
const unifiedIncomeSchema = z.object({
  employmentType: z.string().min(1, "Please select employment type"),
  // Salaried fields (conditional)
  employerType: z.string().optional(),
  grossSalary: z.string().optional(),
  netSalary: z.string().optional(),
  // Self-employed fields (conditional)
  grossITRIncome: z.string().optional(),
  netITRIncome: z.string().optional(),
  // Common optional fields
  rentIncome: z.string().optional(),
  annualBonus: z.string().optional(),
  monthlyIncentive: z.string().optional(),
  pension: z.string().optional(),
  gstReturn: z.string().optional(),
  // Existing loan fields
  existingLoan: z.string().min(1, "Please select if you have existing loans"),
  existingLoans: z.array(z.object({
    type: z.string().min(1, "Loan type is required"),
    emiRate: z.string().min(1, "EMI rate is required"),
    outstandingAmount: z.string().min(1, "Outstanding amount is required"),
    balanceTenure: z.string().min(1, "Balance tenure is required"),
  })).optional(),
}).superRefine((data, ctx) => {
  // Conditional validation for salaried employees
  if (data.employmentType === "salaried") {
    if (!data.employerType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select employer type",
        path: ["employerType"],
      });
    }
    if (!data.grossSalary) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Gross salary is required",
        path: ["grossSalary"],
      });
    }
    if (!data.netSalary) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Net salary is required",
        path: ["netSalary"],
      });
    }
  }
  
  // Conditional validation for self-employed
  if (data.employmentType === "self-employed") {
    if (!data.grossITRIncome) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Gross ITR income is required",
        path: ["grossITRIncome"],
      });
    }
    if (!data.netITRIncome) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Net ITR income is required",
        path: ["netITRIncome"],
      });
    }
  }
  
  // Existing loan validation
  if (data.existingLoan === "yes") {
    if (!data.existingLoans || data.existingLoans.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please add at least one existing loan or select 'No'",
        path: ["existingLoans"],
      });
    } else {
      const hasValidLoan = data.existingLoans.some(loan => 
        loan.type && loan.emiRate && loan.outstandingAmount && loan.balanceTenure
      );
      if (!hasValidLoan) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please fill in all fields for at least one loan or select 'No'",
          path: ["existingLoans"],
        });
      }
    }
  }
});

type IncomeFormValues = z.infer<typeof unifiedIncomeSchema>;

const IncomeDetailsForm = ({ prefillData }: { prefillData: any }) => {
  const { user } = useAuth();
  const { application, saveIncomeDetails, clearCurrentStep, goToPreviousStep } = useLoan();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employmentType, setEmploymentType] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<IncomeFormValues | null>(null);
  let customerId = null;
  
  if (prefillData) {
    customerId = prefillData.userId;
  }

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(unifiedIncomeSchema),
    defaultValues: {
      employmentType: application.incomeDetails?.employmentType || "",
      existingLoan: "no",
      existingLoans: [],
      employerType: "",
      grossSalary: "",
      netSalary: "",
      grossITRIncome: "",
      netITRIncome: "",
      rentIncome: "",
      annualBonus: "",
      monthlyIncentive: "",
      pension: "",
      gstReturn: "",
    },
  });

  // Fetch and prefill income details if they exist
  useEffect(() => {
    const fetchIncomeDetails = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const apiId = customerId || user?.id;
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/income-details/${apiId}`);
        const data = response.data;
        if (data) {
          // Map backend fields to form fields
          const mapped = {
            employmentType: data.employment_type || "",
            employerType: data.employer_type || "",
            grossSalary: data.gross_salary?.toString() || "",
            netSalary: data.net_salary?.toString() || "",
            rentIncome: data.rent_income?.toString() || "",
            annualBonus: data.annual_bonus?.toString() || "",
            pension: data.pension?.toString() || "",
            monthlyIncentive: data.monthly_incentive?.toString() || "",
            grossITRIncome: data.gross_itr_income?.toString() || "",
            netITRIncome: data.net_itr_income?.toString() || "",
            gstReturn: data.gst_return?.toString() || "",
            existingLoan: data.existing_loan === true || data.existing_loan === "true" ? "yes" : "no",
            existingLoans: (data.existingLoans && data.existingLoans.length > 0)
              ? data.existingLoans.map((loan: any) => ({
                  type: loan.type || "",
                  emiRate: loan.emi_rate?.toString() || "",
                  outstandingAmount: loan.outstanding_amount?.toString() || "",
                  balanceTenure: loan.balance_tenure?.toString() || "",
                }))
              : [],
          };
          console.log(mapped);
          setEmploymentType(mapped.employmentType);
          form.reset(mapped);
        }
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          // No income details found, do nothing
        } else {
          setError("Failed to fetch income details");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchIncomeDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const watchedEmploymentType = form.watch("employmentType");
  const watchedExistingLoan = form.watch("existingLoan");

  useEffect(() => {
    if (watchedEmploymentType !== employmentType) {
      setEmploymentType(watchedEmploymentType);
      // Clear errors when employment type changes
      form.clearErrors();
    }
  }, [watchedEmploymentType, employmentType, form]);

  const handlePreviewAndSave = (data: IncomeFormValues) => {
    console.log("data", data);
    setPreviewData(data);
    setShowPreview(true);
  };

  const onSubmit = async (data: IncomeFormValues) => {
    console.log(data);
    // Ensure all required fields are properly typed when submitting
    if (data.existingLoan === "no") {
      data.existingLoans = [];
    }
    let saveSuccess = false;
    if (data.employmentType === "salaried") {
      const processedExistingLoans = (data.existingLoans || []).map(loan => ({
        type: loan.type || "",
        emiRate: Number(loan.emiRate) || 0,
        outstandingAmount: Number(loan.outstandingAmount) || 0,
        balanceTenure: Number(loan.balanceTenure) || 0
      }));

      const salariedIncomeDetails: EmployedIncomeDetails = {
        employmentType: "salaried",
        employerType: (data as any).employerType || "",
        grossSalary: Number((data as any).grossSalary) || 0,
        netSalary: Number((data as any).netSalary) || 0,
        rentIncome: (data as any).rentIncome || 0,
        annualBonus: (data as any).annualBonus || 0,
        pension: (data as any).pension || 0,
        monthlyIncentive: (data as any).monthlyIncentive || 0,
        existingLoans: processedExistingLoans,
        existingLoan: data.existingLoan,
      };
      saveSuccess = await saveIncomeDetailsToServer(salariedIncomeDetails, customerId || user?.id);
      if (saveSuccess) {
        saveIncomeDetails(salariedIncomeDetails);
        setShowPreview(false);
      }
    } else if (data.employmentType === "self-employed") {
      const processedExistingLoans = (data.existingLoans || []).map(loan => ({
        type: loan.type || "",
        emiRate: Number(loan.emiRate) || 0,
        outstandingAmount: Number(loan.outstandingAmount) || 0,
        balanceTenure: Number(loan.balanceTenure) || 0
      }));

      const selfEmployedIncomeDetails: SelfEmployedIncomeDetails = {
        employmentType: data.employmentType,
        grossITRIncome: (data as any).grossITRIncome || "",
        netITRIncome: (data as any).netITRIncome || "",
        rentIncome: (data as any).rentIncome || "",
        gstReturn: (data as any).gstReturn || "",
        existingLoans: processedExistingLoans,
        existingLoan: data.existingLoan,
      };
      saveSuccess = await saveIncomeDetailsToServer(selfEmployedIncomeDetails, customerId || user?.id);
      if (saveSuccess) {
        saveIncomeDetails(selfEmployedIncomeDetails);
        setShowPreview(false);
      }
    }
  };

  const saveIncomeDetailsToServer = async (incomeDetails: IncomeDetails, userId: string | undefined): Promise<boolean> => {
    if (!userId) return false;
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/income-details`, {
        ...incomeDetails,
        userId,
      });
      console.log(response.data);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to save income details to server");
      return false;
    }
  };

  const addExistingLoan = () => {
    const currentLoans = form.getValues("existingLoans") || [];
    form.setValue("existingLoans", [
      ...currentLoans,
      { type: "", emiRate: "", outstandingAmount: "", balanceTenure: "" }
    ]);
  };

  const removeExistingLoan = (index: number) => {
    const currentLoans = form.getValues("existingLoans") || [];
    form.setValue("existingLoans", currentLoans.filter((_, i) => i !== index));
  };

  const formatDisplayValue = (value: any, fieldType: string, options?: any[]) => {
    if (!value) return "Not provided";
    if (fieldType === 'select' && options) {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    return value;
  };

  const renderPreviewContent = () => {
    if (!previewData) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><strong>Employment Type:</strong> {formatDisplayValue(previewData.employmentType, 'select', employmentTypeOptions)}</div>
          
          {previewData.employmentType === "salaried" && (
            <>
              <div><strong>Employer Type:</strong> {formatDisplayValue((previewData as any).employerType, 'text')}</div>
              <div><strong>Gross Salary:</strong> ₹{formatDisplayValue((previewData as any).grossSalary, 'text')}</div>
              <div><strong>Net Salary:</strong> ₹{formatDisplayValue((previewData as any).netSalary, 'text')}</div>
              <div><strong>Rent Income:</strong> ₹{formatDisplayValue((previewData as any).rentIncome, 'text')}</div>
              <div><strong>Annual Bonus:</strong> ₹{formatDisplayValue((previewData as any).annualBonus, 'text')}</div>
              <div><strong>Monthly Incentive:</strong> ₹{formatDisplayValue((previewData as any).monthlyIncentive, 'text')}</div>
              <div><strong>Pension:</strong> ₹{formatDisplayValue((previewData as any).pension, 'text')}</div>
            </>
          )}
          
          {previewData.employmentType === "self-employed" && (
            <>
              <div><strong>Gross ITR Income:</strong> ₹{formatDisplayValue((previewData as any).grossITRIncome, 'text')}</div>
              <div><strong>Net ITR Income:</strong> ₹{formatDisplayValue((previewData as any).netITRIncome, 'text')}</div>
              <div><strong>Rent Income:</strong> ₹{formatDisplayValue((previewData as any).rentIncome, 'text')}</div>
              <div><strong>GST Return:</strong> {formatDisplayValue((previewData as any).gstReturn, 'text')}</div>
            </>
          )}
          
          <div><strong>Existing Loan:</strong> {formatDisplayValue(previewData.existingLoan, 'text')}</div>
        </div>
        
        {previewData.existingLoans && previewData.existingLoans.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Existing Loans:</h4>
            {previewData.existingLoans.map((loan, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded mb-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Type:</strong> {loan.type}</div>
                  <div><strong>EMI Rate:</strong> ₹{loan.emiRate}</div>
                  <div><strong>Outstanding:</strong> ₹{loan.outstandingAmount}</div>
                  <div><strong>Balance Tenure:</strong> {loan.balanceTenure} months</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
            ⚠️ Important: You cannot change this information again once saved. Please verify all details carefully.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Income Details</h2>
        <Button variant="outline" onClick={goToPreviousStep}>
          ← Previous Step
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handlePreviewAndSave)} className="space-y-6">
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

          {/* Salaried Fields */}
          {employmentType === "salaried" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="public">Public Sector</SelectItem>
                        <SelectItem value="mnc">MNC</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    <FormLabel>Rent Income (₹) - Optional</FormLabel>
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
                    <FormLabel>Annual Bonus (₹) - Optional</FormLabel>
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
                    <FormLabel>Monthly Incentive (₹) - Optional</FormLabel>
                    <FormControl>
                      <Input placeholder="Monthly Incentive" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pension"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pension (₹) - Optional</FormLabel>
                    <FormControl>
                      <Input placeholder="Pension" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Self-Employed Fields */}
          {employmentType === "self-employed" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <FormLabel>Rent Income (₹) - Optional</FormLabel>
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
                    <FormLabel>GST Return - Optional</FormLabel>
                    <FormControl>
                      <Input placeholder="GST Return" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Existing Loan Section */}
          <div className="space-y-4">
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
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`existingLoans.${index}.type`}
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
                          name={`existingLoans.${index}.emiRate`}
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
                          name={`existingLoans.${index}.outstandingAmount`}
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
                          name={`existingLoans.${index}.balanceTenure`}
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

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Clear
            </Button>
            <Button type="submit">Preview & Save</Button>
          </div>
        </form>
      </Form>

      {/* Preview and Confirmation Dialog */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Preview Income Details</AlertDialogTitle>
            <AlertDialogDescription>
              Please review your information carefully. You cannot change this information again once saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {renderPreviewContent()}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back & Edit</AlertDialogCancel>
            <AlertDialogAction onClick={() => previewData && onSubmit(previewData)}>
              Confirm & Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IncomeDetailsForm;
