import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoan } from "../../contexts/LoanContext";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { 
  propertyStatusOptions,
  propertyTypeOptions,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Define schema for property details
const propertySchema = z.object({
  isPropertySelected: z.boolean(),
  propertyStatus: z.string().optional(),
  propertyType: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  streetAddress: z.string().optional(),
  buildingName: z.string().optional(),
  wing: z.string().optional(),
  flatNumber: z.string().optional(),
  floorNumber: z.string().optional(),
  carpetArea: z.string().optional(),
  agreementValue: z.string().optional(),
  gstCharges: z.string().optional(),
  otherCharges: z.string().optional(),
  stampDuty: z.string().optional(),
  registrationFees: z.string().optional(),
});

type PropertyDetailsFormValues = z.infer<typeof propertySchema>;

const PropertyDetailsForm = ({ prefillData }: { prefillData: any }) => {
  const { application, savePropertyDetails, clearCurrentStep } = useLoan();
  const { user } = useAuth();
  const [isPropertySelected, setIsPropertySelected] = useState<boolean>(
    application.propertyDetails?.isPropertySelected ?? false
  );
  let customerId = null;
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(
    application.propertyDetails?.district
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (prefillData) {
    customerId = prefillData.userId;
  }

  const defaultValues: PropertyDetailsFormValues = {
    isPropertySelected: application.propertyDetails?.isPropertySelected ?? false,
    propertyStatus: application.propertyDetails?.propertyStatus || "",
    propertyType: application.propertyDetails?.propertyType || "",
    country: application.propertyDetails?.country || "india",
    state: application.propertyDetails?.state || "",
    district: application.propertyDetails?.district || "",
    city: application.propertyDetails?.city || "",
    streetAddress: application.propertyDetails?.streetAddress || "",
    buildingName: application.propertyDetails?.buildingName || "",
    wing: application.propertyDetails?.wing || "",
    flatNumber: application.propertyDetails?.flatNumber || "",
    floorNumber: application.propertyDetails?.floorNumber || "",
    carpetArea: application.propertyDetails?.carpetArea || "",
    agreementValue: application.propertyDetails?.agreementValue || "",
    gstCharges: application.propertyDetails?.gstCharges || "",
    otherCharges: application.propertyDetails?.otherCharges || "",
    stampDuty: application.propertyDetails?.stampDuty || "",
    registrationFees: application.propertyDetails?.registrationFees || "",
  };

  const form = useForm<PropertyDetailsFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues,
  });

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const apiId = customerId || user?.id;
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/property-details/${apiId}`);
        const data = response.data;
        if (data) {
          form.reset({
            isPropertySelected: data.is_property_selected,
            propertyStatus: data.property_status || "",
            propertyType: data.property_type || "",
            country: data.country || "india",
            state: data.state || "",
            district: data.district || "",
            city: data.city || "",
            streetAddress: data.street_address || "",
            buildingName: data.building_name || "",
            wing: data.wing || "",
            flatNumber: data.flat_number || "",
            floorNumber: data.floor_number || "",
            carpetArea: data.carpet_area || "",
            agreementValue: data.agreement_value || "",
            gstCharges: data.gst_charges || "",
            otherCharges: data.other_charges || "",
            stampDuty: data.stamp_duty || "",
            registrationFees: data.registration_fees || "",
          });
          setIsPropertySelected(data.is_property_selected);
          setSelectedDistrict(data.district || undefined);
        }
      } catch (err) {
        // If 404, do nothing (no property details yet)
        if (err.response && err.response.status === 404) {
          // No property details found
        } else {
          setError("Failed to fetch property details");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onSubmit = async (data: PropertyDetailsFormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        userId: customerId || user?.id,
        ...data,
        isPropertySelected,
      };
      await axios.post(`${import.meta.env.VITE_SERVER_URL}/property-details`, payload);
      setSuccess("Property details saved successfully");
      savePropertyDetails({ ...data, isPropertySelected });
    } catch (err: any) {
      setError("Failed to save property details");
    } finally {
      setLoading(false);
    }
  };

  const handlePropertySelectionChange = (value: string) => {
    const selected = value === "yes";
    setIsPropertySelected(selected);
    form.setValue("isPropertySelected", selected);
  };
  
  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    form.setValue("district", value);
    form.setValue("city", ""); // Reset city when district changes
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Property Details</h2>
      {loading && <div className="text-blue-600 mb-2">Saving...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormLabel>Property selected?</FormLabel>
            <RadioGroup 
              defaultValue={isPropertySelected ? "yes" : "no"} 
              onValueChange={handlePropertySelectionChange}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <label htmlFor="yes">Yes</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <label htmlFor="no">No</label>
              </div>
            </RadioGroup>
          </div>

          {isPropertySelected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Status */}
              <FormField
                control={form.control}
                name="propertyStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Property Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyStatusOptions.map((option) => (
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

              {/* Property Type */}
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Property Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypeOptions.map((option) => (
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

              {/* Country */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countryOptions.map((option) => (
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

              {/* State */}
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stateOptions.map((option) => (
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

              {/* District */}
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select onValueChange={(value) => handleDistrictChange(value)} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {districtOptions.map((option) => (
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

              {/* City */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedDistrict}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedDistrict && 
                          cityOptions[selectedDistrict as keyof typeof cityOptions]?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        }
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
                  <FormItem className="col-span-2">
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Building/Project Name */}
              <FormField
                control={form.control}
                name="buildingName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building/Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Building/Project Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Wing */}
              <FormField
                control={form.control}
                name="wing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wing</FormLabel>
                    <FormControl>
                      <Input placeholder="Wing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Flat Number */}
              <FormField
                control={form.control}
                name="flatNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flat Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Flat Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Floor Number */}
              <FormField
                control={form.control}
                name="floorNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Floor Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* RERA Carpet (Sq.ft.) */}
              <FormField
                control={form.control}
                name="carpetArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RERA Carpet - Sq.ft.</FormLabel>
                    <FormControl>
                      <Input placeholder="RERA Carpet Area" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Agreement Value */}
              <FormField
                control={form.control}
                name="agreementValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>₹ Agreement Value</FormLabel>
                    <FormControl>
                      <Input placeholder="Agreement Value" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* GST Charges */}
              <FormField
                control={form.control}
                name="gstCharges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>₹ GST Charges</FormLabel>
                    <FormControl>
                      <Input placeholder="GST Charges" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Other Charges */}
              <FormField
                control={form.control}
                name="otherCharges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>₹ Other Charges</FormLabel>
                    <FormControl>
                      <Input placeholder="Other Charges" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stamp Duty */}
              <FormField
                control={form.control}
                name="stampDuty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>₹ Stamp Duty</FormLabel>
                    <FormControl>
                      <Input placeholder="Stamp Duty" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Registration fees */}
              <FormField
                control={form.control}
                name="registrationFees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>₹ Registration fees</FormLabel>
                    <FormControl>
                      <Input placeholder="Registration fees" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => clearCurrentStep()}>
              Clear
            </Button>
            <Button type="submit">Save & Next</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PropertyDetailsForm;
