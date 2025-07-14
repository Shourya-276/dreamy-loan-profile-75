import { getROIDecimal } from "./roiService.js";

export default async function calculateHdfcLoanEligibility({
    applicant,
    coApplicant,
    property,
}) {
    // Function to get dynamic interest rate based on applicant details and loan amount
    async function getDynamicInterestRate(cibilScore, loanAmount, employmentType) {
        const defaultRate = 0.088; // 8.8% fallback rate
        try {
            const rate = await getROIDecimal('HDFC', cibilScore, loanAmount, employmentType);
            console.log(`HDFC Dynamic ROI for CIBIL: ${cibilScore}, Loan: ${loanAmount}, Type: ${employmentType} = ${(rate * 100).toFixed(2)}%`);
            return rate;
        } catch (error) {
            console.error("Error getting dynamic ROI for HDFC, using default:", error);
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

    function getFOIR(gross) {
        if (gross < 50000) return 0.45;
        if (gross <= 66000) return 0.50;
        if (gross <= 83000) return 0.55;
        return 0.60;
    }

    function getTenureLeft(age, profile, employerType) {
        if (employerType === 'nri' || employerType === 'merchant-navy') return Math.min(60 - age, 15);
        if (profile === 'SEP') return Math.min(65 - age, 20);
        if (profile === 'SENP') return Math.min(65 - age, 15);
        return Math.min(60 - age, 30); // Salaried
    }

    function getEligibleEMI(profile, income, obligations) {
        const foir = getFOIR(income);
        return Math.max(0, income * foir - obligations);
    }

    function calculateLoanFromEMI(emi, tenureYears, interestRate) {
        const monthlyRate = interestRate / 12;
        const n = tenureYears * 12;
        const multiplier = (1 - Math.pow(1 + monthlyRate, -n)) / monthlyRate;
        return emi * multiplier;
    }

    // Get considered property value based on status
    function getConsideredPropertyValue(property) {
        const gst = property.gstPercent * property.agreementValue;
        const amenities = (property.status === "under_construction")
            ? 0.10 * property.agreementValue
            : 0;
        return property.agreementValue + gst + amenities + property.otherCharges;
    }

    function getLTV(consideredValue) {
        if (consideredValue > 9900000) return 0.75;
        if (consideredValue < 9400000) return 0.80;
        const diff = 9900000 - consideredValue;
        return 0.75 + (diff / 500000) * 0.05;
    }

    function getGrossMonthlyIncome(profile, grossSalary, grossProfitAnnual) {
        if (profile === "salaried") return grossSalary;
        return grossProfitAnnual / 12;
    }

    // Get primary applicant details for CIBIL and employment type
    const primaryCibilScore = getEstimatedCibilScore(applicant);
    const primaryEmploymentType = getPrimaryEmploymentType(applicant);

    // Initial calculation to estimate loan amount for ROI lookup
    const incomeApp = getGrossMonthlyIncome(applicant.profile, applicant.grossSalary, applicant.grossProfitAnnual);
    const incomeCo = getGrossMonthlyIncome(coApplicant.profile, coApplicant.grossSalary, coApplicant.grossProfitAnnual);
    const totalMonthlyIncome = incomeApp + incomeCo;
    const estimatedLoanAmount = totalMonthlyIncome * 60; // Rough estimate: 60x monthly income

    // Get initial interest rate based on estimated loan amount
    let interestRate = await getDynamicInterestRate(primaryCibilScore, estimatedLoanAmount, primaryEmploymentType);

    // Applicant Income + EMI Logic
    const tenureApp = getTenureLeft(applicant.age, applicant.profile, applicant.employerType);
    const emiApp = getEligibleEMI(applicant.profile, incomeApp, applicant.obligation);
    const loanApp = calculateLoanFromEMI(emiApp, tenureApp, interestRate);

    // Co-applicant Income + EMI Logic
    const tenureCo = getTenureLeft(coApplicant.age, coApplicant.profile, coApplicant.employerType);
    const emiCo = getEligibleEMI(coApplicant.profile, incomeCo, coApplicant.obligation);
    const loanCo = calculateLoanFromEMI(emiCo, tenureCo, interestRate);

    const totalLoanByIncome = loanApp + loanCo;
    console.log("totalLoanByIncome", totalLoanByIncome);
    // Property Value + LTV Based Loan Cap
    const consideredValue = getConsideredPropertyValue(property);
    const ltv = getLTV(consideredValue);
    const maxLoanByLTV = consideredValue * ltv;
    console.log("maxLoanByLTV", maxLoanByLTV);
    const preliminaryLoan = Math.min(totalLoanByIncome, maxLoanByLTV);

    // Recalculate interest rate based on actual loan amount if significantly different
    const loanAmountDifference = Math.abs(preliminaryLoan - estimatedLoanAmount) / estimatedLoanAmount;
    if (loanAmountDifference > 0.2) { // If difference is more than 20%
        console.log(`Recalculating ROI: Initial estimate ${estimatedLoanAmount}, Actual ${preliminaryLoan}`);
        interestRate = await getDynamicInterestRate(primaryCibilScore, preliminaryLoan, primaryEmploymentType);
        
        // Recalculate loans with updated interest rate
        const updatedLoanApp = calculateLoanFromEMI(emiApp, tenureApp, interestRate);
        const updatedLoanCo = calculateLoanFromEMI(emiCo, tenureCo, interestRate);
        const updatedTotalLoanByIncome = updatedLoanApp + updatedLoanCo;
        
        const finalLoan = Math.min(updatedTotalLoanByIncome, maxLoanByLTV);
        const ownContribution = consideredValue - finalLoan;

        return {
            loanEligibility: Math.round(finalLoan),
            ownContribution: Math.round(ownContribution),
            emiApplicant: Math.round(emiApp),
            emiCoApplicant: Math.round(emiCo),
            totalEMI: Math.round(emiApp + emiCo),
            tenureApplicant: tenureApp,
            tenureCoApplicant: tenureCo,
            consideredPropertyValue: Math.round(consideredValue),
            ltvPercent: (ltv * 100).toFixed(2) + "%",
            appliedInterestRate: (interestRate * 100).toFixed(2) + "%",
            estimatedCibilScore: primaryCibilScore,
            employmentType: primaryEmploymentType,
        };
    } else {
        // Use preliminary calculation
        const finalLoan = preliminaryLoan;
        const ownContribution = consideredValue - finalLoan;

        return {
            loanEligibility: Math.round(finalLoan),
            ownContribution: Math.round(ownContribution),
            emiApplicant: Math.round(emiApp),
            emiCoApplicant: Math.round(emiCo),
            totalEMI: Math.round(emiApp + emiCo),
            tenureApplicant: tenureApp,
            tenureCoApplicant: tenureCo,
            consideredPropertyValue: Math.round(consideredValue),
            ltvPercent: (ltv * 100).toFixed(2) + "%",
            appliedInterestRate: (interestRate * 100).toFixed(2) + "%",
            estimatedCibilScore: primaryCibilScore,
            employmentType: primaryEmploymentType,
        };
    }
}

// Example usage
// const result = calculateHdfcLoanEligibility({
//     applicant: {
//       age: 31,
//       profile: "salaried", // "SEP" or "SENP"
//       grossSalary: 85000,
//       grossProfitAnnual: 0,
//       obligation: 21000,
//     },
//     coApplicant: {
//       age: 31,
//       profile: "salaried",
//       grossSalary: 66000,
//       grossProfitAnnual: 0,
//       obligation: 3000,
//     },
//     property: {
//       agreementValue: 10000000,
//       gstPercent: 0.05,
//       otherCharges: 200000,
//       status: "under_construction", // or "ready_to_move" or "resale"
//     },
//   });
  
//   console.log(result);
  
  //1. based on income 
  //2. based on property value(when proterty is ready to move/resale) or cost sheet (considered when property is under construction)
  // for property value for cost sheet : Aggrement value + 10% of agreement value + gst(5% for under construction) + other charges = >94L then multiply by 75% and if <94L then multiply by 80%