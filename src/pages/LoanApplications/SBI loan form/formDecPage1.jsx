// formDecPage1.jsx
import React, { useRef } from 'react';

export default function FormDecPage1({ formData, updateFormData, onNext, onPrev, currentPage, totalPages }) {
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

        {/* Declaration Title - Separate line and underlined */}
        <div className="sbi-declaration-title">DECLARATION</div>

        {/* Declaration Content */}
        <div className="sbi-declaration-content">
          <div className="sbi-declaration-section">
            <div className="sbi-declaration-text">
              I/We certify that the information and particulars provided by me/us in this application form are true, correct, complete and up to date in all respects and I/we have not withheld any information. I/We authorise State Bank of India to make enquiries related to or verify said information directly or through any agency. I/We further acknowledge that State Bank of India may exchange, share or part with all the information related to the details and transaction history of me/us to its group companies and other third parties, such as credit bureaus, agencies/participation in any telecommunication or electronic clearing network as may be required for conducting its business in accordance with the law. I/We also confirm that the details furnished by me/us are true and correct.
            </div>

            <div className="sbi-declaration-text">
              I/We understand that any information and particulars provided by me/us may be verified by the Bank and the Bank shall have the right to take such steps as it may, in its absolute discretion, deem fit for such verification. I/We also understand that any false, incorrect or incomplete information may be detrimental to my/our interest and may result in rejection of my/our application or cancellation of the facilities granted, if any.
            </div>

            <div className="sbi-declaration-text">
              I/We agree and undertake to provide any further information that Bank may require. I/We agree and understand that Bank reserves the right to obtain the application form, and the supporting documents and information provided by me/us, from any source, including credit information companies, for verification of the particulars mentioned in the application.
            </div>

            <div className="sbi-declaration-text">
              I/We further agree that any facility that may be provided to me/us shall be governed by the rules of the Bank that may be in force from time to time. I/We will be bound by the terms and conditions of the specific product that may be approved for me/us. I/We shall comply with all applicable laws, regulations, rules, circulars etc. that may be applicable to the facility/product approved for me/us.
            </div>

            <div className="sbi-declaration-text">
              I/We understand and declare that I/we will comply with the Foreign Exchange Management Act, 1999 ("FEMA") and the applicable rules, regulations, notifications, directions or orders issued thereunder. I/We also understand that in case of any violation of FEMA provisions, I/we shall be liable for action under FEMA, in addition to the Bank being entitled to close the account and recover any charges/penalty.
            </div>

            <div className="sbi-declaration-text">
              I/We understand that State Bank reserves entitled to assign any activities to any third party agency at its sole discretion. I/We hereby consent to, agree and authorise the Bank to disclose information and data relating to me/us and details of my/our account, to third party agencies including Bank's group entities, without any specific consent or authorization from me/us and I/we shall not hold the Bank liable for use of the information/data so disclosed.
            </div>

            <div className="sbi-declaration-text">
              I/We hereby agree and give consent for the disclosure or obtention by the Bank of all or any such information and data including personal data relating to me/us (as the case may be) from and to the Reserve Bank of India, State Bank of India or any of its subsidiaries/associates/group companies or any credit information company or any other agency authorized in this regard as the Bank may deem appropriate. This would also include exchange of information for marketing of third party products.
            </div>

            <div className="sbi-declaration-text">
              I/We understand that information relating to me/us and my/our account may be disclosed by the Bank to the Reserve Bank of India, other regulatory and statutory authorities and to any other agency as may be required under any law. I/We also understand that the Bank may be required to disclose information relating to me/us and my/our account to any Indian or foreign regulatory authority for the purposes of credit decisions, prevention of fraud and money laundering, reporting obligations or any other related purposes as may be required. I/We hereby agree and consent to such disclosure.
            </div>

            <div className="sbi-declaration-text">
              I/We understand that the Bank may, at its sole discretion, engage third parties and assign and transfer all its rights, benefits, obligations and liabilities under this application and the terms and conditions applicable to the account and/or any product or service availed by me/us, to any third party of its choice, without any notice to me/us. I/We also understand that the Bank may, at its sole discretion, transfer the amounts standing to the credit or products thereof prepared by them to banks/financial institutions and other entities, as may be specifically be concerned statutory/regulatory authority in this behalf.
            </div>

            <div className="sbi-declaration-text">
              I/We understand that in case of any change in my/our address, phone number, e-mail address and other contact details, I/we shall intimate the Bank immediately. In case of failure to intimate, all communications sent by the Bank to my/our address last recorded in the Bank's record shall be deemed to have been received by me/us. I/We understand to intimate the Bank in the event of any change in the matter stated above.
            </div>

            <div className="sbi-declaration-text">
              I/We understand that option exercised between the three life insurance product offered by SBI is a final and cannot be changed at a later stage.
            </div>

            <div className="sbi-declaration-text">
              I/We further acknowledge that I/we have read, understood and agree with the Most Important Terms and Conditions governing the home loan product chosen by me/us.
            </div>

            <div className="sbi-declaration-text">
              I/We authorize the Bank to send information about various products and services to me/us by way of letters, telephone calls, SMSs, e-mails, or any other mode of communication. I/We also authorize the Bank to share my/our information with its group companies/associates/subsidiaries/affiliates/joint ventures of State Bank of India for any person in whom the Bank has entered/proposes to enter into any arrangement for sale of products and services or for provision of services to the Bank or for any other business purposes whatsoever. I/We also authorize the Bank and such entities to contact me/us for cross selling of any products/services or for any other business purposes whatsoever.
            </div>

            <div className="sbi-declaration-text">
              I/We agree to SBI Newsletter and marketing information and/or any special offers that may be emailed to us about products and services available from SBI / SBI Group that may be of interest to me/us (Applicable to users of NRI customers only).
            </div>

            {/* Editable input box ABOVE the "Please mention" text */}
            <input 
              type="text" 
              className="sbi-declaration-input-box"
              value={formData.marketingResponse || ""}
              onChange={(e) => setField("marketingResponse", e.target.value)}
              placeholder="Enter Yes or No"
            />

            <div className="sbi-declaration-text">
              (Please mention "Yes" if interested and "No" if not interested)
            </div>

            <div className="sbi-declaration-checkbox-row">
              <label className="sbi-checkbox-label">
                <span className="sbi-checkbox-text">If interested, please tick the relevant boxes. I/we prefer following mode of communication. (Customer may tick anyone/all as below)</span>
              </label>
            </div>

            <div className="sbi-declaration-checkbox-row">
              <label className="sbi-checkbox-label">
                <input 
                  type="checkbox" 
                  className="sbi-checkbox"
                  checked={formData.communicationPreference?.email || false}
                  onChange={(e) => setField("communicationPreference", { 
                    ...formData.communicationPreference, 
                    email: e.target.checked 
                  })}
                />
                <span className="sbi-checkbox-text">Email</span>
              </label>
              <label className="sbi-checkbox-label">
                <input 
                  type="checkbox" 
                  className="sbi-checkbox"
                  checked={formData.communicationPreference?.phone || false}
                  onChange={(e) => setField("communicationPreference", { 
                    ...formData.communicationPreference, 
                    phone: e.target.checked 
                  })}
                />
                <span className="sbi-checkbox-text">Phone</span>
              </label>
              <label className="sbi-checkbox-label">
                <input 
                  type="checkbox" 
                  className="sbi-checkbox"
                  checked={formData.communicationPreference?.sms || false}
                  onChange={(e) => setField("communicationPreference", { 
                    ...formData.communicationPreference, 
                    sms: e.target.checked 
                  })}
                />
                <span className="sbi-checkbox-text">SMS</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
