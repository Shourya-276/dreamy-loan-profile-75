// FormPageA1.jsx
import React, { useRef, useEffect } from 'react';

function LetterBoxes({ length, value, onChange, name, className = "" }) {
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (e, idx) => {
    const newValue = e.target.value.replace(/[^a-zA-Z0-9@.\s]/, "").slice(0, 1);
    let chars = value.split("");
    chars[idx] = newValue;
    onChange(chars.join(""));
    
    if (newValue && idx < length - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      let chars = value.split("");
      
      if (chars[idx]) {
        chars[idx] = "";
        onChange(chars.join(""));
      } else if (idx > 0) {
        chars[idx - 1] = "";
        onChange(chars.join(""));
        inputRefs.current[idx - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < length - 1) {
      e.preventDefault();
      inputRefs.current[idx + 1]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const nextElement = e.currentTarget.closest('.sbi-form-row')?.nextElementSibling?.querySelector('input');
      if (nextElement) {
        nextElement.focus();
      }
    }
  };

  return (
    <div className={`letter-box-row ${className}`}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          maxLength={1}
          className="letter-box"
          value={value[idx] || ""}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          autoComplete="off"
        />
      ))}
    </div>
  );
}

export default function FormPageA1({ formData, updateFormData, onNext, currentPage, totalPages }) {
  const formRef = useRef(null);

  const setField = (key, val) => updateFormData({ [key]: val });

  return (
    <div>
      <div ref={formRef} className="sbi-form-container-fullwidth" id="sbi-form-container">
        {/* Watermark - Add your SBI logo here */}
        <div className="sbi-watermark">
          <img 
            src="./SBI-logo.png" 
            alt="SBI Watermark"
            onError={(e) => {
              // Fallback to text if image fails to load
              e.target.style.display = 'none';
              const textWatermark = document.createElement('div');
              textWatermark.className = 'sbi-watermark-text';
              textWatermark.textContent = 'SBI';
              e.target.parentNode.appendChild(textWatermark);
            }}
          />
        </div>

        {/* Header */}
        <div className="sbi-header-row">
          <div className="sbi-header-title">FORM A: PERSONAL DETAILS</div>
          <div className="sbi-header-options">
            <label className="sbi-checkbox-label">
              <input type="checkbox" className="sbi-checkbox" />
              <span className="sbi-checkbox-text">APPLICANT</span>
            </label>
            <label className="sbi-checkbox-label">
              <input type="checkbox" className="sbi-checkbox" />
              <span className="sbi-checkbox-text">CO-APPLICANT</span>
            </label>
            <label className="sbi-checkbox-label">
              <input type="checkbox" className="sbi-checkbox" />
              <span className="sbi-checkbox-text">GUARANTOR</span>
            </label>
          </div>
        </div>

        <div className="sbi-main-row">
          {/* Left: Form Fields */}
          <div className="sbi-fields">
            {/* Existing Customer */}
            <div className="sbi-form-row">
              <span className="sbi-label">Existing Customer:</span>
              <label className="sbi-checkbox-label">
                <input 
                  type="checkbox" 
                  className="sbi-checkbox"
                  checked={formData.existingCustomer.yes}
                  onChange={(e) => setField("existingCustomer", { yes: e.target.checked, no: !e.target.checked })}
                />
                <span className="sbi-checkbox-text">Yes</span>
              </label>
              <label className="sbi-checkbox-label">
                <input 
                  type="checkbox" 
                  className="sbi-checkbox"
                  checked={formData.existingCustomer.no}
                  onChange={(e) => setField("existingCustomer", { no: e.target.checked, yes: !e.target.checked })}
                />
                <span className="sbi-checkbox-text">No</span>
              </label>
            </div>
            <div className="sbi-form-row">
              <span className="sbi-label-small">If Yes, CIF No/Account No.</span>
              <LetterBoxes length={11} value={formData.cif} onChange={v => setField("cif", v)} name="cif" />
            </div>

            {/* Name */}
            <div className="sbi-form-row sbi-name-row">
              <span className="sbi-label">Name:</span>
              <div className="sbi-name-field">
                <div className="sbi-name-labels">
                  <span>First Name</span>
                  <span>Middle Name</span>
                  <span>Last Name</span>
                </div>
                <LetterBoxes length={30} value={formData.name} onChange={v => setField("name", v)} name="name" />
              </div>
            </div>

            {/* Date of Birth, PAN, Mobile */}
            <div className="sbi-form-row">
              <span className="sbi-label">Date of Birth:</span>
              <LetterBoxes length={8} value={formData.dob} onChange={v => setField("dob", v)} name="dob" />
              <span className="sbi-label-pan">PAN:</span>
              <LetterBoxes length={10} value={formData.pan} onChange={v => setField("pan", v)} name="pan" />
            </div>
            
            <div className="sbi-form-row">
              <span className="sbi-label">Mobile:</span>
              <LetterBoxes length={10} value={formData.mobile} onChange={v => setField("mobile", v)} name="mobile" />
            </div>

            {/* Email */}
            <div className="sbi-form-row">
              <span className="sbi-label">e-mail:</span>
              <LetterBoxes length={30} value={formData.email} onChange={v => setField("email", v)} name="email" />
            </div>

            {/* Spouse */}
            <div className="sbi-form-row">
              <span className="sbi-label">Name of Spouse:</span>
              <LetterBoxes length={30} value={formData.spouse} onChange={v => setField("spouse", v)} name="spouse" />
            </div>

            {/* Father */}
            <div className="sbi-form-row">
              <span className="sbi-label">Name of Father:</span>
              <LetterBoxes length={30} value={formData.father} onChange={v => setField("father", v)} name="father" />
            </div>

            {/* Gender, Marital Status */}
            <div className="sbi-form-row">
              <span className="sbi-label">Gender:</span>
              <label className="sbi-checkbox-label">
                <input type="checkbox" className="sbi-checkbox" />
                <span className="sbi-checkbox-text">Male</span>
              </label>
              <label className="sbi-checkbox-label">
                <input type="checkbox" className="sbi-checkbox" />
                <span className="sbi-checkbox-text">Female</span>
              </label>
              <label className="sbi-checkbox-label">
                <input type="checkbox" className="sbi-checkbox" />
                <span className="sbi-checkbox-text">Third Gender</span>
              </label>
            </div>

            <div className="sbi-form-row">
              <span className="sbi-label">Marital Status:</span>
              <label className="sbi-checkbox-label">
                <input type="checkbox" className="sbi-checkbox" />
                <span className="sbi-checkbox-text">Single</span>
              </label>
              <label className="sbi-checkbox-label">
                <input type="checkbox" className="sbi-checkbox" />
                <span className="sbi-checkbox-text">Married</span>
              </label>
              <label className="sbi-checkbox-label">
                <input type="checkbox" className="sbi-checkbox" />
                <span className="sbi-checkbox-text">Divorced</span>
              </label>
              <label className="sbi-checkbox-label">
                <input type="checkbox" className="sbi-checkbox" />
                <span className="sbi-checkbox-text">Widowed</span>
              </label>
            </div>

            {/* KYC Section */}
            <div className="sbi-form-row sbi-kyc-title">
              <span className="sbi-label">Details of KYC (Minimum one to be filled)</span>
            </div>
            
            <div className="sbi-form-row sbi-kyc-row">
              <span className="sbi-label-kyc">1) Aadhaar / UID No.</span>
              <LetterBoxes length={12} value={formData.aadhar} onChange={v => setField("aadhar", v)} name="aadhar" />
            </div>
            
            <div className="sbi-form-row sbi-kyc-row">
              <span className="sbi-label-kyc">2) Voter ID No.</span>
              <LetterBoxes length={12} value={formData.voter} onChange={v => setField("voter", v)} name="voter" />
            </div>
            
            <div className="sbi-form-row sbi-kyc-row">
              <span className="sbi-label-kyc">3) Passport No.</span>
              <LetterBoxes length={12} value={formData.passport} onChange={v => setField("passport", v)} name="passport" />
            </div>
            
            <div className="sbi-form-row sbi-kyc-row">
              <span className="sbi-label-kyc">4) Driving License No.</span>
              <LetterBoxes length={12} value={formData.dl} onChange={v => setField("dl", v)} name="dl" />
            </div>
            
            <div className="sbi-form-row sbi-kyc-row">
              <span className="sbi-label-kyc">5) MGNREGA Job card No.</span>
              <LetterBoxes length={12} value={formData.mgnrega} onChange={v => setField("mgnrega", v)} name="mgnrega" />
            </div>
            
            <div className="sbi-form-row sbi-kyc-row">
              <span className="sbi-label-kyc">6) Letter issued by National Population Register Containing Name and Address:</span>
              <LetterBoxes length={36} value={formData.npr} onChange={v => setField("npr", v)} name="npr" />
            </div>

            {/* Residential Status - Split into two rows */}
            <div className="sbi-residential-status-row-1">
              <span className="sbi-label">Residential Status:</span>
              <label className="sbi-checkbox-label">
                <input type="checkbox" className="sbi-checkbox" />
                <span className="sbi-checkbox-text">Resident Indian (RI)</span>
              </label>
              <label className="sbi-checkbox-label">
                <input type="checkbox" className="sbi-checkbox" />
                <span className="sbi-checkbox-text">Non-Resident Indian (NRI)</span>
              </label>
            </div>
            <div className="sbi-residential-status-row-2">
              <label className="sbi-checkbox-label">
                <input type="checkbox" className="sbi-checkbox" />
                <span className="sbi-checkbox-text">Person Of Indian Origin (PIO)</span>
              </label>
              <label className="sbi-checkbox-label">
                <input type="checkbox" className="sbi-checkbox" />
                <span className="sbi-checkbox-text">Foreign Citizen</span>
              </label>
            </div>

            {/* Defence Personnel Section - Stack vertically */}
            <div className="sbi-defence-section">
              <div className="sbi-defence-row">
                <span className="sbi-defence-label">FOR DEFENCE PERSONNEL:</span>
                <div className="sbi-defence-options">
                  <label className="sbi-checkbox-label">
                    <input type="checkbox" className="sbi-checkbox" />
                    <span className="sbi-checkbox-text">Indian Army</span>
                  </label>
                  <label className="sbi-checkbox-label">
                    <input type="checkbox" className="sbi-checkbox" />
                    <span className="sbi-checkbox-text">Indian Navy</span>
                  </label>
                  <label className="sbi-checkbox-label">
                    <input type="checkbox" className="sbi-checkbox" />
                    <span className="sbi-checkbox-text">Indian Air force</span>
                  </label>
                </div>
              </div>
              
              <div className="sbi-defence-row">
                <span className="sbi-defence-label">IS YOUR SERVICE UNDER:</span>
                <div className="sbi-defence-options">
                  <label className="sbi-checkbox-label">
                    <input type="checkbox" className="sbi-checkbox" />
                    <span className="sbi-checkbox-text">Defined Benefit Pension</span>
                  </label>
                  <label className="sbi-checkbox-label">
                    <input type="checkbox" className="sbi-checkbox" />
                    <span className="sbi-checkbox-text">New Pension Scheme</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Photo/Signature */}
          <div className="sbi-photo-col">
            <div className="sbi-photo-box">
              Attach your recent<br />passport size<br />photograph here
            </div>
            <div className="sbi-sign-box">Please sign here</div>
          </div>
        </div>

        {/* Address Section */}
        <div className="sbi-address-section">
          <div className="sbi-address-header">
            <div className="sbi-address-label-row">
              <span className="sbi-address-label-residential">Residential Address:</span>
            </div>
            <div className="sbi-address-label-row">
              <span className="sbi-address-label-permanent">Permanent Address:</span>
            </div>
          </div>

          {/* Permanent Address */}
          <div className="sbi-form-row">
            <span className="sbi-label-address">Address 1:</span>
            <LetterBoxes length={40} value={formData.perm_addr1} onChange={v => setField("perm_addr1", v)} name="perm_addr1" />
          </div>
          
          <div className="sbi-form-row">
            <span className="sbi-label-address">Address 2:</span>
            <LetterBoxes length={40} value={formData.perm_addr2} onChange={v => setField("perm_addr2", v)} name="perm_addr2" />
          </div>
          
          <div className="sbi-form-row">
            <span className="sbi-label-address">Address 3:</span>
            <LetterBoxes length={40} value={formData.perm_addr3} onChange={v => setField("perm_addr3", v)} name="perm_addr3" />
          </div>
          
          <div className="sbi-address-field-row">
            <span className="sbi-label-address-left">Village:</span>
            <LetterBoxes length={9} value={formData.perm_village} onChange={v => setField("perm_village", v)} name="perm_village" className="letter-box-row-address" />
            <span className="sbi-label-address-right">City:</span>
            <LetterBoxes length={16} value={formData.perm_city} onChange={v => setField("perm_city", v)} name="perm_city" className="letter-box-row-address" />
          </div>
          
          <div className="sbi-address-field-row">
            <span className="sbi-label-address-left">District:</span>
            <LetterBoxes length={9} value={formData.perm_district} onChange={v => setField("perm_district", v)} name="perm_district" className="letter-box-row-address" />
            <span className="sbi-label-address-right">State:</span>
            <LetterBoxes length={16} value={formData.perm_state} onChange={v => setField("perm_state", v)} name="perm_state" className="letter-box-row-address" />
          </div>
          
          <div className="sbi-address-field-row">
            <span className="sbi-label-address-left">Country:</span>
            <LetterBoxes length={9} value={formData.perm_country} onChange={v => setField("perm_country", v)} name="perm_country" className="letter-box-row-address" />
            <span className="sbi-label-address-right">Pin Code:</span>
            <LetterBoxes length={6} value={formData.perm_pincode} onChange={v => setField("perm_pincode", v)} name="perm_pincode" className="letter-box-row-address" />
          </div>

          {/* Current address same as permanent */}
          <div className="sbi-form-row sbi-same-address-row">
            <span className="sbi-label-same-address">Current address same as the permanent address</span>
            <label className="sbi-checkbox-label">
              <input type="checkbox" className="sbi-checkbox" />
              <span className="sbi-checkbox-text">Yes</span>
            </label>
            <label className="sbi-checkbox-label">
              <input type="checkbox" className="sbi-checkbox" />
              <span className="sbi-checkbox-text">No</span>
            </label>
          </div>

          {/* Current Address */}
          <div className="sbi-form-row">
            <span className="sbi-label-address">Address 1:</span>
            <LetterBoxes length={40} value={formData.curr_addr1} onChange={v => setField("curr_addr1", v)} name="curr_addr1" />
          </div>
          
          <div className="sbi-form-row">
            <span className="sbi-label-address">Address 2:</span>
            <LetterBoxes length={40} value={formData.curr_addr2} onChange={v => setField("curr_addr2", v)} name="curr_addr2" />
          </div>
          
          <div className="sbi-form-row">
            <span className="sbi-label-address">Address 3:</span>
            <LetterBoxes length={40} value={formData.curr_addr3} onChange={v => setField("curr_addr3", v)} name="curr_addr3" />
          </div>
          
          <div className="sbi-address-field-row">
            <span className="sbi-label-address-left">Village:</span>
            <LetterBoxes length={9} value={formData.curr_village} onChange={v => setField("curr_village", v)} name="curr_village" className="letter-box-row-address" />
            <span className="sbi-label-address-right">City:</span>
            <LetterBoxes length={16} value={formData.curr_city} onChange={v => setField("curr_city", v)} name="curr_city" className="letter-box-row-address" />
          </div>
          
          <div className="sbi-address-field-row">
            <span className="sbi-label-address-left">District:</span>
            <LetterBoxes length={9} value={formData.curr_district} onChange={v => setField("curr_district", v)} name="curr_district" className="letter-box-row-address" />
            <span className="sbi-label-address-right">State:</span>
            <LetterBoxes length={16} value={formData.curr_state} onChange={v => setField("curr_state", v)} name="curr_state" className="letter-box-row-address" />
          </div>
          
          <div className="sbi-address-field-row">
            <span className="sbi-label-address-left">Country:</span>
            <LetterBoxes length={9} value={formData.curr_country} onChange={v => setField("curr_country", v)} name="curr_country" className="letter-box-row-address" />
            <span className="sbi-label-address-right">Pin Code:</span>
            <LetterBoxes length={6} value={formData.curr_pincode} onChange={v => setField("curr_pincode", v)} name="curr_pincode" className="letter-box-row-address" />
          </div>
        </div>
      </div>
    </div>
  );
}