
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useLoan } from "../contexts/LoanContext";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const ApplyLoan = () => {
  const { application } = useLoan();
  const navigate = useNavigate();
  const [isLFISanctionProcessing, setIsLFISanctionProcessing] = useState(true);
  const [isSanctionLetterProcessing, setIsSanctionLetterProcessing] = useState(true);

  useEffect(() => {
    if (!application.isEligible) {
      navigate("/check-eligibility");
    }
  }, [application.isEligible, navigate]);

  const handleDownload = (type: string) => {
    // Placeholder for download functionality
    console.log(`Downloading ${type}`);
  };

  // Simulate processing completion after some time (in real app, this would be based on actual status)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLFISanctionProcessing(false);
    }, 5000); // 5 seconds for demo purposes

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Documents Cards */}
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Application Form Card */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Application form
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  View or save your submitted loan details.
                </p>
                <Button 
                  onClick={() => handleDownload('application')}
                  className="bg-brand-purple hover:bg-brand-purple/90 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                  Download
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* CIBIL Credit Record Card */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  View CIBIL Credit Record
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  one free CIBIL report every year.
                </p>
                <Button 
                  onClick={() => handleDownload('cibil')}
                  className="bg-brand-purple hover:bg-brand-purple/90 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                  Download
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* LFI Sanction Letter Card */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  LFI Sanction Letter
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Check all Terms and Conditions
                </p>
                {isLFISanctionProcessing ? (
                  <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-lg text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 dark:border-blue-300 mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <Button 
                    onClick={() => handleDownload('lfi-sanction')}
                    className="bg-brand-purple hover:bg-brand-purple/90 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                  >
                    Download
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sanction Letter Card */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">4</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Sanction Letter
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Check all Terms and Conditions
                </p>
                <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-lg text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 dark:border-blue-300 mr-2"></div>
                  Processing...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ApplyLoan;
