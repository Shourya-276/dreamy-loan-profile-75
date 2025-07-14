
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLoan } from "../../../contexts/LoanContext";
import { toast } from "sonner";
import axios from "axios";

const personalDetailsSchema = z.object({
  name: z.string().min(1, "Name is required"),
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
  alternateMobile: z.string().optional(),
  aadhaar: z.string().min(12, "Aadhaar number must be 12 digits"),
  pan: z.string().min(10, "PAN must be 10 characters"),
  gender: z.string().min(1, "Please select gender"),
  dateOfBirth: z.date({
    required_error: "Please select a date of birth",
  }),
  maritalStatus: z.string().min(1, "Please select marital status"),
  streetAddress: z.string().min(1, "Street address is required"),
  pinCode: z.string().min(6, "Pin code must be 6 digits"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  residenceType: z.string().min(1, "Please select residence type"),
});

type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;

const PersonalDetailsForm = () => {
  const { application, savePersonalDetails } = useLoan();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      name: application?.personalDetails?.firstName || "",
      middleName: application?.personalDetails?.middleName || "",
      lastName: application?.personalDetails?.lastName || "",
      email: application?.personalDetails?.email || "",
      mobile: application?.personalDetails?.mobile || "",
      alternateMobile: application?.personalDetails?.alternateMobile || "",
      aadhaar: application?.personalDetails?.aadhaarNumber || "",
      pan: application?.personalDetails?.panCardNumber || "",
      gender: application?.personalDetails?.gender || "",
      dateOfBirth: application?.personalDetails?.dateOfBirth ? new Date(application.personalDetails.dateOfBirth) : undefined,
      maritalStatus: application?.personalDetails?.maritalStatus || "",
      streetAddress: application?.personalDetails?.streetAddress || "",
      pinCode: application?.personalDetails?.pinCode || "",
      country: application?.personalDetails?.country || "",
      state: application?.personalDetails?.state || "",
      district: application?.personalDetails?.district || "",
      city: application?.personalDetails?.city || "",
      residenceType: application?.personalDetails?.residenceType || "",
    },
  });

  const onSubmit = (data: PersonalDetailsFormData) => {
    const personalDetails = {
      firstName: data.name,
      middleName: data.middleName || "",
      lastName: data.lastName,
      email: data.email,
      mobile: data.mobile,
      alternateMobile: data.alternateMobile || "",
      aadhaarNumber: data.aadhaar,
      panCardNumber: data.pan,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth.toISOString(),
      maritalStatus: data.maritalStatus,
      streetAddress: data.streetAddress,
      pinCode: data.pinCode,
      country: data.country,
      state: data.state,
      district: data.district,
      city: data.city,
      residenceType: data.residenceType,
    };

    
    
    savePersonalDetails(personalDetails);
    toast.success("Personal details saved successfully!");
  };

  const handleClear = () => {
    form.reset({
      name: "",
      middleName: "",
      lastName: "",
      email: "",
      mobile: "",
      alternateMobile: "",
      aadhaar: "",
      pan: "",
      gender: "",
      dateOfBirth: undefined,
      maritalStatus: "",
      streetAddress: "",
      pinCode: "",
      country: "",
      state: "",
      district: "",
      city: "",
      residenceType: "",
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Personal Details</h2>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">First Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter first name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="middleName">Middle Name</Label>
            <Input
              id="middleName"
              {...form.register("middleName")}
              placeholder="Enter middle name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              {...form.register("lastName")}
              placeholder="Enter last name"
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Enter email address"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              {...form.register("mobile")}
              placeholder="Enter mobile number"
            />
            {form.formState.errors.mobile && (
              <p className="text-sm text-red-600">{form.formState.errors.mobile.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alternateMobile">Alternate Mobile Number</Label>
            <Input
              id="alternateMobile"
              {...form.register("alternateMobile")}
              placeholder="Enter alternate mobile number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aadhaar">Aadhaar Number</Label>
            <Input
              id="aadhaar"
              {...form.register("aadhaar")}
              placeholder="Enter Aadhaar number"
            />
            {form.formState.errors.aadhaar && (
              <p className="text-sm text-red-600">{form.formState.errors.aadhaar.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pan">PAN Card Number</Label>
            <Input
              id="pan"
              {...form.register("pan")}
              placeholder="Enter PAN number"
            />
            {form.formState.errors.pan && (
              <p className="text-sm text-red-600">{form.formState.errors.pan.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={form.watch("gender")} onValueChange={(value) => form.setValue("gender", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.gender && (
              <p className="text-sm text-red-600">{form.formState.errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.watch("dateOfBirth") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("dateOfBirth") ? (
                    format(form.watch("dateOfBirth"), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.watch("dateOfBirth")}
                  onSelect={(date) => {
                    form.setValue("dateOfBirth", date);
                    setIsCalendarOpen(false);
                  }}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.dateOfBirth && (
              <p className="text-sm text-red-600">{form.formState.errors.dateOfBirth.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select value={form.watch("maritalStatus")} onValueChange={(value) => form.setValue("maritalStatus", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.maritalStatus && (
              <p className="text-sm text-red-600">{form.formState.errors.maritalStatus.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="streetAddress">Street Address</Label>
          <Input
            id="streetAddress"
            {...form.register("streetAddress")}
            placeholder="Enter street address"
          />
          {form.formState.errors.streetAddress && (
            <p className="text-sm text-red-600">{form.formState.errors.streetAddress.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="pinCode">Pin Code</Label>
            <Input
              id="pinCode"
              {...form.register("pinCode")}
              placeholder="Enter pin code"
            />
            {form.formState.errors.pinCode && (
              <p className="text-sm text-red-600">{form.formState.errors.pinCode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...form.register("country")}
              placeholder="Enter country"
            />
            {form.formState.errors.country && (
              <p className="text-sm text-red-600">{form.formState.errors.country.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              {...form.register("state")}
              placeholder="Enter state"
            />
            {form.formState.errors.state && (
              <p className="text-sm text-red-600">{form.formState.errors.state.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              {...form.register("district")}
              placeholder="Enter district"
            />
            {form.formState.errors.district && (
              <p className="text-sm text-red-600">{form.formState.errors.district.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...form.register("city")}
              placeholder="Enter city"
            />
            {form.formState.errors.city && (
              <p className="text-sm text-red-600">{form.formState.errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="residenceType">Residence Type</Label>
            <Select value={form.watch("residenceType")} onValueChange={(value) => form.setValue("residenceType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select residence type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owned">Owned</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="family">Family Owned</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.residenceType && (
              <p className="text-sm text-red-600">{form.formState.errors.residenceType.message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button type="submit">
            Save & Continue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetailsForm;
