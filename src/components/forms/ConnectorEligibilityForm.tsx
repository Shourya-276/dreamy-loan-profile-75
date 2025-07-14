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

const eligibilitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  alternateMobile: z.string().optional(),
  // Income Details fields - all optional except name and mobile
  typeOfEmployer: z.string().optional(),
  monthlyGrossSalary: z.string().optional(),
  monthlyNetSalary: z.string().optional(),
  rentIncome: z.string().optional(),
  annualBonus: z.string().optional(),
  pension: z.string().optional(),
  averageMonthlyIncentive: z.string().optional(),
  anyExistingLoan: z.string().optional(),
  // Names section - optional (removed connectorName)
  salesExecutive: z.string().optional(),
  // New Residential Status fields
  residentialStatus: z.string().optional(),
  residencyType: z.string().optional(),
  futureRent: z.string().optional(),
});

type EligibilityFormValues = z.infer<typeof eligibilitySchema>;

const employerTypeOptions = [
  { value: "government", label: "Government" },
  { value: "private", label: "Private" },
  { value: "self-employed", label: "Self Employed" },
  { value: "business", label: "Business" },
  { value: "retired", label: "Retired" },
  { value: "housewife", label: "Housewife" },
  { value: "student", label: "Student" },
];

const residentialStatusOptions = [
  { value: "self-owned", label: "Self Owned" },
  { value: "company-leased", label: "Company Leased" },
  { value: "rented", label: "Rented" },
  { value: "family", label: "Family" },
];

const residencyTypeOptions = [
  { value: "building", label: "Building" },
  { value: "chawl", label: "Chawl" },
  { value: "bungalow", label: "Bungalow" },
  { value: "villa", label: "Villa" },
  { value: "rowhouse", label: "Rowhouse" },
];

const ConnectorEligibilityForm = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<EligibilityFormValues | null>(null);

  const form = useForm<EligibilityFormValues>({
    resolver: zodResolver(eligibilitySchema),
    defaultValues: {
      name: "",
      middleName: "",
      lastName: "",
      email: "",
      mobile: "",
      alternateMobile: "",
      typeOfEmployer: "",
      monthlyGrossSalary: "",
      monthlyNetSalary: "",
      rentIncome: "",
      annualBonus: "",
      pension: "",
      averageMonthlyIncentive: "",
      anyExistingLoan: "",
      salesExecutive: "",
      residentialStatus: "",
      residencyType: "",
      futureRent: "",
    },
  });

  const watchResidentialStatus = form.watch("residentialStatus");
  const watchResidencyType = form.watch("residencyType");

  const shouldShowResidencyType = watchResidentialStatus === "self-owned";
  const shouldShowFutureRent = shouldShowResidencyType && 
    (watchResidencyType === "building" || watchResidencyType === "villa" || watchResidencyType === "bungalow");

  const handlePreviewAndSave = (data: EligibilityFormValues) => {
    setPreviewData(data);
    setShowPreview(true);
  };

  const onSubmit = (data: EligibilityFormValues) => {
    console.log("Connector eligibility form data:", data);
    setShowPreview(false);
    // Handle form submission here
  };

  const handleClear = () => {
    form.reset();
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
          {/* Personal Details */}
          <div className="md:col-span-2"><h4 className="font-semibold text-base mb-2">Personal Details</h4></div>
          <div><strong>Name:</strong> {formatDisplayValue(previewData.name, 'text')}</div>
          <div><strong>Middle Name:</strong> {formatDisplayValue(previewData.middleName, 'text')}</div>
          <div><strong>Last Name:</strong> {formatDisplayValue(previewData.lastName, 'text')}</div>
          <div><strong>Email:</strong> {formatDisplayValue(previewData.email, 'text')}</div>
          <div><strong>Mobile:</strong> {formatDisplayValue(previewData.mobile, 'text')}</div>
          <div><strong>Alternate Mobile:</strong> {formatDisplayValue(previewData.alternateMobile, 'text')}</div>
          
          {/* Residential Status */}
          <div className="md:col-span-2"><h4 className="font-semibold text-base mb-2 mt-4">Residential Status</h4></div>
          <div><strong>Residential Status:</strong> {formatDisplayValue(previewData.residentialStatus, 'select', residentialStatusOptions)}</div>
          {shouldShowResidencyType && (
            <div><strong>Residency Type:</strong> {formatDisplayValue(previewData.residencyType, 'select', residencyTypeOptions)}</div>
          )}
          {shouldShowFutureRent && (
            <div><strong>Future Rent:</strong> ₹{formatDisplayValue(previewData.futureRent, 'text')}</div>
          )}
          
          {/* Income Details */}
          <div className="md:col-span-2"><h4 className="font-semibold text-base mb-2 mt-4">Income Details</h4></div>
          <div><strong>Type of Employer:</strong> {formatDisplayValue(previewData.typeOfEmployer, 'select', employerTypeOptions)}</div>
          <div><strong>Monthly Gross Salary:</strong> ₹{formatDisplayValue(previewData.monthlyGrossSalary, 'text')}</div>
          <div><strong>Monthly Net Salary:</strong> ₹{formatDisplayValue(previewData.monthlyNetSalary, 'text')}</div>
          <div><strong>Rent Income:</strong> ₹{formatDisplayValue(previewData.rentIncome, 'text')}</div>
          <div><strong>Annual Bonus:</strong> ₹{formatDisplayValue(previewData.annualBonus, 'text')}</div>
          <div><strong>Pension:</strong> ₹{formatDisplayValue(previewData.pension, 'text')}</div>
          <div><strong>Average Monthly Incentive:</strong> ₹{formatDisplayValue(previewData.averageMonthlyIncentive, 'text')}</div>
          <div><strong>Any Existing Loan:</strong> {formatDisplayValue(previewData.anyExistingLoan, 'text')}</div>
          
          {/* Names */}
          <div className="md:col-span-2"><h4 className="font-semibold text-base mb-2 mt-4">Names</h4></div>
          <div><strong>Sales Executive:</strong> {formatDisplayValue(previewData.salesExecutive, 'text')}</div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
            ⚠️ Important: You cannot change this information again once saved. Please verify all details carefully.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Eligibility Form</h2>
      <h3 className="text-lg font-medium mb-4">Personal Details*</h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handlePreviewAndSave)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Name - Required */}
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
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Email Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mobile Number - Required */}
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

            {/* New Alternate Mobile Number - Optional */}
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

          {/* New Residential Status Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Residential Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="residentialStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Residential Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Residential Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {residentialStatusOptions.map((option) => (
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

              {/* Conditional Residency Type field */}
              {shouldShowResidencyType && (
                <FormField
                  control={form.control}
                  name="residencyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Residency Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Residency Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {residencyTypeOptions.map((option) => (
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

              {/* Conditional Future Rent field */}
              {shouldShowFutureRent && (
                <FormField
                  control={form.control}
                  name="futureRent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Future Rent</FormLabel>
                      <FormControl>
                        <Input placeholder="₹ Future Rent" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>

          {/* Income Details Section - Optional */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Income Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="typeOfEmployer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Employer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Type of Employer" />
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

              <FormField
                control={form.control}
                name="monthlyGrossSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>₹ Monthly Gross Salary</FormLabel>
                    <FormControl>
                      <Input placeholder="₹ Monthly Gross Salary" {...field} />
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
                      <Input placeholder="₹ Monthly Net Salary" {...field} />
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
                    <FormLabel>₹ Rent Income(If Applicable)</FormLabel>
                    <FormControl>
                      <Input placeholder="₹ Rent Income(If Applicable)" {...field} />
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
                    <FormLabel>₹ Annual Bonus</FormLabel>
                    <FormControl>
                      <Input placeholder="₹ Annual Bonus" {...field} />
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
                    <FormLabel>₹ Pension(If Applicable)</FormLabel>
                    <FormControl>
                      <Input placeholder="₹ Pension(If Applicable)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="averageMonthlyIncentive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>₹ Average Monthly Incentive</FormLabel>
                    <FormControl>
                      <Input placeholder="₹ Average Monthly Incentive" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anyExistingLoan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Any Existing Loan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Any Existing Loan" />
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
            </div>
          </div>

          {/* Names Section - Optional */}
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

export default ConnectorEligibilityForm;
