import db from "../db.js";

/**
 * Get applicable ROI for a given bank, CIBIL score, loan amount, and employment type
 * @param {string} bankCode - Bank code (e.g., 'HDFC', 'SBI')
 * @param {number} cibilScore - CIBIL score
 * @param {number} loanAmount - Loan amount
 * @param {string} employmentType - Employment type ('salaried' or other)
 * @returns {Promise<object>} ROI configuration or default
 */
export async function getApplicableROI(bankCode, cibilScore, loanAmount, employmentType) {
    try {
        const query = `
            SELECT 
                brc.roi_salaried,
                brc.roi_non_salaried,
                brc.processing_fee,
                brc.cibil_min_score,
                brc.cibil_max_score,
                brc.loan_amount_min,
                brc.loan_amount_max,
                bm.bank_name,
                bm.bank_code
            FROM bank_roi_config brc
            JOIN bank_master bm ON brc.bank_id = bm.id
            WHERE bm.bank_code = $1 
            AND brc.is_active = true
            AND bm.is_active = true
            AND $2 >= brc.cibil_min_score 
            AND $2 <= brc.cibil_max_score
            AND $3 >= brc.loan_amount_min 
            AND $3 <= brc.loan_amount_max
            ORDER BY brc.cibil_min_score DESC, brc.loan_amount_min DESC
            LIMIT 1
        `;

        const result = await db.query(query, [
            bankCode.toUpperCase(),
            parseInt(cibilScore),
            parseFloat(loanAmount)
        ]);

        if (result.rows.length === 0) {
            // Return default rates if no configuration found
            return {
                roi: 8.8, // Default rate
                processingFee: null,
                isDefault: true,
                bankCode: bankCode.toUpperCase(),
                message: "No specific ROI configuration found, using default rates"
            };
        }

        const config = result.rows[0];
        const isSalaried = employmentType.toLowerCase() === 'salaried';
        const applicableROI = isSalaried ? config.roi_salaried : config.roi_non_salaried;

        return {
            roi: parseFloat(applicableROI),
            processingFee: config.processing_fee ? parseFloat(config.processing_fee) : null,
            bankName: config.bank_name,
            bankCode: config.bank_code,
            range: {
                cibilMin: config.cibil_min_score,
                cibilMax: config.cibil_max_score,
                loanAmountMin: config.loan_amount_min,
                loanAmountMax: config.loan_amount_max
            },
            isDefault: false,
            message: "ROI configuration found and applied"
        };

    } catch (error) {
        console.error("Error getting applicable ROI:", error);
        
        // Return default on error
        return {
            roi: 8.8, // Default rate
            processingFee: null,
            isDefault: true,
            bankCode: bankCode.toUpperCase(),
            message: "Error retrieving ROI configuration, using default rates",
            error: error.message
        };
    }
}

/**
 * Get applicable ROI rate as a decimal for calculations
 * @param {string} bankCode - Bank code
 * @param {number} cibilScore - CIBIL score
 * @param {number} loanAmount - Loan amount
 * @param {string} employmentType - Employment type
 * @returns {Promise<number>} ROI as decimal (e.g., 0.088 for 8.8%)
 */
export async function getROIDecimal(bankCode, cibilScore, loanAmount, employmentType) {
    const roiConfig = await getApplicableROI(bankCode, cibilScore, loanAmount, employmentType);
    return roiConfig.roi / 100; // Convert percentage to decimal
}

/**
 * Check if custom ROI configuration exists for a bank
 * @param {string} bankCode - Bank code
 * @returns {Promise<boolean>} True if custom configuration exists
 */
export async function hasCustomROI(bankCode) {
    try {
        const query = `
            SELECT COUNT(*) as count
            FROM bank_roi_config brc
            JOIN bank_master bm ON brc.bank_id = bm.id
            WHERE bm.bank_code = $1 
            AND brc.is_active = true
            AND bm.is_active = true
        `;

        const result = await db.query(query, [bankCode.toUpperCase()]);
        return parseInt(result.rows[0].count) > 0;
    } catch (error) {
        console.error("Error checking custom ROI:", error);
        return false;
    }
} 