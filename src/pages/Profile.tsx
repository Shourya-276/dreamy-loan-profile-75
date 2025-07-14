
import React from "react";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useLoan } from "../contexts/LoanContext";
import PersonalDetailsForm from "../components/forms/PersonalDetailsForm";
import IncomeDetailsForm from "../components/forms/IncomeDetailsForm";
import PropertyDetailsForm from "../components/forms/PropertyDetailsForm";
import FinalStepForm from "../components/forms/FinalStepForm";
import SalesManagerProfileForm from "../components/forms/SalesManagerProfileForm";

const Profile = () => {
  const { user } = useAuth();
  const { application } = useLoan();
  const formStep = application?.formStep || 1;
  
  // Check if all required forms are completed
  const isFormComplete = 
    application?.personalDetails && 
    application?.incomeDetails && 
    application?.propertyDetails;

  // If user is sales manager, show simplified profile form
  if (user?.role === 'salesmanager') {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your sales manager profile information
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <SalesManagerProfileForm />
          </div>
        </div>
      </Layout>
    );
  }

  // If user is loan coordinator, redirect to their dedicated profile page
  if (user?.role === 'loancoordinator') {
    window.location.href = '/loan-coordinator-profile';
    return null;
  }

  // Customer profile with multi-step forms
  const renderFormStep = () => {
    const emptyPrefillData = {};
    
    switch (formStep) {
      case 1:
        return <PersonalDetailsForm prefillData={emptyPrefillData} />;
      case 2:
        return <IncomeDetailsForm prefillData={emptyPrefillData} />;
      case 3:
        return <PropertyDetailsForm prefillData={emptyPrefillData} />;
      case 4:
        return <FinalStepForm prefillData={emptyPrefillData} />;
      default:
        return <PersonalDetailsForm prefillData={emptyPrefillData} />;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return "Personal details";
      case 2:
        return "Income Details";
      case 3:
        return "Property details";
      case 4:
        return "Final Step";
      default:
        return "Personal details";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isFormComplete 
              ? "Profile complete! You can now apply for loans." 
              : "Complete your profile to apply for loans"}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center">
          <ol className="flex items-center w-full max-w-3xl">
            {[1, 2, 3].map((step) => {
              const isActive = formStep === step;
              const isCompleted = formStep > step;
              
              return (
                <li 
                  key={step} 
                  className={`flex w-full items-center ${step !== 3 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 dark:after:border-gray-700" : ""}`}
                >
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isCompleted ? "bg-brand-purple" : isActive ? "bg-brand-purple" : "bg-gray-200 dark:bg-gray-700"
                    } lg:h-12 lg:w-12`}>
                      <span className={`text-sm lg:text-base font-medium ${
                        isCompleted || isActive ? "text-white" : "text-gray-500 dark:text-gray-300"
                      }`}>
                        {step}
                      </span>
                    </div>
                    <span className="text-xs lg:text-sm font-medium mt-2">{getStepTitle(step)}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {renderFormStep()}
        </div>
        
        {/* Congratulations Animation - Only shows when profile is complete */}
        {isFormComplete && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 animate-fade-in" onClick={(e) => e.currentTarget === e.target && e.currentTarget.classList.add('hidden')}>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md animate-scale-in">
              <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Your profile is now complete. You can now apply for loans.</p>
              <button 
                className="px-4 py-2 bg-brand-purple text-white rounded hover:bg-brand-purple/90 transition-colors"
                onClick={(e) => e.currentTarget.closest('.fixed')?.classList.add('hidden')}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
