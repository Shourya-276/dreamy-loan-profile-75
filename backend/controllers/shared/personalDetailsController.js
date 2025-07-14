import db from "../../db.js";
import { validatePersonalDetails } from "../../validators/inputValidation.js";

export async function savePersonalDetails(req, res) {
    try {
        const { errors, isValid } = validatePersonalDetails(req.body);
        if (!isValid) {
            return res.status(400).json({ errors });
        }

        const { userId } = req.body;
        const {
            firstName, middleName, lastName, email, mobile,
            aadhaarNumber, panCardNumber, gender, maritalStatus, dateOfBirth,
            streetAddress, pinCode, country, state, district, city,
            residenceType,
        } = req.body.personalDetails;

        // Verify the user exists
        const userResult = await db.query("SELECT id FROM users WHERE id = $1", [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if personal details already exist for this user
        const checkResult = await db.query("SELECT id FROM personal_details WHERE user_id = $1", [userId]);

        let result;
        if (checkResult.rows.length > 0) {
            // Update
            const updateQuery = `
                UPDATE personal_details 
                SET first_name = $1, middle_name = $2, last_name = $3, email = $4, mobile = $5,
                    aadhaar_number = $6, pan_card_number = $7, gender = $8, marital_status = $9, date_of_birth = $10,
                    street_address = $11, pin_code = $12, country = $13, state = $14,
                    district = $15, city = $16, residence_type = $17, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $18
                RETURNING id`;

            result = await db.query(updateQuery, [
                firstName, middleName, lastName, email, mobile,
                aadhaarNumber, panCardNumber, gender, maritalStatus, dateOfBirth,
                streetAddress, pinCode, country, state, district, city,
                residenceType,
                userId,
            ]);

            return res.status(200).json({
                message: "Personal details updated successfully",
                id: result.rows[0].id,
            });
        } else {
            // Insert
            const insertQuery = `
                INSERT INTO personal_details (
                    user_id, first_name, middle_name, last_name, email, mobile,
                    aadhaar_number, pan_card_number, gender, date_of_birth,
                    street_address, pin_code, country, state, district, city,
                    created_at, updated_at, marital_status, residence_type
                ) VALUES (
                    $1, $2, $3, $4, $5, $6,
                    $7, $8, $9, $10,
                    $11, $12, $13, $14, $15, $16,
                    $17, $18, $19, $20
                ) RETURNING id`;

            result = await db.query(insertQuery, [
                userId, firstName, middleName, lastName, email, mobile,
                aadhaarNumber, panCardNumber, gender, dateOfBirth,
                streetAddress, pinCode, country, state, district, city,
                new Date(), new Date(), maritalStatus, residenceType,
            ]);

            return res.status(201).json({
                message: "Personal details saved successfully",
                id: result.rows[0].id,
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal server error");
    }
}

export async function getPersonalDetails(req, res) {
    try {
        const { userId } = req.params;
        // console.log("HELLO");
        const userResult = await db.query("SELECT id FROM users WHERE id = $1", [userId]);
        // console.log(userResult.rows);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const detailsQuery = `
            SELECT 
                first_name, middle_name, last_name, email, mobile,
                aadhaar_number, pan_card_number, gender, marital_status, date_of_birth,
                street_address, pin_code, country, state, district, city, residence_type
            FROM personal_details 
            WHERE user_id = $1`;
        const result = await db.query(detailsQuery, [userId]);
        console.log(result.rows);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Personal details not found" });
        }

        return res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal server error");
    }
} 