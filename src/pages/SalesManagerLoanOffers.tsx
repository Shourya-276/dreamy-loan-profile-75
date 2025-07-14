import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EMICalculator from "../components/EMICalculator";
import DocumentChecklistOverlay from "../components/DocumentChecklistOverlay";
import Layout from "../components/Layout";
import axios from "axios";

interface LoanOffer {
  bank: string;
  logo: string;
  maxAmount: string;
  tenure: string;
  interestRate: string;
  maxEMI: string;
  note?: string;
}

interface FormData {
  name: string;
  lastName: string;
  [key: string]: any;
}

const fallbackOffers: LoanOffer[] = [
  {
    bank: "HDFC bank",
    logo: "https://companieslogo.com/img/orig/HDB-bb6241fe.png?t=1720244492",
    maxAmount: "₹53 lakhs",
    tenure: "360 months",
    interestRate: "8.15% p.a",
    maxEMI: "₹53000",
    note: "💡 This bank is most preferred by users!"
  },
  {
    bank: "Bank of Baroda",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYxD84WIHwHdkTykFfZX2T87moCZ-eKNtHOg&s",
    maxAmount: "₹53 lakhs",
    tenure: "360 months",
    interestRate: "8.15% p.a",
    maxEMI: "₹53000"
  },
  {
    bank: "SBI bank",
    logo: "https://thebranvetica.com/assets/img/SBI_Logo.webp",
    maxAmount: "₹76 lakhs",
    tenure: "360 months",
    interestRate: "8.10% p.a",
    maxEMI: "₹76000",
    note: "🔒 Most trusted by users!"
  },
  {
    bank: "ICICI bank",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpjg6bDq3NiLwZGv9MMILjIzOe2tBwWJgRFQ&s",
    maxAmount: "₹65 lakhs",
    tenure: "240 months",
    interestRate: "8.40% p.a",
    maxEMI: "₹65000"
  }
];

const SalesManagerLoanOffers: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<LoanOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmiOffer, setSelectedEmiOffer] = useState<LoanOffer | null>(null);
  const [isDocumentChecklistOpen, setIsDocumentChecklistOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = location.state?.userId as string | undefined;
  const formData = location.state?.formData as FormData | undefined;
  const customer = location.state?.customer;
  console.log("location.state sads", location.state);

  const fetchLoanOffers = async () => {
    if (!formData) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post<LoanOffer[]>(
        `${import.meta.env.VITE_SERVER_URL}/loan-offers/sales-manager-check`,
        formData
      );
      setOffers(response.data);
    } catch (error) {
      console.error("Error fetching loan offers:", error);
      setError("Failed to fetch loan offers. Using fallback data.");
      setOffers(fallbackOffers);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLoanOffersForUser = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/loan-offers/${userId}`
      );
      // The backend returns { sanctions: [...] }
      setOffers(response.data || []);
    } catch (error) {
      console.error("Error fetching loan offers for user:", error);
      setError("Failed to fetch loan offers. Using fallback data.");
      setOffers(fallbackOffers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchLoanOffersForUser(userId);
    } else if (formData) {
      fetchLoanOffers();
    }
  }, [userId, formData]);

  const handleApply = (offer: LoanOffer) => {
    // Redirect to DocumentUpload, passing the selected customer as state
    if (customer) {
      navigate("/document", { state: { customer } });
    } else if (userId && formData) {
      // If customer is not directly available, pass userId and formData
      navigate("/document", { state: { userId, formData } });
    } else {
      navigate("/document");
    }
  };

  if (!formData && !userId) {
    return (
      <Layout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">No Form Data</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Please submit the eligibility form first.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Loan Offers for {formData?.name} {formData?.lastName}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Compare interest rates and loan Amount to find your perfect match</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm animate-pulse">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i}>
                          <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
              </div>
            )}

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
                      
                      <Dialog open={!!selectedEmiOffer} onOpenChange={(open) => { if (!open) setSelectedEmiOffer(null); }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="text-xs px-3 py-2 h-8"
                            onClick={() => setSelectedEmiOffer(offer)}
                          >
                            EMI Calculator
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto p-0">
                          {selectedEmiOffer && (
                            <EMICalculator
                              amount={parseInt((selectedEmiOffer.maxAmount || '').replace(/[^\d]/g, '')) || undefined}
                              tenure={(() => {
                                if (!selectedEmiOffer.tenure) return undefined;
                                const yearMatch = selectedEmiOffer.tenure.match(/(\d+)\s*years?/i);
                                if (yearMatch) return parseInt(yearMatch[1], 10) * 12;
                                const monthMatch = selectedEmiOffer.tenure.match(/(\d+)\s*months?/i);
                                if (monthMatch) return parseInt(monthMatch[1], 10);
                                return undefined;
                              })()}
                              interestRate={(() => {
                                if (!selectedEmiOffer.interestRate) return undefined;
                                const match = selectedEmiOffer.interestRate.match(/([\d.]+)/);
                                return match ? parseFloat(match[1]) : undefined;
                              })()}
                            />
                          )}
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
                </div>
                
                {/* User-facing note */}
                {offer.note && (
                  <div className="px-6">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{offer.note}</p>
                  </div>
                )}
              </div>
            ))}

            {offers.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No loan offers available based on the provided information.</p>
              </div>
            )}

            {offers.length > 0 && (
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  className="text-sm"
                  onClick={() => {
                    if (userId) {
                      fetchLoanOffersForUser(userId);
                    } else {
                      fetchLoanOffers();
                    }
                  }}
                >
                  Refresh offers
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Document Checklist Overlay */}
        <DocumentChecklistOverlay 
          isOpen={isDocumentChecklistOpen}
          onClose={() => setIsDocumentChecklistOpen(false)}
        />
      </div>
    </Layout>
  );
};

export default SalesManagerLoanOffers;
