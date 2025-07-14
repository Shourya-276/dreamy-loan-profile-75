
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoan } from "../../contexts/LoanContext";
import { useAuth } from "../../contexts/AuthContext";
import { 
  genderOptions,
  countryOptions,
  stateOptions,
  districtOptions,
  cityOptions
} from "../../utils/formOptions";

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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
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

const personalDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string()
    .email("Invalid email address")
    .refine((email) => {
      const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com', 'icloud.com'];
      const domain = email.split('@')[1];
      return validDomains.includes(domain);
    }, "Email must be from a valid domain (gmail.com, yahoo.com, outlook.com, etc.)"),
  mobile: z.string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits")
    .refine((mobile) => /^\d+$/.test(mobile), "Mobile number should only contain numbers"),
  aadhaarNumber: z.string().min(12, "Aadhaar number must be 12 digits"),
  panCardNumber: z.string().min(10, "PAN card number must be 10 characters"),
  gender: z.string().min(1, "Please select your gender"),
  dateOfBirth: z.date({
    required_error: "Please select a date of birth",
  }),
  maritalStatus: z.string().min(1, "Please select your marital status"),
  streetAddress: z.string().min(1, "Street address is required"),
  pinCode: z.string().min(6, "Pin code must be 6 digits"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  residenceType: z.string().min(1, "Residence type is required"),
});

type PersonalDetailsFormValues = z.infer<typeof personalDetailsSchema>;

// Mock pincode database - In production, this would be an API call
const pincodeDatabase: Record<string, { country: string; state: string; district: string; city: string }> = {
  "110001": { country: "India", state: "Delhi", district: "Central Delhi", city: "New Delhi" },
  "400001": { country: "India", state: "Maharashtra", district: "Mumbai City", city: "Mumbai" },
  "560001": { country: "India", state: "Karnataka", district: "Bangalore Urban", city: "Bangalore" },
  "600001": { country: "India", state: "Tamil Nadu", district: "Chennai", city: "Chennai" },
  "700001": { country: "India", state: "West Bengal", district: "Kolkata", city: "Kolkata" },
  "500001": { country: "India", state: "Telangana", district: "Hyderabad", city: "Hyderabad" },
  "411001": { country: "India", state: "Maharashtra", district: "Pune", city: "Pune" },
  "302001": { country: "India", state: "Rajasthan", district: "Jaipur", city: "Jaipur" },
  "380001": { country: "India", state: "Gujarat", district: "Ahmedabad", city: "Ahmedabad" },
  "201301": { country: "India", state: "Uttar Pradesh", district: "Gautam Buddha Nagar", city: "Noida" },
};

const PersonalDetailsForm = ({ prefillData }: { prefillData: any }) => {
  const { application, savePersonalDetails } = useLoan();
  const { user } = useAuth();
  let customerId = null;
  // console.log(prefillData);
  if (prefillData) {
    customerId = prefillData.userId;
    // console.log(prefillData);
  }
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PersonalDetailsFormValues | null>(null);

  // Calculate default date (18 years ago from today)
  const getDefaultDate = () => {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return eighteenYearsAgo;
  };

  // Determine if we are in the "new customer by sales manager" flow
  const isSalesManagerNewCustomer = user?.role === 'salesmanager' && !prefillData;

  const defaultValues: Partial<PersonalDetailsFormValues> = {
    firstName: "",
    middleName: "",
    lastName: "",
    // Do not auto-prefill the email when a sales manager is creating a brand-new profile
    email: isSalesManagerNewCustomer ? "" : user?.email || "",
    mobile: "",
    aadhaarNumber: "",
    panCardNumber: "",
    gender: "",
    maritalStatus: "",
    dateOfBirth: undefined,
    streetAddress: "",
    pinCode: "",
    country: "",
    state: "",
    district: "",
    city: "",
    residenceType: "",
  };
  
  const form = useForm<PersonalDetailsFormValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues,
  });

  // Auto-fill based on pincode
  const handlePincodeChange = (pincode: string) => {
    if (pincode.length === 6 && pincodeDatabase[pincode]) {
      const locationData = pincodeDatabase[pincode];
      form.setValue("country", locationData.country);
      form.setValue("state", locationData.state);
      form.setValue("district", locationData.district);
      form.setValue("city", locationData.city);
      toast.success("Location details auto-filled based on pincode!");
    }
  };

  // Fetch existing personal details
  useEffect(() => {
    const fetchPersonalDetails = async () => {
      try {
        setIsLoading(true);
        const apiId = customerId || user?.id;
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/personal-details/${apiId}`);
        if (response.status === 200 && response.data) {
          const details = response.data;
          // Update form values with fetched data
          form.reset({
            firstName: details.first_name || "",
            middleName: details.middle_name || "",
            lastName: details.last_name || "",
            email: details.email || user?.email || "",
            mobile: details.mobile || "",
            aadhaarNumber: details.aadhaar_number || "",
            panCardNumber: details.pan_card_number || "",
            gender: details.gender || "",
            maritalStatus: details.marital_status || "",
            dateOfBirth: details.date_of_birth ? new Date(details.date_of_birth) : undefined,
            streetAddress: details.street_address || "",
            pinCode: details.pin_code || "",
            country: details.country || "",
            state: details.state || "",
            district: details.district || "",
            city: details.city || "",
            residenceType: details.residence_type || "",
          });
          savePersonalDetails({
            firstName: details.first_name,
            middleName: details.middle_name,
            lastName: details.last_name,
            email: details.email,
            mobile: details.mobile,
            aadhaarNumber: details.aadhaar_number,
            panCardNumber: details.pan_card_number,
            gender: details.gender,
            maritalStatus: details.marital_status,
            dateOfBirth: details.date_of_birth,
            streetAddress: details.street_address,
            pinCode: details.pin_code,
            country: details.country,
            state: details.state,
            district: details.district,
            city: details.city,
            residenceType: details.residence_type,
          }, false, false);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status !== 404) {
          console.error("Error fetching personal details:", error);
          toast.error("Failed to fetch personal details");
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Skip auto-fetch when a sales manager starts a brand-new profile (no prefillData)
    if (!isSalesManagerNewCustomer && (prefillData?.userId || user?.id)) {
      fetchPersonalDetails();
    } else {
      setIsLoading(false);
    }
  }, [user?.id, prefillData, user?.role]);

  const handlePreviewAndSave = (data: PersonalDetailsFormValues) => {
    setPreviewData(data);
    setShowPreview(true);
  };

  const onSubmit = async (data: PersonalDetailsFormValues) => {
    try {
      const personalDetails = {
        firstName: data.firstName,
        middleName: data.middleName || "",
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        aadhaarNumber: data.aadhaarNumber,
        panCardNumber: data.panCardNumber,
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        dateOfBirth: data.dateOfBirth.toISOString(),
        streetAddress: data.streetAddress,
        pinCode: data.pinCode,
        country: data.country,
        state: data.state,
        district: data.district,
        city: data.city,
        residenceType: data.residenceType,
      };

      savePersonalDetails(personalDetails, false, false);

      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/personal-details`, {
        personalDetails,
        userId: customerId || user?.id,
      });
      
      if (response.status === 200 || response.status === 201) {
        savePersonalDetails(personalDetails);
        setShowPreview(false);
      } else {
        throw new Error("Failed to save personal details to server");
      }      
    } catch (error) {
      console.error("Error saving personal details:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Server validation errors:", error.response.data);
        toast.error(error.response.data.errors ? 
          Object.values(error.response.data.errors).join(", ") : 
          "Failed to save personal details to server");
      } else {
        toast.error("Failed to save personal details to server");
      }
    }
  };

  const formatDisplayValue = (value: any, fieldType: string) => {
    if (fieldType === 'date' && value) {
      return format(value, "PPP");
    }
    if (fieldType === 'select') {
      const allOptions = [...genderOptions];
      const option = allOptions.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    return value || "Not provided";
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Personal Details</h2>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handlePreviewAndSave)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Name */}
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

              {/* Middle Name */}
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

              {/* Last Name */}
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

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Email Address" 
                        {...field}
                        // Allow editing when sales manager is creating a new customer profile
                        disabled={user?.role === 'customer'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mobile */}
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Mobile Number" 
                        {...field} 
                        maxLength={10}
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/[^0-9]/g, '');
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Aadhaar */}
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

              {/* PAN Card */}
              <FormField
                control={form.control}
                name="panCardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN Card Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="PAN Card Number" 
                        {...field}
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.toUpperCase();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender */}
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

              {/* Date of Birth - Enhanced with year/month selection and default to 18 years ago */}
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
                          defaultMonth={field.value || getDefaultDate()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                          captionLayout="dropdown-buttons"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
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
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="unmarried">Unmarried</SelectItem>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="separated">Separated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Street Address */}
              <FormField
                control={form.control}
                name="streetAddress"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Enhanced Pin Code field with auto-fill */}
              <FormField
                control={form.control}
                name="pinCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pin Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Pin Code" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handlePincodeChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Country - Changed from Select to Input */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* State - Changed from Select to Input */}
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* District - Changed from Select to Input */}
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Input placeholder="District" {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City - Changed from Select to Input */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Residence Type */}
              <FormField
                control={form.control}
                name="residenceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Residence Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Residence Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="self_owned">Self Owned</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="company_leased">Company Leased</SelectItem>
                        <SelectItem value="family_owned">Family Owned</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Clear
              </Button>
              <Button type="submit">Preview & Save</Button>
            </div>
          </form>
        </Form>
      )}

      {/* Preview and Confirmation Dialog */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Preview Personal Details</AlertDialogTitle>
            <AlertDialogDescription>
              Please review your information carefully. You cannot change this information again once saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {previewData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>First Name:</strong> {formatDisplayValue(previewData.firstName, 'text')}</div>
                <div><strong>Middle Name:</strong> {formatDisplayValue(previewData.middleName, 'text')}</div>
                <div><strong>Last Name:</strong> {formatDisplayValue(previewData.lastName, 'text')}</div>
                <div><strong>Email:</strong> {formatDisplayValue(previewData.email, 'text')}</div>
                <div><strong>Mobile:</strong> {formatDisplayValue(previewData.mobile, 'text')}</div>
                <div><strong>Aadhaar Number:</strong> {formatDisplayValue(previewData.aadhaarNumber, 'text')}</div>
                <div><strong>PAN Card:</strong> {formatDisplayValue(previewData.panCardNumber, 'text')}</div>
                <div><strong>Gender:</strong> {formatDisplayValue(previewData.gender, 'select')}</div>
                <div><strong>Date of Birth:</strong> {formatDisplayValue(previewData.dateOfBirth, 'date')}</div>
                <div><strong>Marital Status:</strong> {formatDisplayValue(previewData.maritalStatus, 'select')}</div>
                <div className="md:col-span-2"><strong>Street Address:</strong> {formatDisplayValue(previewData.streetAddress, 'text')}</div>
                <div><strong>Pin Code:</strong> {formatDisplayValue(previewData.pinCode, 'text')}</div>
                <div><strong>Country:</strong> {formatDisplayValue(previewData.country, 'text')}</div>
                <div><strong>State:</strong> {formatDisplayValue(previewData.state, 'text')}</div>
                <div><strong>District:</strong> {formatDisplayValue(previewData.district, 'text')}</div>
                <div><strong>City:</strong> {formatDisplayValue(previewData.city, 'text')}</div>
                <div><strong>Residence Type:</strong> {formatDisplayValue(previewData.residenceType, 'select')}</div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  ⚠️ Important: You cannot change this information again once saved. Please verify all details carefully.
                </p>
              </div>
            </div>
          )}
          
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

export default PersonalDetailsForm;
