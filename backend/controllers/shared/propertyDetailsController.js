import db from "../../db.js";

export async function savePropertyDetails(req, res) {
    try {
        const {
            userId,
            isPropertySelected,
            propertyStatus,
            propertyType,
            country,
            state,
            district,
            city,
            streetAddress,
            buildingName,
            wing,
            flatNumber,
            floorNumber,
            carpetArea,
            agreementValue,
            gstCharges,
            otherCharges,
            stampDuty,
            registrationFees,
        } = req.body;

        // Verify user exists
        const userResult = await db.query("SELECT id FROM users WHERE id = $1", [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if property details exist
        const checkResult = await db.query("SELECT id FROM property_details WHERE user_id = $1", [userId]);

        let result;
        if (checkResult.rows.length > 0) {
            // Update
            const updateQuery = `
                UPDATE property_details
                SET is_property_selected = $1, property_status = $2, property_type = $3, country = $4, state = $5,
                    district = $6, city = $7, street_address = $8, building_name = $9, wing = $10, flat_number = $11,
                    floor_number = $12, carpet_area = $13, agreement_value = $14, gst_charges = $15, other_charges = $16,
                    stamp_duty = $17, registration_fees = $18, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $19
                RETURNING id`;
            result = await db.query(updateQuery, [
                isPropertySelected, propertyStatus, propertyType, country, state,
                district, city, streetAddress, buildingName, wing, flatNumber,
                floorNumber, carpetArea, agreementValue, gstCharges, otherCharges,
                stampDuty, registrationFees, userId,
            ]);
            return res.status(200).json({ message: "Property details updated successfully", id: result.rows[0].id });
        } else {
            // Insert
            const insertQuery = `
                INSERT INTO property_details (
                    user_id, is_property_selected, property_status, property_type, country, state, district, city,
                    street_address, building_name, wing, flat_number, floor_number, carpet_area, agreement_value,
                    gst_charges, other_charges, stamp_duty, registration_fees, created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8,
                    $9, $10, $11, $12, $13, $14, $15,
                    $16, $17, $18, $19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                ) RETURNING id`;
            result = await db.query(insertQuery, [
                userId, isPropertySelected, propertyStatus, propertyType, country, state, district, city,
                streetAddress, buildingName, wing, flatNumber, floorNumber, carpetArea, agreementValue,
                gstCharges, otherCharges, stampDuty, registrationFees,
            ]);
            return res.status(201).json({ message: "Property details saved successfully", id: result.rows[0].id });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal server error");
    }
}

export async function getPropertyDetails(req, res) {
    try {
        const { userId } = req.params;

        const userResult = await db.query("SELECT id FROM users WHERE id = $1", [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const detailsQuery = `
            SELECT 
                is_property_selected, property_status, property_type, country, state, district, city,
                street_address, building_name, wing, flat_number, floor_number, carpet_area, agreement_value,
                gst_charges, other_charges, stamp_duty, registration_fees
            FROM property_details
            WHERE user_id = $1`;
        const result = await db.query(detailsQuery, [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Property details not found" });
        }

        return res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal server error");
    }
} 