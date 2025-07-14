import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "../../contexts/AuthContext";

interface CoApplicantFormProps {
  onClose: () => void;
  onSubmit: (data: CoApplicantFormValues) => void;
  customerId: string;
}

const employmentTypeOptions = [
  { value: "salaried", label: "Salaried" },
  { value: "self-employed", label: "Self Employed" },
  { value: "retired", label: "Retired" },
  { value: "housewife", label: "Housewife" },
  { value: "student", label: "Student" },
];

const loanTypeOptions = [
  { value: "home-loan", label: "Home Loan" },
  { value: "personal-loan", label: "Personal Loan" },
  { value: "car-loan", label: "Car Loan" },
  { value: "education-loan", label: "Education Loan" },
  { value: "business-loan", label: "Business Loan" },
  { value: "commercial-loan", label: "Commercial Loan" },
  { value: "od-loan", label: "OD Loan" },
  { value: "society-loan", label: "Society Loan" },
  { value: "guarantor-loan", label: "Guarantor Loan" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const relationshipOptions = [
  { value: "spouse", label: "Spouse" },
  { value: "parent", label: "Parent" },
  { value: "sibling", label: "Sibling" },
  { value: "child", label: "Child" },
  { value: "other", label: "Other" },
];

const maritalStatusOptions = [
  { value: "married", label: "Married" },
  { value: "unmarried", label: "Unmarried" },
  { value: "single", label: "Single" },
  { value: "widowed", label: "Widowed" },
  { value: "divorced", label: "Divorced" },
  { value: "separated", label: "Separated" },
];

// Base schema for all employment types
const baseCoApplicantSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  alternateNumber: z.string().optional(),
  aadhaarNumber: z.string().min(12, "Aadhaar number must be 12 digits"),
  panCardNumber: z.string().min(10, "PAN card number must be 10 characters"),
  gender: z.string().min(1, "Please select gender"),
  dateOfBirth: z.date({
    required_error: "Please select date of birth",
  }),
  maritalStatus: z.string().min(1, "Please select marital status"),
  relationshipToApplicant: z.string().min(1, "Please select relationship"),
  employmentType: z.string().min(1, "Please select employment type"),
  existingLoan: z.string().min(1, "Please select if you have existing loans"),
  existingLoans: z.array(z.object({
    type: z.string().min(1, "Please select loan type"),
    emiRate: z.string().min(1, "EMI rate is required"),
    outstandingAmount: z.string().min(1, "Outstanding amount is required"),
    balanceTenure: z.string().min(1, "Balance tenure is required"),
  })).optional(),
});

// Salaried-specific schema
const salariedCoApplicantSchema = baseCoApplicantSchema.extend({
  employerType: z.string().min(1, "Please select employer type"),
  monthlyGrossSalary: z.string().min(1, "Monthly gross salary is required"),
  monthlyNetSalary: z.string().min(1, "Monthly net salary is required"),
  rentIncome: z.string().optional(),
  pension: z.string().optional(),
});

// Self-employed schema
const selfEmployedCoApplicantSchema = baseCoApplicantSchema.extend({
  grossITRIncome: z.string().min(1, "Gross ITR income is required"),
  netITRIncome: z.string().min(1, "Net ITR income is required"),
  rentIncome: z.string().optional(),
  gstReturn: z.string().optional(),
});

type CoApplicantFormValues = z.infer<typeof salariedCoApplicantSchema> | z.infer<typeof selfEmployedCoApplicantSchema>;

const CoApplicantForm: React.FC<CoApplicantFormProps> = ({ onClose, onSubmit: onSubmitProp, customerId }) => {
  const [employmentType, setEmploymentType] = useState<string>("");
  const [hasExistingLoans, setHasExistingLoans] = useState<string>("");

  const getCurrentSchema = () => {
    switch (employmentType) {
      case "salaried":
        return salariedCoApplicantSchema;
      case "self-employed":
        return selfEmployedCoApplicantSchema;
      default:
        return baseCoApplicantSchema;
    }
  };

  const form = useForm<CoApplicantFormValues>({
    resolver: zodResolver(getCurrentSchema()),
    defaultValues: {
      existingLoans: [],
    },
  });

  const watchedEmploymentType = form.watch("employmentType");
  const watchedExistingLoan = form.watch("existingLoan");

  React.useEffect(() => {
    if (watchedEmploymentType !== employmentType) {
      setEmploymentType(watchedEmploymentType);
      // Reset employment-specific fields when type changes
      const currentValues = form.getValues();
      form.reset({
        firstName: currentValues.firstName,
        middleName: currentValues.middleName,
        lastName: currentValues.lastName,
        email: currentValues.email,
        mobile: currentValues.mobile,
        alternateNumber: currentValues.alternateNumber,
        aadhaarNumber: currentValues.aadhaarNumber,
        panCardNumber: currentValues.panCardNumber,
        gender: currentValues.gender,
        dateOfBirth: currentValues.dateOfBirth,
        maritalStatus: currentValues.maritalStatus,
        relationshipToApplicant: currentValues.relationshipToApplicant,
        employmentType: watchedEmploymentType,
        existingLoan: currentValues.existingLoan,
        existingLoans: currentValues.existingLoans,
      });
    }
  }, [watchedEmploymentType, employmentType, form]);

  React.useEffect(() => {
    if (watchedExistingLoan !== hasExistingLoans) {
      setHasExistingLoans(watchedExistingLoan);
      if (watchedExistingLoan === "no") {
        form.setValue("existingLoans", []);
      } else if (watchedExistingLoan === "yes" && (!form.getValues("existingLoans") || form.getValues("existingLoans")?.length === 0)) {
        form.setValue("existingLoans", [{ type: "", emiRate: "", outstandingAmount: "", balanceTenure: "" }]);
      }
    }
  }, [watchedExistingLoan, hasExistingLoans, form]);

  // Auto-fetch and prefill if co-applicant exists
  React.useEffect(() => {
    if (!customerId) return;
    (async () => {
      try {
        const resp = await fetch(`${import.meta.env.VITE_SERVER_URL}/co-applicants/${customerId}`);
        const data = await resp.json();
        if (Array.isArray(data) && data.length > 0) {
          const ca = data[0];
          // Flatten for form fields
          const pd = ca.personalDetails || {};
          const inc = ca.incomeDetails || {};
          form.reset({
            firstName: pd.firstName || "",
            middleName: pd.middleName || "",
            lastName: pd.lastName || "",
            email: pd.email || "",
            mobile: pd.mobile || "",
            alternateNumber: pd.alternateNumber || "",
            aadhaarNumber: pd.aadhaarNumber || "",
            panCardNumber: pd.panCardNumber || "",
            gender: pd.gender || "",
            dateOfBirth: pd.dateOfBirth ? new Date(pd.dateOfBirth) : undefined,
            maritalStatus: pd.maritalStatus || "",
            relationshipToApplicant: pd.relationshipToApplicant || "",
            employmentType: inc.employmentType || "",
            employerType: inc.employerType || "",
            monthlyGrossSalary: inc.grossSalary ? String(inc.grossSalary) : "",
            monthlyNetSalary: inc.netSalary ? String(inc.netSalary) : "",
            rentIncome: inc.rentIncome ? String(inc.rentIncome) : "",
            pension: inc.pension ? String(inc.pension) : "",
            grossITRIncome: inc.grossITRIncome ? String(inc.grossITRIncome) : "",
            netITRIncome: inc.netITRIncome ? String(inc.netITRIncome) : "",
            gstReturn: inc.gstReturn ? String(inc.gstReturn) : "",
            existingLoan: inc.existingLoan || "no",
            existingLoans: Array.isArray(inc.existingLoans) ? inc.existingLoans.map(l => ({
              type: l.type || "",
              emiRate: l.emiRate ? String(l.emiRate) : "",
              outstandingAmount: l.outstandingAmount ? String(l.outstandingAmount) : "",
              balanceTenure: l.balanceTenure ? String(l.balanceTenure) : ""
            })) : [],
          });
        }
      } catch (err) {
        // ignore fetch errors
      }
    })();
  }, [customerId]);

  const onSubmit = (data: CoApplicantFormValues) => {
    // Split data into personalDetails and incomeDetails for backend
    const {
      firstName, middleName, lastName, email, mobile, alternateNumber, aadhaarNumber, panCardNumber, gender, dateOfBirth, maritalStatus, relationshipToApplicant,
      employmentType, existingLoan, existingLoans,
      // Salaried
      rentIncome, pension,
    } = data as any;

    const personalDetails = {
      firstName, middleName, lastName, email, mobile, alternateNumber, aadhaarNumber, panCardNumber, gender,
      dateOfBirth: dateOfBirth instanceof Date ? dateOfBirth.toISOString().split('T')[0] : dateOfBirth,
      maritalStatus, relationshipToApplicant
    };

    let incomeDetails: any = { employmentType, existingLoan };
    if (employmentType === 'salaried') {
      const salaried = data as any;
      incomeDetails = {
        employmentType,
        employerType: salaried.employerType || '',
        grossSalary: Number(salaried.monthlyGrossSalary) || 0,
        netSalary: Number(salaried.monthlyNetSalary) || 0,
        rentIncome: Number(salaried.rentIncome) || 0,
        pension: Number(salaried.pension) || 0,
        existingLoan,
        existingLoans: (existingLoans || []).map((l: any) => ({
          type: l.type,
          emiRate: Number(l.emiRate) || 0,
          outstandingAmount: Number(l.outstandingAmount) || 0,
          balanceTenure: Number(l.balanceTenure) || 0
        }))
      };
    } else if (employmentType === 'self-employed') {
      const selfEmp = data as any;
      incomeDetails = {
        employmentType,
        grossITRIncome: Number(selfEmp.grossITRIncome) || 0,
        netITRIncome: Number(selfEmp.netITRIncome) || 0,
        rentIncome: Number(selfEmp.rentIncome) || 0,
        gstReturn: Number(selfEmp.gstReturn) || 0,
        existingLoan,
        existingLoans: (existingLoans || []).map((l: any) => ({
          type: l.type,
          emiRate: Number(l.emiRate) || 0,
          outstandingAmount: Number(l.outstandingAmount) || 0,
          balanceTenure: Number(l.balanceTenure) || 0
        }))
      };
    } else {
      incomeDetails = {
        employmentType,
        existingLoan,
        existingLoans: (existingLoans || []).map((l: any) => ({
          type: l.type,
          emiRate: Number(l.emiRate) || 0,
          outstandingAmount: Number(l.outstandingAmount) || 0,
          balanceTenure: Number(l.balanceTenure) || 0
        }))
      };
    }

    onSubmitProp({ personalDetails, incomeDetails } as any);
    onClose();
  };

  const addLoan = () => {
    const currentLoans = form.getValues("existingLoans") || [];
    form.setValue("existingLoans", [...currentLoans, { type: "", emiRate: "", outstandingAmount: "", balanceTenure: "" }]);
  };

  const removeLoan = (index: number) => {
    const currentLoans = form.getValues("existingLoans") || [];
    const updatedLoans = currentLoans.filter((_, i) => i !== index);
    form.setValue("existingLoans", updatedLoans);
  };

  const renderIncomeFields = () => {
    if (employmentType === "salaried") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="employerType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type of Employer</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            name="monthlyGrossSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>₹ Monthly Gross Salary</FormLabel>
                <FormControl>
                  <Input placeholder="Monthly Gross Salary" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyNetSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>₹ Monthly Net Salary</FormLabel>
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
                <FormLabel>₹ Rent Income (If Applicable)</FormLabel>
                <FormControl>
                  <Input placeholder="Rent Income" {...field} />
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
                <FormLabel>₹ Pension (If Applicable)</FormLabel>
                <FormControl>
                  <Input placeholder="Pension" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

    if (employmentType === "self-employed") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormLabel>₹ Rent Income (If Applicable)</FormLabel>
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
                <FormLabel>GST Return</FormLabel>
                <FormControl>
                  <Input placeholder="GST Return" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

    return null;
  };

  const renderExistingLoansSection = () => {
    if (hasExistingLoans !== "yes") return null;

    const existingLoans = form.watch("existingLoans") || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-medium">Existing Loans</h5>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLoan}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Loan
          </Button>
        </div>

        {existingLoans.map((_, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h6 className="text-sm font-medium">Loan {index + 1}</h6>
              {existingLoans.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLoan(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`existingLoans.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Co-applicant Details</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Details Section */}
          <div>
            <h4 className="text-md font-medium mb-4">Personal Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First Name" {...field} />
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
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Email Address" {...field} />
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
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Mobile Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alternateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternate Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Alternate Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aadhaarNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhaar Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Aadhaar Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="panCardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN Card Number</FormLabel>
                    <FormControl>
                      <Input placeholder="PAN Card Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genderOptions.map((option) => (
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
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
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
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marital Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Marital Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {maritalStatusOptions.map((option) => (
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
                name="relationshipToApplicant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship to Applicant</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {relationshipOptions.map((option) => (
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
            </div>
          </div>

          {/* Income Details Section */}
          <div>
            <h4 className="text-md font-medium mb-4">Income Details</h4>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              {renderIncomeFields()}
            </div>
          </div>

          {/* Any Existing Loan Section */}
          <div>
            <h4 className="text-md font-medium mb-4">Any Existing Loan</h4>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="existingLoan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do you have any existing loans?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              {renderExistingLoansSection()}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Co-applicant</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CoApplicantForm;