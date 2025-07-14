// SBILoanFormContainer.jsx
import React, { useState } from 'react';
import FormPageA1 from './formPageA1';
import FormPageA2 from './formPageA2';
import FormPageB from './formPageB1';
import FormDecPage1 from './formDecPage1';
import FormDecPage2 from './formDecPage2';
import './SBIform.css';

export default function SBILoanFormContainer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    // All form fields consolidated
    existingCustomer: { yes: false, no: false },
    cif: "",
    name: "",
    dob: "",
    pan: "",
    mobile: "",
    email: "",
    spouse: "",
    father: "",
    gender: { male: false, female: false, thirdGender: false },
    maritalStatus: { single: false, married: false, divorced: false, widowed: false },
    aadhar: "",
    voter: "",
    passport: "",
    dl: "",
    mgnrega: "",
    npr: "",
    residentialStatus: { ri: false, nri: false, pio: false, foreignCitizen: false },
    defencePersonnel: { army: false, navy: false, airForce: false },
    serviceUnder: { definedBenefit: false, newPension: false },
    perm_addr1: "",
    perm_addr2: "",
    perm_addr3: "",
    perm_village: "",
    perm_city: "",
    perm_district: "",
    perm_state: "",
    perm_country: "",
    perm_pincode: "",
    currentSameAsPermanent: { yes: false, no: false },
    curr_addr1: "",
    curr_addr2: "",
    curr_addr3: "",
    curr_village: "",
    curr_city: "",
    curr_district: "",
    curr_state: "",
    curr_country: "",
    curr_pincode: "",
    addressType: { permanent: false, current: false },
    residentialType: { rented: false, companyLease: false, owned: false },
    yearsInCurrentAddress: "",
    monthsInCurrentAddress: "",
    relationship: {
      spouse: false,
      father: false,
      mother: false,
      brother: false,
      sister: false,
      son: false,
      daughter: false,
      daughterInLaw: false,
      others: false
    },
    existingHousePlot: "",
    unitsAcquired: "",
    builderPartner: { yes: false, no: false },
    powerOfAttorney: { yes: false, no: false },
    poaHolderName: "",
    poaHolderContact: "",
    directorOtherBank: { yes: false, no: false },
    chairmanName: "",
    bankName: "",
    capitalFund: "",
    // Declaration fields
    communicationPreference: { email: false, phone: false, sms: false },
    marketingResponse: "", // for the editable input box
    declarationPlace: "",
    declarationDate: "",
    // NEW - Acknowledgment receipt fields
    loanReceivedDate: "",
    documentReceivedDate: "",
    feeAmount1: "",
    feeAmount2: "",
    feeAmount3: "",
    chequeNumber: "",
    additionalInfo1: "",
    additionalInfo2: "",
    chequeDate: "",
    payableAt: "",
    additionalDetails: "",
    // Form B fields
    sampleFieldB: "",
    annualIncome: ""
  });

  const totalPages = 5; // A1, A2, B, Dec1, Dec2

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderCurrentPage = () => {
    try {
      switch (currentPage) {
        case 1:
          return (
            <FormPageA1
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextPage}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          );
        case 2:
          return (
            <FormPageA2
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextPage}
              onPrev={prevPage}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          );
        case 3:
          return (
            <FormPageB
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextPage}
              onPrev={prevPage}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          );
        case 4:
          return (
            <FormDecPage1
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextPage}
              onPrev={prevPage}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          );
        case 5:
          return (
            <FormDecPage2
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextPage}
              onPrev={prevPage}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          );
        default:
          return (
            <FormPageA1 
              formData={formData} 
              updateFormData={updateFormData}
              onNext={nextPage}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          );
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Error loading page {currentPage}</h2>
          <p>Please check the console for details.</p>
          <button onClick={() => setCurrentPage(1)}>Go to Page 1</button>
        </div>
      );
    }
  };

  return (
    <div className="sbi-form-wrapper">
      {/* Hover Navigation Arrows */}
      <div className="hover-nav-container">
        {currentPage > 1 && (
          <div className="hover-nav-left" onClick={prevPage}>
            <span className="nav-arrow">‹</span>
          </div>
        )}
        {currentPage < totalPages && (
          <div className="hover-nav-right" onClick={nextPage}>
            <span className="nav-arrow">›</span>
          </div>
        )}
      </div>
      
      {renderCurrentPage()}
    </div>
  );
}
