import { getROIDecimal } from "./roiService.js";

export /**
* Calculates SBI home loan eligibility based on applicant/co-applicant details and property information.
* Assumptions:
* - Applicant must be under 70 years of age at loan maturity
* - Loan tenure capped at 30 years
*/
async function calculateSbiLoanEligibility({
 applicant,
 coApplicant,
 property,
}) {
 // Function to get dynamic interest rate based on applicant details and loan amount
 async function getDynamicInterestRate(cibilScore, loanAmount, employmentType) {
     const defaultRate = 0.088; // 8.8% fallback rate
     try {
         const rate = await getROIDecimal('SBI', cibilScore, loanAmount, employmentType);
         console.log(`SBI Dynamic ROI for CIBIL: ${cibilScore}, Loan: ${loanAmount}, Type: ${employmentType} = ${(rate * 100).toFixed(2)}%`);
         return rate;
     } catch (error) {
         console.error("Error getting dynamic ROI for SBI, using default:", error);
         return defaultRate;
     }
 }

 // Function to estimate CIBIL score from applicant profile (can be enhanced with actual CIBIL data)
 function getEstimatedCibilScore(applicant) {
     // Default estimation based on profile and income
     // This can be replaced with actual CIBIL score when available
     const baseCibil = applicant.profile === 'salaried' ? 750 : 720;
     const income = applicant.profile === 'salaried' ? applicant.grossSalary : (applicant.grossProfitAnnual / 12);
     
     // Adjust based on income level
     if (income >= 100000) return Math.min(baseCibil + 30, 850);
     if (income >= 75000) return Math.min(baseCibil + 20, 830);
     if (income >= 50000) return Math.min(baseCibil + 10, 810);
     if (income < 30000) return Math.max(baseCibil - 50, 650);
     
     return baseCibil;
 }

 // Function to get primary applicant employment type
 function getPrimaryEmploymentType(applicant) {
     return applicant.profile === 'salaried' ? 'salaried' : 'non-salaried';
 }

 // FOIR based on net salary (SBI considers net salary)
 function getFOIR(netSalary) {
   if (netSalary < 50000) return 0.55;
   if (netSalary <= 66000) return 0.60;
   if (netSalary <= 83000) return 0.65;
   return 0.70;
 }

 // Calculate monthly income from gross salary by assuming standard deductions
 function getNetSalary(grossSalary) {
   // Approximation: 4% deduction for salaried profiles
   return grossSalary * 0.96;
 }

 // Monthly income logic for SBI
 function getMonthlyIncome(person) {
   const {
     profile,
     grossSalary = 0,
     grossProfitAnnual = 0,
   } = person;

   if (profile === 'salaried') {
     const netSalary = getNetSalary(grossSalary);
     return netSalary;
   } else {
     // SENP or SEP
     return grossProfitAnnual / 12;
   }
 }

 function getTenureLeft(age) {
   const maxTenureYears = 30;
   const maxAgeLimit = 70;
   const tenure = Math.min(maxTenureYears, maxAgeLimit - age);
   return tenure > 0 ? tenure : 0;
 }

 function getEligibleEMI(netIncome, obligations) {
   const foir = getFOIR(netIncome);
   return Math.max(0, netIncome * foir - obligations);
 }

 function calculateLoanFromEMI(emi, tenureYears, interestRate) {
   if (tenureYears <= 0) return 0;
   const r = interestRate / 12;
   const n = tenureYears * 12;
   const multiplier = (1 - Math.pow(1 + r, -n)) / r;
   return emi * multiplier;
 }

 // Get primary applicant details for CIBIL and employment type
 const primaryCibilScore = getEstimatedCibilScore(applicant);
 const primaryEmploymentType = getPrimaryEmploymentType(applicant);

 // Initial calculation to estimate loan amount for ROI lookup
 const incomeApp = getMonthlyIncome(applicant);
 const incomeCo = getMonthlyIncome(coApplicant);
 const totalMonthlyIncome = incomeApp + incomeCo;
 const estimatedLoanAmount = totalMonthlyIncome * 60; // Rough estimate: 60x monthly income

 // Get initial interest rate based on estimated loan amount
 let interestRate = await getDynamicInterestRate(primaryCibilScore, estimatedLoanAmount, primaryEmploymentType);

 const tenureApp = getTenureLeft(applicant.age);
 const netApp = getNetSalary(applicant.grossSalary);
 const emiApp = getEligibleEMI(netApp, applicant.obligation);
 const loanApp = calculateLoanFromEMI(emiApp, tenureApp, interestRate);

 const tenureCo = getTenureLeft(coApplicant.age);
 const netCo = getNetSalary(coApplicant.grossSalary);
 const emiCo = getEligibleEMI(netCo, coApplicant.obligation);
 const loanCo = calculateLoanFromEMI(emiCo, tenureCo, interestRate);

 const totalLoanByIncome = loanApp + loanCo;

 const gst = property.gstPercent * property.agreementValue;
 const costSheetValue = property.agreementValue + gst + property.otherCharges;

 const costSheetLoan = 0.90 * costSheetValue;

 function getLTV(value) {
   if (value <= 3000000) return 0.90;
   if (value <= 10000000) return 0.80;
   return 0.75;
 }

 const marketValue = costSheetValue; // Assuming marketValue same as cost sheet for now
 const ltv = getLTV(marketValue);
 const marketValueLoan = ltv * marketValue;

 const preliminaryLoan = Math.min(totalLoanByIncome, costSheetLoan, marketValueLoan);

 // Recalculate interest rate based on actual loan amount if significantly different
 const loanAmountDifference = Math.abs(preliminaryLoan - estimatedLoanAmount) / estimatedLoanAmount;
 if (loanAmountDifference > 0.2) { // If difference is more than 20%
     console.log(`Recalculating SBI ROI: Initial estimate ${estimatedLoanAmount}, Actual ${preliminaryLoan}`);
     interestRate = await getDynamicInterestRate(primaryCibilScore, preliminaryLoan, primaryEmploymentType);
     
     // Recalculate loans with updated interest rate
     const updatedLoanApp = calculateLoanFromEMI(emiApp, tenureApp, interestRate);
     const updatedLoanCo = calculateLoanFromEMI(emiCo, tenureCo, interestRate);
     const updatedTotalLoanByIncome = updatedLoanApp + updatedLoanCo;
     
     const finalLoan = Math.min(updatedTotalLoanByIncome, costSheetLoan, marketValueLoan);
     const ownContribution = costSheetValue - finalLoan;

     return {
       loanEligibility: Math.round(finalLoan),
       ownContribution: Math.round(ownContribution),
       emiApplicant: Math.round(emiApp),
       emiCoApplicant: Math.round(emiCo),
       totalEMI: Math.round(emiApp + emiCo),
       tenureApplicant: tenureApp,
       tenureCoApplicant: tenureCo,
       costSheetValue: Math.round(costSheetValue),
       ltvPercent: (ltv * 100).toFixed(2) + '%',
       appliedInterestRate: (interestRate * 100).toFixed(2) + "%",
       estimatedCibilScore: primaryCibilScore,
       employmentType: primaryEmploymentType,
     };
 } else {
     // Use preliminary calculation
     const finalLoan = preliminaryLoan;
     const ownContribution = costSheetValue - finalLoan;

     return {
       loanEligibility: Math.round(finalLoan),
       ownContribution: Math.round(ownContribution),
       emiApplicant: Math.round(emiApp),
       emiCoApplicant: Math.round(emiCo),
       totalEMI: Math.round(emiApp + emiCo),
       tenureApplicant: tenureApp,
       tenureCoApplicant: tenureCo,
       costSheetValue: Math.round(costSheetValue),
       ltvPercent: (ltv * 100).toFixed(2) + '%',
       appliedInterestRate: (interestRate * 100).toFixed(2) + "%",
       estimatedCibilScore: primaryCibilScore,
       employmentType: primaryEmploymentType,
     };
 }
}

//Example usage
const result = calculateSbiLoanEligibility({
  applicant: {
    age: 35,
    profile: "salaried",
    grossSalary: 142750,
    grossProfitAnnual: 0,
    obligation: 21000,
  },
  coApplicant: {
    age: 31,
    profile: "salaried",
    grossSalary: 50000,
    grossProfitAnnual: 0,
    obligation: 15000,
  },
  property: {
    agreementValue: 8100000,
    gstPercent: 0.05,
    otherCharges: 200000,
    status: "under_construction",
  },
});

console.log(result);