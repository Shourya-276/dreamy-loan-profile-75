import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoan } from "../../contexts/LoanContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import CoApplicantForm from "./CoApplicantForm";
import happyCoupleImage from "../../assets/images/happy-couple.png";

// Updated loan type options - added "commercial-loan" option
const finalLoanTypeOptions = [
  { value: "home-loan", label: "Home Loan" },
  { value: "balance-transfer", label: "Balance Transfer" },
  { value: "top-up-loan", label: "Top Up Loan" },
  { value: "lap-mortgage-loan", label: "LAP-Mortgage Loan" },
  { value: "commercial-loan", label: "Commercial Loan" },
];
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { loanTypeOptions } from "@/utils/formOptions";
import { toast } from "sonner";
import { downloadSanctionLetter } from "@/lib/utils";

interface CoApplicantSummaryProps {
  details: any;
  onRemove: () => void;
}

const CoApplicantSummary: React.FC<CoApplicantSummaryProps> = ({ details, onRemove }) => {
  const pd = details.personalDetails;
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-muted/50 p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="font-semibold text-sm">{pd.firstName || pd.name} {pd.lastName}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{pd.relationshipToApplicant}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{pd.email}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Mob: {pd.mobile}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} className="shrink-0">
          <X size={18} />
        </Button>
      </div>
    </div>
  );
};

const FinalStepForm = ({ prefillData }: { prefillData: any }) => {
  const navigate = useNavigate();
  const { application, saveLoanType, checkEligibility, clearCurrentStep, saveCoApplicantDetails } = useLoan();
  const { user } = useAuth();
  const [loanType, setLoanType] = useState<string>(application.loanType || "");
  const [showCoApplicant, setShowCoApplicant] = useState<boolean>(false);
  const [coApplicants, setCoApplicants] = useState<any[]>([]);
  const [showCongratulations, setShowCongratulations] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [eligibilityInfo, setEligibilityInfo] = useState<any>(null);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);
  const [isLoadingEligibility, setIsLoadingEligibility] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  let customerId = null;
    // console.log("prefillData", prefillData);
    // console.log("user", user);
  
  if (prefillData) {
    customerId = prefillData.userId;
  }

  // Auto-fetch existing co-applicants for this user
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const apiId = customerId || user?.id;
        const resp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/co-applicants/${apiId}`);
        if (Array.isArray(resp.data) && resp.data.length > 0) {
          setCoApplicants(resp.data);
        }
      } catch (err) {
        // ignore fetch errors
      }
    })();
  }, [user?.id]);

  const handleLoanTypeChange = (value: string) => {
    // Ensure loanType is a non-empty string
    if (value) {
      console.log(value);
      setLoanType(value);
      saveLoanType(value);
    }
  };

  const handleCheckEligibility = async () => {
    if (!loanType) {
      alert("Please select a loan type");
      return;
    }
    try {
      setIsLoading(true);
      const resp = await axios.post(`${import.meta.env.VITE_SERVER_URL}/co-applicants`, {
        userId: customerId || user?.id,
        salesManagerId: user?.role === "salesmanager" ? user?.id : null,
        loanType,
        coApplicants,
      });
      saveLoanType(loanType);
      saveCoApplicantDetails(coApplicants[coApplicants.length - 1]);
      // Get userId from backend response (if present)
      const returnedUserId = resp.data?.userId || user?.id;
      // console.log("returnedUserId", returnedUserId);
      setUserId(returnedUserId);
      // Fetch eligibility info
      const eligibilityResp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/loan-offers/lfi-sanctions/${returnedUserId}`);
      // console.log("eligibilityResp", eligibilityResp);
      if (eligibilityResp.data && eligibilityResp.data.sanctions && eligibilityResp.data.sanctions.length > 0) {
        setUserId(returnedUserId);
        setShowCongratulations(true);
        setTimeout(() => {
          setShowConfetti(true);
          setShowSuccessAnimation(true);
        }, 500);
      } else {
        // Show error or fallback
        alert('User is not eligible for a loan.');
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save loan/co-applicant details");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch eligibility info when userId and congratulations page is showing
  useEffect(() => {
    if (!userId || !showCongratulations) return;
    const fetchEligibility = async () => {
      try {
        setIsLoadingEligibility(true);
        setEligibilityError(null);
        let resp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/loan-offers/lfi-sanctions/${userId}`);
        if (
          resp.data?.sanctions?.length === 0 ||
          resp.data?.message === "No active LFI sanctions found"
        ) {
          // Trigger calculation endpoint
          await axios.get(`${import.meta.env.VITE_SERVER_URL}/loan-offers/${userId}`);
          // Fetch again
          resp = await axios.get(`${import.meta.env.VITE_SERVER_URL}/loan-offers/lfi-sanctions/${userId}`);
        }
        setEligibilityInfo(resp.data);
      } catch (err) {
        setEligibilityError("Failed to load loan eligibility data");
        setEligibilityInfo({ amountRangeFormatted: "₹50,00,000 - ₹90,00,000", maxAmountFormatted: "₹90,00,000", sanctions: [], count: 0 });
      } finally {
        setIsLoadingEligibility(false);
      }
    };
    fetchEligibility();
  }, [userId, showCongratulations]);

  const handleExploreOffers = () => {
    if (userId) {
      navigate("/sales-manager-loan-offers", { state: { userId } });
    } else {
      toast.error("User ID not found for loan offers.");
    }
  };

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
            opacity: 1,
          }}
        />
      );
    }
    
    return confettiElements;
  };

  // Show congratulations page for sales manager
  if (showCongratulations) {
    return (
      <div className="relative">
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
            {isLoadingEligibility ? (
              <p className="text-4xl font-bold text-brand-purple animate-pulse">Loading...</p>
            ) : (
              <p className="text-4xl font-bold text-brand-purple animate-pulse">{eligibilityInfo?.amountRangeFormatted || "₹50 Lakh - ₹90 Lakh"}</p>
            )}
          </div>
          {eligibilityError && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">⚠️ {eligibilityError}</p>
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
              onClick={() => userId && downloadSanctionLetter(userId, toast, setIsDownloading)}
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
        </div>
      </div>
    );
  }

  // Show loading state for sales manager
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-t-brand-purple border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-6 text-lg">Checking customer eligibility...</p>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Please wait while we process the application</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Final Step</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="loanType" className="block text-sm font-medium">
            Select Loan Type
          </label>
          <Select value={loanType} onValueChange={handleLoanTypeChange}>
            <SelectTrigger id="loanType">
              <SelectValue placeholder="Select Loan Type" />
            </SelectTrigger>
            <SelectContent>
              {finalLoanTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowCoApplicant(true)}
            className="w-full flex items-center justify-center gap-2"
            disabled={coApplicants.length >= 2}
          >
            <Plus size={18} />
            {coApplicants.length === 0 ? "Add a co-applicant" : "Add another co-applicant"}
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400">Optional (max 2)</p>
        </div>

        {showCoApplicant && coApplicants.length < 2 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
             <CoApplicantForm 
               onClose={() => setShowCoApplicant(false)}
               onSubmit={(details) => {
                // console.log("details", details);
                 setCoApplicants(prev => [...prev, details]);
                 setShowCoApplicant(false);
               }}
               customerId={customerId || user?.id}
             />
           </div>
         )}

        {coApplicants.map((app, idx) => (
          <CoApplicantSummary 
            key={idx}
            details={app}
            onRemove={() => setCoApplicants(prev => prev.filter((_, i) => i !== idx))}
          />
        ))}

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={clearCurrentStep}>
            Clear
          </Button>
          <Button type="button" onClick={handleCheckEligibility}>
            Check Eligibility
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinalStepForm;
