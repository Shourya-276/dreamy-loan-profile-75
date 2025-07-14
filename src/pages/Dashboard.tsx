import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useLoan } from "../contexts/LoanContext";
import { Button } from "@/components/ui/button";
import LoanTrackingSection from "../users/customer/components/LoanTrackingSection";

const Dashboard = () => {
  const { user } = useAuth();
  const { application } = useLoan();
  const { personalDetails, isEligible } = application;

  const isProfileComplete = !!personalDetails;
  
  // Check if Apply for Loan step (4th step) is completed
  // This means user has gone through all profile steps and is eligible
  const isApplyForLoanCompleted = isProfileComplete && isEligible && application.selectedOffer;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.name || "User"}!</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your loan applications and track progress</p>
          </div>
        </div>
        
        {!isProfileComplete && (
          <div className="bg-amber-100 border-l-4 border-amber-500 p-4 dark:bg-amber-900/30 dark:border-amber-500/50 rounded-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  You need to complete your profile before you can apply for a loan. 
                  <Link to="/profile" className="ml-1 font-medium underline">
                    Complete Profile
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Apply for a Loan Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold flex items-center mb-4">
            Apply for a Loan in 4 Simple Steps 
            <span className="ml-2 inline-block">🚀</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Follow these four steps to get your loan approved effortlessly.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 relative">
              <div className="h-8 w-8 rounded-full bg-brand-purple text-white flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-medium text-lg mb-2">Complete Your Profile</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Fill in your personal and financial details.</p>
              {isProfileComplete ? (
                <div className="absolute top-4 right-4 text-brand-green">
                  <Check size={20} />
                </div>
              ) : (
                <Link to="/profile" className="mt-4 text-brand-purple text-sm font-medium hover:underline inline-flex items-center">
                  Start now <ArrowRight size={16} className="ml-1" />
                </Link>
              )}
            </div>
            
            {/* Step 2 */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 relative">
              <div className="h-8 w-8 rounded-full bg-brand-purple text-white flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-medium text-lg mb-2">Check Your Eligibility</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Our system is reviewing your details.</p>
              {isEligible ? (
                <div className="absolute top-4 right-4 text-brand-green">
                  <Check size={20} />
                </div>
              ) : (
                <Link 
                  to={isProfileComplete ? "/check-eligibility" : "/profile"}
                  className="mt-4 text-brand-purple text-sm font-medium hover:underline inline-flex items-center"
                >
                  Check now <ArrowRight size={16} className="ml-1" />
                </Link>
              )}
            </div>
            
            {/* Step 3 */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
              <div className="h-8 w-8 rounded-full bg-brand-purple text-white flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-medium text-lg mb-2">View Loan Offers</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Compare interest rates and repayment terms.</p>
              <Link 
                to={isEligible ? "/explore-loan-offers" : (isProfileComplete ? "/check-eligibility" : "/profile")}
                className="mt-4 text-brand-purple text-sm font-medium hover:underline inline-flex items-center"
              >
                View offers <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            
            {/* Step 4 */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 relative">
              <div className="h-8 w-8 rounded-full bg-brand-purple text-white flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="font-medium text-lg mb-2">Apply for Loan</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Select your preferred loan offer & Submit your application</p>
              {isApplyForLoanCompleted ? (
                <div className="absolute top-4 right-4 text-brand-green">
                  <Check size={20} />
                </div>
              ) : (
                <Link 
                  to={isEligible ? "/apply-loan" : (isProfileComplete ? "/check-eligibility" : "/profile")}
                  className="mt-4 text-brand-purple text-sm font-medium hover:underline inline-flex items-center"
                >
                  Apply now <ArrowRight size={16} className="ml-1" />
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Loan Journey Tracker */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold flex items-center mb-6">
            Your Loan Journey 
            <span className="ml-2 inline-block">🚀</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Helping You Navigate Your Loan Process.</p>
          
          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute h-full w-px bg-gray-300 dark:bg-gray-700 left-[22px]"></div>
            
            {/* Timeline items */}
            <div className="space-y-8">
              {/* Item 1 */}
              <div className="relative pl-12">
                <div className={`absolute left-0 h-10 w-10 rounded-full border-2 flex items-center justify-center ${
                  isProfileComplete ? "bg-brand-purple text-white border-brand-purple" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                }`}>
                  {isProfileComplete && <Check size={20} />}
                </div>
                <h3 className="font-medium text-lg mb-1">Complete Your Profile</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {isProfileComplete ? "Your profile is complete!" : "Fill in your personal details to get started."}
                </p>
                {!isProfileComplete && (
                  <Button
                    asChild
                    variant="default"
                    className="mt-2"
                    size="sm"
                  >
                    <Link to="/profile">Complete Now</Link>
                  </Button>
                )}
              </div>
              
              {/* Item 2 */}
              <div className="relative pl-12">
                <div className={`absolute left-0 h-10 w-10 rounded-full border-2 flex items-center justify-center ${
                  isEligible ? "bg-brand-purple text-white border-brand-purple" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                }`}>
                  {isEligible && <Check size={20} />}
                </div>
                <h3 className="font-medium text-lg mb-1">Check Your Eligibility</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {isEligible ? "You are eligible for a loan!" : "Find out if you qualify for our loan products."}
                </p>
                {isProfileComplete && !isEligible && (
                  <Button
                    asChild
                    variant="default"
                    className="mt-2"
                    size="sm"
                  >
                    <Link to="/check-eligibility">Check Now</Link>
                  </Button>
                )}
                {isEligible && (
                  <div className="inline-flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded text-sm mt-2">
                    <Check size={16} className="mr-1" />
                    Processing...
                  </div>
                )}
              </div>
              
              {/* Item 3 */}
              <div className="relative pl-12">
                <div className={`absolute left-0 h-10 w-10 rounded-full border-2 flex items-center justify-center bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700`}>
                </div>
                <h3 className="font-medium text-lg mb-1">View Loan Offers</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Browse and compare available loan offers tailored for you.
                </p>
                {isEligible && (
                  <Button
                    asChild
                    variant="default"
                    className="mt-2"
                    size="sm"
                  >
                    <Link to="/explore-loan-offers">Next Step</Link>
                  </Button>
                )}
              </div>
              
              {/* Item 4 */}
              <div className="relative pl-12">
                <div className={`absolute left-0 h-10 w-10 rounded-full border-2 flex items-center justify-center bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700`}>
                </div>
                <h3 className="font-medium text-lg mb-1">Apply for Loan</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Submit your application to complete the process.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-2"
                  size="sm"
                  disabled={!isEligible}
                >
                  <Link to="/apply-loan">Final Step</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Conditionally show Loan Tracking Section only when Apply for Loan step is completed */}
        {isApplyForLoanCompleted && <LoanTrackingSection />}
        
        {/* AI Assistant CTA */}
        <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-16 w-16 rounded-full bg-brand-purple flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-semibold">Need help? Chat with our AI Loan Assistant!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get instant answers to your questions and personalized guidance through the loan process.
              </p>
              <a 
                href="https://wa.me/919892410375?text=hi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-brand-green hover:bg-brand-green/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Chat with us on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
