// formDecPage2.jsx
import React, { useRef } from 'react';

function LetterBoxes({ length, value, onChange, name, className = "" }) {
  const inputRefs = useRef([]);

  React.useEffect(() => {
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

export default function FormDecPage2({ formData, updateFormData, onNext, onPrev, currentPage, totalPages }) {
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

        {/* Header - Simple blue line only */}
        <div className="sbi-header-row-simple"></div>

        {/* Declaration Content */}
        <div className="sbi-declaration-content">
          <div className="sbi-declaration-section">
            <div className="sbi-declaration-text">
              <strong>For EU/UK NRI applicants:</strong>
            </div>
            
            <div className="sbi-declaration-text">
              • By signing this Declaration Form, I/we confirm that I/we have read the Privacy Notice provided to me/us and consent to SBI collecting, transferring, holding and processing my/our personal data as indicated therein.
            </div>

            <div className="sbi-declaration-text">
              • I/We further understand that as and when SBI updates its Privacy Notice, it will publish the same on its website. I/We undertake to consult SBI's website at regular intervals and confirm any new version of the Privacy Notice will apply from the date it is published thereon.
            </div>

            <div className="sbi-declaration-text">
              • I/We understand that under the conditions defined by the General Data Protection Regulations GDPR (or) similar foreign regulations, unless otherwise provided I/we have the rights:
            </div>

            <div className="sbi-declaration-numbered">
              <strong>a.</strong> To withdraw my/our consent at any time.
            </div>

            <div className="sbi-declaration-numbered">
              <strong>b.</strong> To obtain information from SBI, whether it processes my personal data (PD) (or) not and, if it processes, details thereof like the purpose, categories of PD concerned, recipients or categories of recipients to whom my personal data have been or will be communicated etc.
            </div>

            <div className="sbi-declaration-numbered">
              <strong>c.</strong> The retention period of the personal data envisaged or, where this is not possible, the criteria used to determine this duration, etc.
            </div>

            <div className="sbi-declaration-numbered">
              <strong>d.</strong> Access, rectification and/or erasure of my personal data, subject to relevant regulatory guidelines.
            </div>

            <div className="sbi-declaration-numbered">
              <strong>e.</strong> In certain circumstances, receive my/our personal data provided to SBI, in a structured, commonly used and legible format, and the right to transfer this data to another data controller. However, we understand that the right to data portability is dependent on regulatory instructions & system enablement that are still evolving.
            </div>

            <div className="sbi-declaration-numbered">
              <strong>f.</strong> In certain circumstances object to the processing of my/our personal data
            </div>

            <div className="sbi-declaration-numbered">
              <strong>g.</strong> To lodge a complaint with the relevant data protection authority of my/our jurisdiction.
            </div>

            <div className="sbi-declaration-text">
              <strong>For all other customers:</strong>
            </div>

            <div className="sbi-declaration-text">
              • By signing this Declaration Form, I/we consent to SBI collecting, transferring, holding and processing my/our information including personal data as indicated herein.
            </div>

            <div className="sbi-declaration-text">
              <strong>By signing below, I/we indicate my/our acceptance, hereof</strong>
            </div>

            {/* Signature Section */}
            <div className="sbi-declaration-signature-grid">
              <div className="sbi-signature-row">
                <div className="sbi-signature-box"></div>
                <div className="sbi-signature-box"></div>
              </div>
              <div className="sbi-signature-row">
                <div className="sbi-signature-box"></div>
                <div className="sbi-signature-box"></div>
              </div>
            </div>

            <div className="sbi-signature-labels">
              <div className="sbi-signature-label-row">
                <span>Signature of Applicant / Co applicant / Guarantor</span>
              </div>
              <div className="sbi-signature-label-row">
                <span>Place:</span>
              </div>
              <div className="sbi-signature-label-row">
                <span>Date:</span>
              </div>
            </div>

            {/* Scissor line separator */}
            <div className="sbi-separator-line">
              <span className="sbi-scissor">✂</span>
            </div>

            {/* Acknowledgment Receipt Section - OPTIMIZED LAYOUT */}
            <div className="sbi-acknowledgment-section">
              <div className="sbi-acknowledgment-title">
                <strong>ACKNOWLEDGMENT RECEIPT</strong>
              </div>

              <div className="sbi-acknowledgment-content">
                {/* Line 1 - Loan application and document received dates */}
                <div className="sbi-acknowledgment-row">
                  <span>Loan application received on </span>
                  <LetterBoxes length={8} value={formData.loanReceivedDate || ""} onChange={v => setField("loanReceivedDate", v)} name="loanReceivedDate" />
                  <span>, complete document set received on </span>
                  <LetterBoxes length={8} value={formData.documentReceivedDate || ""} onChange={v => setField("documentReceivedDate", v)} name="documentReceivedDate" />
                  <span>, cheque received towards payments of processing</span>
                </div>

                {/* Line 2 - Fee amounts and cheque number */}
                <div className="sbi-acknowledgment-row">
                  <span>fee, Valuation fee and Legal fee amounting to Rs </span>
                  <LetterBoxes length={6} value={formData.feeAmount1 || ""} onChange={v => setField("feeAmount1", v)} name="feeAmount1" />
                  <span>, Rs </span>
                  <LetterBoxes length={6} value={formData.feeAmount2 || ""} onChange={v => setField("feeAmount2", v)} name="feeAmount2" />
                  <span> and Rs </span>
                  <LetterBoxes length={6} value={formData.feeAmount3 || ""} onChange={v => setField("feeAmount3", v)} name="feeAmount3" />
                  <span> respectively vide cheque no. </span>
                  <LetterBoxes length={6} value={formData.chequeNumber || ""} onChange={v => setField("chequeNumber", v)} name="chequeNumber" />
                  <span>,</span>
                </div>

                {/* Line 3 - Additional info and date */}
                <div className="sbi-acknowledgment-row">
                  <LetterBoxes length={6} value={formData.additionalInfo1 || ""} onChange={v => setField("additionalInfo1", v)} name="additionalInfo1" />
                  <span> and </span>
                  <LetterBoxes length={6} value={formData.additionalInfo2 || ""} onChange={v => setField("additionalInfo2", v)} name="additionalInfo2" />
                  <span> dated </span>
                  <LetterBoxes length={8} value={formData.chequeDate || ""} onChange={v => setField("chequeDate", v)} name="chequeDate" />
                  <span>, drawn in favour of "State Bank of India" and payable at </span>
                  <LetterBoxes length={10} value={formData.payableAt || ""} onChange={v => setField("payableAt", v)} name="payableAt" />
                </div>

                {/* Line 4 - Additional details */}
                <div className="sbi-acknowledgment-row">
                  <LetterBoxes length={18} value={formData.additionalDetails || ""} onChange={v => setField("additionalDetails", v)} name="additionalDetails" />
                </div>

                <div className="sbi-declaration-text">
                  Request will be disposed off and acceptance / rejection notification would be mailed within 15 days from completed application form with supporting documents on behalf of State Bank of India
                </div>

                <div className="sbi-acknowledgment-footer">
                  <div className="sbi-acknowledgment-left">
                    <span>Date and place ........................</span>
                  </div>
                  <div className="sbi-acknowledgment-right">
                    <span>Authorised Signatory</span>
                  </div>
                </div>

                <div className="sbi-page-number">
                  <strong>14</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
