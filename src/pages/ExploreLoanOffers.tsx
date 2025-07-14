
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useLoan } from "../contexts/LoanContext";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import EMICalculator from "../components/EMICalculator";
import DocumentChecklistOverlay from "../components/DocumentChecklistOverlay";

interface LoanOffer {
  bank: string;
  logo: string;
  maxAmount: string;
  tenure: string;
  interestRate: string;
  maxEMI: string;
  totalEMI?: string;
  note?: string;
  status?: string;
}

const ExploreLoanOffers = () => {
  const { application, selectOffer } = useLoan();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<LoanOffer[]>([]);

  // EMI Calculator and Document Checklist Overlay
  const [isEMICalculatorOpen, setIsEMICalculatorOpen] = useState(false);
  const [isDocumentChecklistOpen, setIsDocumentChecklistOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    axios
      .get(`${import.meta.env.VITE_SERVER_URL}/loan-offers/${user.id}`)
      .then((res) => {
        console.log(res.data);
        const data = res.data;
        if (Array.isArray(data)) {
          // Transform API data to match our enhanced offer structure
          const enhancedOffers = data.map((offer: LoanOffer) => ({
            ...offer,
            maxEMI: offer.totalEMI || offer.maxEMI || "N/A",
            tenure: offer.tenure || "360 months",
            note: offer.bank === "HDFC bank" ? "💡 This bank is most preferred by users!" :
                  offer.bank === "SBI bank" ? "🔒 Most trusted by users!" :
                  undefined
          }));
          setOffers(enhancedOffers);
        } else {
          setOffers([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch loan offers", err);
        setOffers([]);
      });
  }, [user?.id]);

  useEffect(() => {
    if (!application.isEligible) {
      navigate("/check-eligibility");
      return;
    }
  }, [application.isEligible, navigate]);

  const handleApply = (offer: LoanOffer) => {
    selectOffer(offer);
    navigate("/apply-loan");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Choose the Best Loan Offer for You!</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Compare interest rates and loan Amount to find your perfect match</p>
        </div>

        <div className="space-y-4">
          {offers.map((offer, index) => (
            <div key={index} className="space-y-2">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Bank Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 border">
                      <img 
                        src={offer.logo}
                        alt={offer.bank} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{offer.bank}</h3>
                  </div>
                  
                  {/* Offer Details */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Max. Loan Amt.</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{offer.maxAmount}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tenure</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{offer.tenure}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Int. Rate Starts From</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{offer.interestRate}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Max EMI</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{offer.maxEMI}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 lg:min-w-[200px]">
                    <Button 
                      variant="outline" 
                      className="text-xs px-3 py-2 h-8"
                      onClick={() => setIsDocumentChecklistOpen(true)}
                    >
                      Details
                    </Button>
                    
                    <Dialog open={isEMICalculatorOpen} onOpenChange={setIsEMICalculatorOpen}>
                      <Button variant="outline" className="text-xs px-3 py-2 h-8" onClick={() => setIsEMICalculatorOpen(true)}>
                        EMI Calculator
                      </Button>
                      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto p-0">
                        <EMICalculator />
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      className="bg-brand-purple hover:bg-brand-purple/90 text-xs px-4 py-2 h-8"
                      onClick={() => handleApply(offer)}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
                
                {/* User-facing note */}
                {offer.note && (
                  <div className="mt-4">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{offer.note}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-center mt-6">
            <Button variant="outline" className="text-sm">
              Show more offers
            </Button>
          </div>
        </div>
      </div>

      {/* Document Checklist Overlay */}
      <DocumentChecklistOverlay 
        isOpen={isDocumentChecklistOpen}
        onClose={() => setIsDocumentChecklistOpen(false)}
      />
    </Layout>
  );
};

export default ExploreLoanOffers;
