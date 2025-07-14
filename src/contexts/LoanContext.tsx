
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface PersonalDetails {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobile: string;
  alternateMobile?: string;
  aadhaarNumber: string;
  panCardNumber: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  streetAddress: string;
  pinCode: string;
  country: string;
  state: string;
  district: string;
  city: string;
  residenceType: string;
}

export interface EmployedIncomeDetails {
  employmentType: string;
  employerType: string;
  grossSalary: number;
  netSalary: number;
  rentIncome: number;
  annualBonus: number;
  monthlyIncentive: number;
  pension: number;
  existingLoan: string;
  existingLoans: {
    type: string;
    emiRate: number;
    outstandingAmount: number;
    balanceTenure: number;
  }[];
}

export interface SelfEmployedIncomeDetails {
  employmentType: string;
  grossITRIncome: number;
  netITRIncome: number;
  rentIncome: number;
  gstReturn: number;
  existingLoan: string;
  existingLoans: {
    type: string;
    emiRate: number;
    outstandingAmount: number;
    balanceTenure: number;
  }[];
}

export type IncomeDetails = EmployedIncomeDetails | SelfEmployedIncomeDetails;

export interface PropertyDetails {
  isPropertySelected: boolean;
  propertyStatus?: string;
  propertyType?: string;
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  streetAddress?: string;
  buildingName?: string;
  wing?: string;
  flatNumber?: string;
  floorNumber?: string;
  carpetArea?: string;
  agreementValue?: string;
  gstCharges?: string;
  otherCharges?: string;
  stampDuty?: string;
  registrationFees?: string;
}

export interface CoApplicantDetails {
  personalDetails: PersonalDetails;
  incomeDetails: IncomeDetails;
}

interface LoanApplication {
  personalDetails: PersonalDetails | null;
  incomeDetails: IncomeDetails | null;
  propertyDetails: PropertyDetails | null;
  coApplicant: CoApplicantDetails | null;
  loanType: string | null;
  formStep: number;
  isEligible: boolean;
  maxLoanAmount: string;
  amountRangeFormatted: string;
  selectedOffer: {
    bank: string;
    maxAmount: string;
    tenure: string;
    interestRate: string;
  } | null;
}

interface LoanContextType {
  application: LoanApplication;
  savePersonalDetails: (data: PersonalDetails, advanceStep?: boolean, showToast?: boolean) => void;
  saveIncomeDetails: (data: IncomeDetails) => void;
  savePropertyDetails: (data: PropertyDetails) => void;
  saveCoApplicantDetails: (data: CoApplicantDetails) => void;
  saveLoanType: (type: string) => void;
  checkEligibility: () => Promise<boolean>;
  resetApplication: () => void;
  clearCurrentStep: () => void;
  selectOffer: (offer: any) => void;
  goToPreviousStep: () => void;
  isProfileComplete: () => boolean;
  updateApplication: (newApplication: Partial<LoanApplication>) => void;
  prefillApplication: (prefillData: any) => void;
}

// Fixed default value to ensure it's not null or undefined
const defaultLoanApplication: LoanApplication = {
  personalDetails: null,
  incomeDetails: null,
  propertyDetails: null,
  coApplicant: null,
  loanType: null,
  formStep: 1,
  isEligible: false,
  maxLoanAmount: "",
  amountRangeFormatted: "",
  selectedOffer: null,
};

// Ensure context always has a default value
const LoanContext = createContext<LoanContextType>({
  application: defaultLoanApplication,
  savePersonalDetails: () => {},
  saveIncomeDetails: () => {},
  savePropertyDetails: () => {},
  saveCoApplicantDetails: () => {},
  saveLoanType: () => {},
  checkEligibility: async () => false,
  resetApplication: () => {},
  clearCurrentStep: () => {},
  selectOffer: () => {},
  goToPreviousStep: () => {},
  isProfileComplete: () => false,
  updateApplication: () => {},
  prefillApplication: () => {},
});

export const useLoan = () => {
  const context = useContext(LoanContext);
  // No longer throw an error if used outside provider
  // Instead return the default context
  return context;
};

export const LoanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [application, setApplication] = useState<LoanApplication>(defaultLoanApplication);

  useEffect(() => {
    try {
      const storedApp = localStorage.getItem("loanApplication");
      if (storedApp) {
        setApplication(JSON.parse(storedApp));
      }
    } catch (error) {
      console.error("Error loading application from localStorage:", error);
      // If there's an error loading from localStorage, use the default
      setApplication(defaultLoanApplication);
    }
  }, []);

  const updateApplication = (newApplication: Partial<LoanApplication>) => {
    try {
      const updated = { ...application, ...newApplication };
      setApplication(updated);
      localStorage.setItem("loanApplication", JSON.stringify(updated));
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Failed to save application data");
    }
  };

  const savePersonalDetails = (data: PersonalDetails, advanceStep: boolean = true, showToast: boolean = true) => {
    if (advanceStep) {
      updateApplication({ personalDetails: data, formStep: 2 });
    } else {
      updateApplication({ personalDetails: data });
    }
    if (showToast) {
      toast.success("Personal details saved successfully!");
    }
  };

  const saveIncomeDetails = (data: IncomeDetails) => {
    updateApplication({ incomeDetails: data, formStep: 3 });
    toast.success("Income details saved successfully!");
  };

  const savePropertyDetails = (data: PropertyDetails) => {
    updateApplication({ propertyDetails: data, formStep: 4 });
    toast.success("Property details saved successfully!");
  };

  const saveCoApplicantDetails = (data: CoApplicantDetails) => {
    updateApplication({ coApplicant: data });
    toast.success("Co-applicant details saved successfully!");
  };

  const saveLoanType = (type: string) => {
    updateApplication({ loanType: type });
  };

  const checkEligibility = async (): Promise<boolean> => {
    try {
      // Simulate API check
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, always approve with a random loan amount
      const randomAmount = Math.floor(Math.random() * 40) + 50;
      updateApplication({ isEligible: true, maxLoanAmount: `₹${randomAmount} Lakh to ₹90 lakh` });
      return true;
    } catch (error) {
      console.error("Error checking eligibility:", error);
      toast.error("Failed to check eligibility");
      return false;
    }
  };

  const resetApplication = () => {
    setApplication(defaultLoanApplication);
    localStorage.removeItem("loanApplication");
  };

  const clearCurrentStep = () => {
    const currentStep = application.formStep;
    
    if (currentStep === 2) {
      updateApplication({ incomeDetails: null, formStep: 1 });
      toast.info("Income details cleared");
    } else if (currentStep === 3) {
      updateApplication({ propertyDetails: null, formStep: 2 });
      toast.info("Property details cleared");
    } else if (currentStep === 4) {
      updateApplication({ formStep: 3 });
      toast.info("Final step cleared");
    }
  };

  const goToPreviousStep = () => {
    const currentStep = application.formStep;
    if (currentStep > 1) {
      updateApplication({ formStep: currentStep - 1 });
    }
  };

  const selectOffer = (offer: any) => {
    updateApplication({ selectedOffer: offer });
    toast.success("Loan offer selected!");
  };
  
  const isProfileComplete = () => {
    return !!(application.personalDetails && application.incomeDetails && application.propertyDetails);
  };

  const prefillApplication = (prefillData: any) => {
    try {
      if (!prefillData) return;

      const { personal, income, existingLoans } = prefillData;
      
      // Map backend personal details to frontend format
      const personalDetails: PersonalDetails | null = personal ? {
        firstName: personal.first_name || '',
        middleName: personal.middle_name || '',
        lastName: personal.last_name || '',
        email: personal.email || '',
        mobile: personal.mobile || '',
        alternateMobile: personal.alternate_mobile || '',
        aadhaarNumber: personal.aadhaar_number || '',
        panCardNumber: personal.pan_card_number || '',
        gender: personal.gender || '',
        dateOfBirth: personal.date_of_birth || '',
        maritalStatus: personal.marital_status || '',
        streetAddress: personal.street_address || '',
        pinCode: personal.pin_code || '',
        country: personal.country || '',
        state: personal.state || '',
        district: personal.district || '',
        city: personal.city || '',
        residenceType: personal.residence_type || '',
      } : null;

      // Map backend income details to frontend format
      const incomeDetails: IncomeDetails | null = income ? {
        employmentType: income.employment_type || '',
        employerType: income.employer_type || '',
        grossSalary: income.gross_salary || 0,
        netSalary: income.net_salary || 0,
        rentIncome: income.rent_income || 0,
        annualBonus: income.annual_bonus || 0,
        monthlyIncentive: income.monthly_incentive || 0,
        pension: income.pension || 0,
        grossITRIncome: income.gross_itr_income || 0,
        netITRIncome: income.net_itr_income || 0,
        gstReturn: income.gst_return || 0,
        existingLoan: income.existing_loan ? 'yes' : 'no',
        existingLoans: Array.isArray(existingLoans) ? existingLoans.map((loan: any) => ({
          type: loan.type || '',
          emiRate: loan.emi_rate || 0,
          outstandingAmount: loan.outstanding_amount || 0,
          balanceTenure: loan.balance_tenure || 0,
        })) : [],
      } as IncomeDetails : null;

      // Update application with prefilled data
      const prefilled: Partial<LoanApplication> = {
        personalDetails,
        incomeDetails,
        formStep: 1, // Start from first step
      };

      updateApplication(prefilled);
      toast.success("Customer data loaded successfully!");

    } catch (error) {
      console.error("Error prefilling application:", error);
      toast.error("Failed to load customer data");
    }
  };

  const value: LoanContextType = {
    application,
    savePersonalDetails,
    saveIncomeDetails,
    savePropertyDetails,
    saveCoApplicantDetails,
    saveLoanType,
    checkEligibility,
    resetApplication,
    clearCurrentStep,
    selectOffer,
    goToPreviousStep,
    isProfileComplete,
    updateApplication,
    prefillApplication,
  };

  return <LoanContext.Provider value={value}>{children}</LoanContext.Provider>;
};
