import db from "../../db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import libre from "libreoffice-convert";
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisify libre.convert for async/await usage
const convertAsync = promisify(libre.convert);

export async function getLoanOffers(req, res) {
    const client = db;
    try {
        const { userId } = req.params || req.body;
        console.log(userId);
        // First check if the offer already exists
        const offerRes = await client.query("SELECT * FROM lfi_sanctions WHERE user_id = $1", [userId]);
        if (offerRes.rows.length > 0) {
            // Map DB rows to the expected structure with hardcoded logo
            const offers = offerRes.rows.map(row => ({
                bank: row.bank_name,
                logo: row.bank_name === "HDFC Bank" ? "/logo/hdfcLogo.png" : "/logo/sbiLogo.png",
                maxAmount: `₹${Number(row.max_amount).toLocaleString("en-IN")}`,
                tenure: `${row.tenure_years} years`,
                interestRate: row.interest_rate,
                totalEMI: `₹${Number(row.total_emi).toLocaleString("en-IN")}`,
            }));
            console.log(offers);
            return res.status(200).json(offers);
        }

        // 1. Ensure user exists
        const userRes = await client.query("SELECT id FROM users WHERE id = $1", [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        /* -------------------------- Helper utilities ------------------------- */
        const calcAge = (dob) => {
            if (!dob) return 0;
            const diffMs = Date.now() - new Date(dob).getTime();
            const ageDt = new Date(diffMs);
            return Math.abs(ageDt.getUTCFullYear() - 1970);
        };

        const mapProfile = (employmentType) => {
            switch ((employmentType || "").toLowerCase()) {
                case "salaried":
                    return "salaried";
                case "professional":
                    return "SEP"; // Self-employed professional
                case "self-employed":
                    return "SENP"; // Self-employed non-professional
                default:
                    return "salaried";
            }
        };

        /* ---------------------------- APPLICANT ----------------------------- */
        const personalRes = await client.query(
            "SELECT date_of_birth FROM personal_details WHERE user_id = $1",
            [userId],
        );
        const applicantAge = personalRes.rows[0] ? calcAge(personalRes.rows[0].date_of_birth) : 0;

        const incomeRes = await client.query(
            `SELECT *
             FROM income_details WHERE user_id = $1`,
            [userId],
        );
        const incomeRow = incomeRes.rows[0] || {};

        // obligations (EMI) for applicant
        let applicantObligation = 0;
        if (incomeRow.id) {
            const loansRes = await client.query(
                "SELECT emi_rate FROM existing_loans WHERE income_detail_id = $1 AND user_id = $2",
                [incomeRow.id, userId],
            );
            applicantObligation = loansRes.rows.reduce((sum, r) => sum + Number(r.emi_rate || 0), 0);
        }

        /* --------------------------- CO-APPLICANT --------------------------- */
        // Pick the first co-applicant if available (can be enhanced later)
        const coAppRes = await client.query(
            "SELECT id, date_of_birth FROM co_applicants WHERE user_id = $1 LIMIT 1",
            [userId],
        );

        let coApplicant = {
            age: 0,
            profile: "SEP",
            grossSalary: 0,
            grossProfitAnnual: 0,
            obligation: 0,
        };

        if (coAppRes.rows.length) {
            const caId = coAppRes.rows[0].id;
            const caAge = calcAge(coAppRes.rows[0].date_of_birth);

            const caIncRes = await client.query(
                `SELECT employment_type, employer_type, gross_salary, net_salary, id
                 FROM co_applicant_income_details WHERE co_applicant_id = $1 LIMIT 1`,
                [caId],
            );
            const caInc = caIncRes.rows[0] || {};

            // Co-applicant obligations
            const caLoanRes = await client.query(
                "SELECT emi_rate FROM co_applicant_existing_loans WHERE co_applicant_id = $1",
                [caId],
            );
            const caObligation = caLoanRes.rows.reduce((sum, r) => sum + Number(r.emi_rate || 0), 0);

            const caProfile = mapProfile(caInc.employment_type);
            let caGrossSalary = 0;
            let caGrossProfitAnnual = 0;

            if (caProfile === "salaried") {
                caGrossSalary = Number(caInc.gross_salary || caInc.net_salary || 0);
            } else {
                // For SEP/SENP treat monthly income as net_salary/gross_salary and annualize
                const monthly = Number(caInc.net_salary || caInc.gross_salary || 0);
                caGrossProfitAnnual = monthly * 12;
            }

            coApplicant = {
                age: caAge,
                profile: caProfile,
                employerType: caInc.employer_type,
                grossSalary: caGrossSalary,
                grossProfitAnnual: caGrossProfitAnnual,
                obligation: caObligation,
            };
        }

        /* ---------------------------- PROPERTY ------------------------------ */
        const propRes = await client.query(
            `SELECT property_status, agreement_value, gst_charges, other_charges
             FROM property_details WHERE user_id = $1`,
            [userId],
        );
        const prop = propRes.rows[0] || {};

        const agreementValue = Number(prop.agreement_value) === 0 || !prop.agreement_value ? 500000000 : Number(prop.agreement_value);
        const gstCharges = Number(prop.gst_charges || 0) || 0;
        const otherCharges = Number(prop.other_charges || 0) || 0;
        const gstPercent =gstCharges / agreementValue;

        const property = {
            agreementValue,
            gstPercent,
            otherCharges,
            status: prop.property_status || "ready_to_move",
        };

        /* --------------------- Compose applicant payload -------------------- */
        const applicant = {
            age: applicantAge,
            profile: mapProfile(incomeRow.employment_type),
            employerType: incomeRow.employer_type,
            grossSalary: incomeRow.employment_type === "salaried" ? Number(incomeRow.gross_salary || 0) + Number(incomeRow.rent_income * 0.7) + Number(incomeRow.monthly_incentive * 0.75) + Number(incomeRow.annual_bonus * 0.5) : Number(incomeRow.gross_salary || 0),
            grossProfitAnnual: Number(incomeRow.gross_itr_income || 0),
            obligation: applicantObligation,
        };
        // console.log("HERE @");
        
        /* ---------------------- Calculate Bank Offers ----------------------- */
        // Dynamically import calculators to avoid circular deps
        const { default: calculateHdfcLoanEligibility } = await import("../../services/hdfcOffer.js");
        const { calculateSbiLoanEligibility } = await import("../../services/sbiOffer.js");

        console.log(applicant, coApplicant, property);
        
        // HDFC - Now async
        const hdfcResult = await calculateHdfcLoanEligibility({ applicant, coApplicant, property });

        const hdfcOffer = {
            bank: "HDFC Bank",
            logo: '/logo/hdfcLogo.png',
            maxAmount: `₹${hdfcResult.loanEligibility.toLocaleString("en-IN")}`,
            tenure: `${Math.max(hdfcResult.tenureApplicant, hdfcResult.tenureCoApplicant)} years`,
            interestRate: hdfcResult.appliedInterestRate || "8.8% p.a", // Use dynamic rate
            totalEMI: `₹${hdfcResult.totalEMI.toLocaleString("en-IN")}`,
        };
        console.log(hdfcOffer);

        // SBI - Now async
        const sbiInput = {
            applicant: applicant,
            coApplicant: coApplicant,
            property: property,
        };
        const sbiResult = await calculateSbiLoanEligibility(sbiInput);

        const sbiOffer = {
            bank: "SBI Bank",
            logo: '/logo/sbiLogo.png',
            maxAmount: `₹${Number(sbiResult.loanEligibility).toLocaleString("en-IN")}`,
            tenure: `${Math.max(sbiResult.tenureApplicant, sbiResult.tenureCoApplicant)} years`,
            interestRate: sbiResult.appliedInterestRate || "8.8% p.a", // Use dynamic rate
            totalEMI: `₹${sbiResult.totalEMI.toLocaleString("en-IN")}`,
        };

        // Save both offers to lfi_sanctions table
        try {
            // First, check if offers already exist for this user and delete them to avoid duplicates
            await client.query("DELETE FROM lfi_sanctions WHERE user_id = $1", [userId]);

            // Insert HDFC offer
            await client.query(`
                INSERT INTO lfi_sanctions (
                    user_id, bank_name, max_amount, tenure_years, 
                    interest_rate, loan_eligibility, tenure_applicant, tenure_co_applicant, total_emi
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                userId,
                "HDFC Bank",
                hdfcResult.loanEligibility,
                Math.max(hdfcResult.tenureApplicant, hdfcResult.tenureCoApplicant),
                hdfcResult.appliedInterestRate || "8.8% p.a",
                hdfcResult.loanEligibility,
                hdfcResult.tenureApplicant,
                hdfcResult.tenureCoApplicant,
                hdfcResult.totalEMI
            ]);

            // Insert SBI offer
            await client.query(`
                INSERT INTO lfi_sanctions (
                    user_id, bank_name, max_amount, tenure_years, 
                    interest_rate, loan_eligibility, tenure_applicant, tenure_co_applicant, total_emi
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                userId,
                "SBI Bank",
                Number(sbiResult.loanEligibility),
                Math.max(sbiResult.tenureApplicant, sbiResult.tenureCoApplicant),
                sbiResult.appliedInterestRate || "8.8% p.a",
                Number(sbiResult.loanEligibility),
                sbiResult.tenureApplicant,
                sbiResult.tenureCoApplicant,
                sbiResult.totalEMI
            ]);

            console.log(`Saved loan offers for user ${userId} to lfi_sanctions table`);
        } catch (saveError) {
            console.error("Error saving offers to lfi_sanctions:", saveError);
            // Don't fail the request if saving fails, just log the error
        }

        return res.status(200).json([hdfcOffer, sbiOffer]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getLFISanctions(req, res) {
    try {
        const { userId } = req.params;
        console.log(userId);
        // Validate user exists
        const userRes = await db.query("SELECT id FROM users WHERE id = $1", [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        // Get LFI sanctions for the user
        const sanctionsQuery = `
            SELECT 
                id,
                bank_name,
                max_amount,
                tenure_years,
                interest_rate,
                loan_eligibility,
                status,
                created_at,
                updated_at
            FROM lfi_sanctions 
            WHERE user_id = $1 AND status = 'active'
            ORDER BY created_at DESC
        `;

        const result = await db.query(sanctionsQuery, [userId]);
        const sanctions = result.rows;

        if (sanctions.length === 0) {
            return res.status(200).json({
                message: "No active LFI sanctions found",
                sanctions: [],
                totalAmount: 0,
                maxAmount: 0
            });
        }
        // console.log("HERE");

        // Calculate totals
        const totalAmount = sanctions.reduce((sum, sanction) => sum + Number(sanction.max_amount), 0);
        const maxAmount = Math.max(...sanctions.map(s => Number(s.max_amount)));

        const amountRange = {
            min: Math.min(...sanctions.map(s => Number(s.max_amount))),
            max: Math.max(...sanctions.map(s => Number(s.max_amount)))
        };

        // Helper to format numbers as "48 Lakhs" or "2 Cr"
        function formatIndianAmountShort(amount) {
            if (amount >= 10000000) {
                // Crores
                return `${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 2)} Cr`;
            } else if (amount >= 100000) {
                // Lakhs
                return `${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 2)} Lakhs`;
            } else if (amount >= 1000) {
                // Thousands
                return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 2)} Thousand`;
            } else {
                return amount.toString();
            }
        }

        const amountRangeFormatted = `₹${formatIndianAmountShort(amountRange.min)} - ₹${formatIndianAmountShort(amountRange.max)}`;
        // Format the response
        const formattedSanctions = sanctions.map(sanction => ({
            id: sanction.id,
            bankName: sanction.bank_name,
            maxAmount: Number(sanction.max_amount),
            maxAmountFormatted: `₹${Number(sanction.max_amount).toLocaleString("en-IN")}`,
            tenureYears: sanction.tenure_years,
            interestRate: sanction.interest_rate,
            loanEligibility: Number(sanction.loan_eligibility),
            status: sanction.status,
            createdAt: sanction.created_at,
            updatedAt: sanction.updated_at
        }));

        return res.status(200).json({
            message: "LFI sanctions retrieved successfully",
            sanctions: formattedSanctions,
            totalAmount,
            maxAmount,
            totalAmountFormatted: `₹${totalAmount.toLocaleString("en-IN")}`,
            maxAmountFormatted: `₹${maxAmount.toLocaleString("en-IN")}`,
            count: sanctions.length,
            amountRange,
            amountRangeFormatted
        });

    } catch (err) {
        console.error("Error fetching LFI sanctions:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getAllLFISanctions(req, res) {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        
        // Base query for counting total records
        let countQuery = `
            SELECT COUNT(*) as total
            FROM lfi_sanctions lfi
            JOIN users u ON lfi.user_id = u.id
            LEFT JOIN personal_details pd ON u.id = pd.user_id
            LEFT JOIN leads l ON u.id = l.customer_id
            WHERE lfi.status = 'active'
        `;
        
        // Base query for fetching records
        let sanctionsQuery = `
            SELECT 
                lfi.id,
                lfi.bank_name,
                lfi.max_amount,
                lfi.tenure_years,
                lfi.interest_rate,
                lfi.loan_eligibility,
                lfi.status,
                lfi.created_at,
                lfi.updated_at,
                u.id as customer_id,
                CONCAT(pd.first_name, ' ', pd.last_name) as customer_name,
                l.id as lead_id
            FROM lfi_sanctions lfi
            JOIN users u ON lfi.user_id = u.id
            LEFT JOIN personal_details pd ON u.id = pd.user_id
            LEFT JOIN leads l ON u.id = l.customer_id
            WHERE lfi.status = 'active'
        `;

        let queryParams = [];
        let paramCount = 0;

        // Add search functionality
        if (search) {
            const searchCondition = ` AND (
                CONCAT(pd.first_name, ' ', pd.last_name) ILIKE $${++paramCount} OR
                lfi.bank_name ILIKE $${++paramCount} OR
                CAST(l.id AS VARCHAR) ILIKE $${++paramCount} OR
                pd.mobile ILIKE $${++paramCount}
            )`;
            
            countQuery += searchCondition;
            sanctionsQuery += searchCondition;
            
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }

        // Get total count
        const countResult = await db.query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].total);

        // Add pagination
        const offset = (page - 1) * limit;
        sanctionsQuery += ` ORDER BY lfi.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
        queryParams.push(limit, offset);

        const result = await db.query(sanctionsQuery, queryParams);
        const sanctions = result.rows;

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);

        // Format the response
        const formattedSanctions = sanctions.map(sanction => ({
            id: sanction.id,
            bankName: sanction.bank_name,
            maxAmount: Number(sanction.max_amount),
            maxAmountFormatted: `₹${Number(sanction.max_amount).toLocaleString("en-IN")}`,
            tenureYears: sanction.tenure_years,
            interestRate: sanction.interest_rate,
            loanEligibility: Number(sanction.loan_eligibility),
            status: sanction.status,
            createdAt: sanction.created_at,
            updatedAt: sanction.updated_at,
            customerName: sanction.customer_name || 'Unknown Customer',
            customerId: sanction.customer_id,
            leadId: sanction.lead_id ? `#${sanction.lead_id}` : 'No Lead'
        }));

        return res.status(200).json({
            message: "All LFI sanctions retrieved successfully",
            sanctions: formattedSanctions,
            count: sanctions.length,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages
            }
        });

    } catch (err) {
        console.error("Error fetching all LFI sanctions:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getSalesManagerLoanOffers(req, res) {
    try {
        const formData = req.body;

        /* -------------------------- Helper utilities ------------------------- */
        const calcAge = (dob) => {
            if (!dob) return 30; // Default age if not provided
            const diffMs = Date.now() - new Date(dob).getTime();
            const ageDt = new Date(diffMs);
            return Math.abs(ageDt.getUTCFullYear() - 1970);
        };

        const mapProfile = (employmentType) => {
            switch ((employmentType || "").toLowerCase()) {
                case "salaried":
                case "government":
                case "private":
                    return "salaried";
                case "professional":
                    return "SEP"; // Self-employed professional
                case "self-employed":
                case "business":
                    return "SENP"; // Self-employed non-professional
                default:
                    return "salaried";
            }
        };

        /* ---------------------------- APPLICANT ----------------------------- */
        const applicantAge = 30; // Default age since no DOB in form
        
        // Map form data to applicant structure
        const applicant = {
            age: applicantAge,
            profile: mapProfile(formData.typeOfEmployer),
            employerType: formData.typeOfEmployer || "private",
            grossSalary: Number(formData.monthlyGrossSalary || 0) + Number(formData.rentIncome || 0) * 0.7 + Number(formData.averageMonthlyIncentive || 0) * 0.75 + Number(formData.annualBonus || 0) / 12 * 0.5,
            grossProfitAnnual: (Number(formData.monthlyGrossSalary || 0) + Number(formData.rentIncome || 0) + Number(formData.averageMonthlyIncentive || 0)) * 12,
            obligation: 0, // No existing loan details in form
        };

        /* --------------------------- CO-APPLICANT --------------------------- */
        // No co-applicant data in form, use default empty structure
        const coApplicant = {
            age: 0,
            profile: "SEP",
            grossSalary: 0,
            grossProfitAnnual: 0,
            obligation: 0,
        };

        /* ---------------------------- PROPERTY ------------------------------ */
        // Default property values since not in form
        const property = {
            agreementValue: 50000000, // Default 5 Cr property
            gstPercent: 0.12,
            otherCharges: 100000,
            status: "ready_to_move",
        };

        /* ---------------------- Calculate Bank Offers ----------------------- */
        // Dynamically import calculators to avoid circular deps
        const { default: calculateHdfcLoanEligibility } = await import("../../services/hdfcOffer.js");
        const { calculateSbiLoanEligibility } = await import("../../services/sbiOffer.js");

        console.log("Sales Manager Loan Calculation:", { applicant, coApplicant, property });
        
        // HDFC - Now async
        const hdfcResult = await calculateHdfcLoanEligibility({ applicant, coApplicant, property });

        const hdfcOffer = {
            bank: "HDFC Bank",
            logo: '/logo/hdfcLogo.png',
            maxAmount: `₹${hdfcResult.loanEligibility.toLocaleString("en-IN")}`,
            tenure: `${Math.max(hdfcResult.tenureApplicant, hdfcResult.tenureCoApplicant)} years`,
            interestRate: hdfcResult.appliedInterestRate || "8.8% p.a", // Use dynamic rate
            totalEMI: `₹${hdfcResult.totalEMI.toLocaleString("en-IN")}`,
        };

        // SBI - Now async
        const sbiInput = {
            applicant: applicant,
            coApplicant: coApplicant,
            property: property,
        };
        const sbiResult = await calculateSbiLoanEligibility(sbiInput);

        const sbiOffer = {
            bank: "SBI Bank",
            logo: '/logo/sbiLogo.png',
            maxAmount: `₹${Number(sbiResult.loanEligibility).toLocaleString("en-IN")}`,
            tenure: `${Math.max(sbiResult.tenureApplicant, sbiResult.tenureCoApplicant)} years`,
            interestRate: sbiResult.appliedInterestRate || "8.8% p.a", // Use dynamic rate
            totalEMI: `₹${sbiResult.totalEMI.toLocaleString("en-IN")}`,
        };

        // Return offers without saving to database
        return res.status(200).json([hdfcOffer, sbiOffer]);
    } catch (err) {
        console.error("Error calculating sales manager loan offers:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function generateLFISanctionLetter(req, res) {
    try {
        const { userId } = req.params;

        // Verify user exists
        const userRes = await db.query("SELECT id, name, email FROM users WHERE id = $1", [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userRes.rows[0];

        // Get personal details
        const personalRes = await db.query(
            `SELECT first_name, middle_name, last_name, street_address, city, state, pin_code , gender
             FROM personal_details WHERE user_id = $1`,
            [userId]
        );

        // Get LFI sanctions
        const sanctionsRes = await db.query(
            `SELECT bank_name, max_amount, tenure_years, interest_rate, total_emi, created_at
             FROM lfi_sanctions WHERE user_id = $1 AND status = 'active' 
             ORDER BY max_amount DESC LIMIT 1`,
            [userId]
        );
        
        if (sanctionsRes.rows.length === 0) {
            return res.status(404).json({ error: "No active LFI sanctions found for this user" });
        }
        
        // Get co-applicant details if available
        const coApplicantRes = await db.query(
            `SELECT first_name, last_name FROM co_applicants WHERE user_id = $1 LIMIT 1`,
            [userId]
        );

        // Get property details if available
        const propertyRes = await db.query(
            `SELECT street_address, city, state FROM property_details WHERE user_id = $1`,
            [userId]
        );


        const personalDetails = personalRes.rows[0] || {};
        const sanction = sanctionsRes.rows[0];
        const coApplicant = coApplicantRes.rows[0];
        const property = propertyRes.rows[0];

        // Prepare data for template replacement
        const templateData = {
            date: new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short', 
                year: 'numeric'
            }),
            refNo: `LFI/${new Date().getFullYear()}/${String(userId).padStart(6, '0')}`,
            applicantName: `${personalDetails.first_name || ''} ${personalDetails.middle_name || ''} ${personalDetails.last_name || ''}`.trim() || user.name,
            address: `${personalDetails.street_address || ''}\n${personalDetails.city || ''}, ${personalDetails.state || ''} - ${personalDetails.pin_code || ''}`.replace(/^[\n, -]+|[\n, -]+$/g, ''),
            salutation: personalDetails.gender === 'male' ? 'Mr.' : 'Ms.',
            applicantFullName: `${personalDetails.first_name || ''} ${personalDetails.middle_name || ''} ${personalDetails.last_name || ''}`.trim() || user.name,
            coApplicantName: coApplicant ? `${coApplicant.first_name} ${coApplicant.last_name}` : 'N/A',
            loanAmount: Number(sanction.max_amount).toLocaleString('en-IN'),
            loanAmountWords: convertNumberToWords(Number(sanction.max_amount)),
            propertyAddress: property ? `${property.street_address || ''}, ${property.city || ''}, ${property.state || ''}`.replace(/^[, -]+|[, -]+$/g, '') : 'To be finalized',
            tenure: sanction.tenure_years,
            interestRate: `${sanction.interest_rate} p.a. (floating)`, // Use dynamic rate from database
            emi: Number(sanction.total_emi).toLocaleString('en-IN'),
            applicantLastName: personalDetails.last_name || user.name.split(' ').pop() || 'Customer'
        };

        // Process DOCX template
        const templatePath = path.join(__dirname, '../../public/LoanForIndia_InPrinciple_Sanction_Letter[2].docx');
        
        if (!fs.existsSync(templatePath)) {
            return res.status(500).json({ error: "Template file not found", path: templatePath });
        }

        try {
            // Read the template file
            const content = fs.readFileSync(templatePath, 'binary');
            const zip = new PizZip(content);
            
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            // Replace template variables
            doc.render(templateData);

            // Generate the DOCX document buffer
            const docxBuffer = doc.getZip().generate({
                type: 'nodebuffer',
                compression: 'DEFLATE',
            });

            // Convert DOCX to PDF using LibreOffice
            const pdfBuffer = await convertAsync(docxBuffer, '.pdf', undefined);

            // Set response headers for PDF download
            const filename = `LFI_Sanction_Letter_${templateData.refNo.replace(/\//g, '_')}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', pdfBuffer.length);

            // Send the PDF buffer
            res.send(pdfBuffer);

        } catch (docError) {
            console.error("Document processing error:", docError);
            
            // If template processing fails, return JSON with the data for debugging
            return res.status(500).json({ 
                error: "Failed to process document template", 
                details: docError.message,
                templateData: templateData,
                suggestion: "Please check if the DOCX template has the correct placeholders, or if LibreOffice is properly installed"
            });
        }

    } catch (err) {
        console.error("Error generating LFI sanction letter:", err);
        return res.status(500).json({ error: "Internal server error", details: err.message });
    }
}

// Helper function to convert numbers to words (simplified version)
function convertNumberToWords(amount) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (amount === 0) return 'Zero';
    
    // Simplified conversion for amounts up to crores
    const crores = Math.floor(amount / 10000000);
    const lakhs = Math.floor((amount % 10000000) / 100000);
    const thousands = Math.floor((amount % 100000) / 1000);
    const hundreds = Math.floor((amount % 1000) / 100);
    const remainder = amount % 100;

    let words = '';

    if (crores > 0) {
        words += convertTwoDigits(crores) + ' Crore ';
    }
    if (lakhs > 0) {
        words += convertTwoDigits(lakhs) + ' Lakh ';
    }
    if (thousands > 0) {
        words += convertTwoDigits(thousands) + ' Thousand ';
    }
    if (hundreds > 0) {
        words += ones[hundreds] + ' Hundred ';
    }
    if (remainder > 0) {
        words += convertTwoDigits(remainder);
    }

    function convertTwoDigits(num) {
        if (num < 10) return ones[num];
        if (num >= 10 && num < 20) return teens[num - 10];
        return tens[Math.floor(num / 10)] + (num % 10 > 0 ? ' ' + ones[num % 10] : '');
    }

    return words.trim() + ' Only';
}