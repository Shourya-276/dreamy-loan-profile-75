import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useLoan } from "../contexts/LoanContext";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import happyCoupleImage from "../assets/images/happy-couple.png";

const CheckEligibility = () => {
  const { application, updateApplication } = useLoan();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [lfiSanctions, setLfiSanctions] = useState(null);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!application.personalDetails) {
      navigate("/profile");
      return;
    }

    if (!user?.id) {
      navigate("/login");
      return;
    }

    // Fetch LFI sanctions data
    const fetchLFISanctions = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/loan-offers/lfi-sanctions/${user.id}`);

        setLfiSanctions(response.data);
        // update the application with the max loan amount
        updateApplication({
            maxLoanAmount: response.data.maxAmountFormatted,
          amountRangeFormatted: response.data.amountRangeFormatted
        });
        setError(null);
        console.log(response.data);
        console.log(application);
        
      } catch (err) {
        console.error("Error fetching LFI sanctions:", err);
        setError("Failed to load loan eligibility data");
        // Set fallback data
        setLfiSanctions({
          maxAmountFormatted: application.maxLoanAmount || "₹50,00,000",
          sanctions: [],
          count: 0
        });
      } finally {
        // Simulate loading for UX
        // const timer = setTimeout(() => {
          setIsLoading(false);
          setShowConfetti(true);
          setShowSuccessAnimation(true);
        // }, 1500);
      }
    };

    fetchLFISanctions();
  }, [application.personalDetails, user?.id, navigate]);

  const handleExploreOffers = () => {
    navigate("/explore-loan-offers");
  };

  const handleDownloadLetter = async () => {
    if (!user?.id) {
      toast.error("Please log in to download the sanction letter");
      return;
    }

    try {
      setIsDownloading(true);
      toast.info("Generating your sanction letter...");
      
      // Download PDF directly from backend
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/loan-offers/lfi-sanction-letter/${user.id}`,
        {
          responseType: 'blob', // Important for binary data
        }
      );
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'LFI_Sanction_Letter.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Sanction letter downloaded successfully!");
      
    } catch (error) {
      console.error("Error downloading sanction letter:", error);
      if (error.response?.status === 404) {
        toast.error("No active loan sanction found. Please complete your loan application first.");
      } else {
        toast.error("Failed to download sanction letter. Please try again later.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate enhanced confetti elements with better animation
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
            opacity: showConfetti ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
        />
      );
    }
    
    return confettiElements;
  };

  return (
    <Layout>
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
      
      <div className="max-w-3xl mx-auto">
        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-t-brand-purple border-gray-200 rounded-full animate-spin"></div>
              <p className="mt-6 text-lg">Checking your eligibility...</p>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Please wait while we process your application</p>
            </div>
          </div>
        ) : (
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
            <p className="text-2xl mb-8 text-green-600 dark:text-green-400 font-semibold animate-pulse">You are eligible for a loan</p>
            
            {error && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">⚠️ {error}</p>
              </div>
            )}
            
            <div className="mb-8 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg p-6 bg-green-50 dark:bg-green-900/20">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-3">🏆 You can avail a loan between</p>
              <p className="text-4xl font-bold text-brand-purple animate-pulse">{application.amountRangeFormatted}</p>
            </div>
            
            <p className="mb-8 text-gray-600 dark:text-gray-400 text-lg">Based on your profile. Check your Offers now!</p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button 
                onClick={handleExploreOffers} 
                className="bg-brand-purple hover:bg-brand-purple/90 text-lg py-6 px-8 rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                ✨ Explore Loan Offers ✨
              </Button>
              <Button 
                onClick={handleDownloadLetter} 
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
        )}
      </div>
    </Layout>
  );
};

export default CheckEligibility;
