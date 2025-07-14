// FormPageB.jsx
import React, { useRef } from 'react';

export default function FormPageB({ formData, updateFormData, onNext, onPrev, currentPage, totalPages }) {
  const formRef = useRef(null);

  const setField = (key, val) => updateFormData({ [key]: val });

  return (
    <div>
      <div ref={formRef} className="sbi-form-container-fullwidth" id="sbi-form-container">
        {/* Watermark */}
        <div className="sbi-watermark">
          <img 
            src="./SBI-logo.png" 
            alt="SBI Watermark"
            onError={(e) => {
              e.target.style.display = 'none';
              if (!e.target.parentNode.querySelector('.sbi-watermark-text')) {
                const textWatermark = document.createElement('div');
                textWatermark.className = 'sbi-watermark-text';
                textWatermark.textContent = 'SBI';
                e.target.parentNode.appendChild(textWatermark);
              }
            }}
          />
        </div>

        {/* Header */}
        <div className="sbi-header-row">
          <div className="sbi-header-title">FORM B: ADDITIONAL DETAILS</div>
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

        {/* Main Content */}
        <div className="sbi-main-row">
          <div className="sbi-fields">
            {/* Placeholder content for Form B */}
            <div className="sbi-form-row">
              <span className="sbi-label">Annual Income:</span>
              <input 
                type="text" 
                value={formData.annualIncome || ""} 
                onChange={(e) => setField("annualIncome", e.target.value)}
                style={{
                  border: "1px solid #000000",
                  padding: "5px",
                  fontSize: "17px",
                  width: "200px"
                }}
              />
            </div>

            <div className="sbi-form-row">
              <span className="sbi-label">Sample Field B:</span>
              <input 
                type="text" 
                value={formData.sampleFieldB || ""} 
                onChange={(e) => setField("sampleFieldB", e.target.value)}
                style={{
                  border: "1px solid #000000",
                  padding: "5px",
                  fontSize: "17px",
                  width: "200px"
                }}
              />
            </div>

            <div className="sbi-form-row">
              <span className="sbi-label">Form B is a placeholder page</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
