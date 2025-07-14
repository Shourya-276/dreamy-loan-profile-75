import db from "../../db.js";

export async function searchUsers(req, res) {
    try {
        const { query, role } = req.query;
        console.log(query, role);
        
        
        if (!query || !query.trim()) {
            return res.status(400).json({ error: "Search query is required" });
        }

        // Default to customer role if not specified
        const searchRole = role || 'customer';
        const searchTerm = query.trim();

        let searchQuery;
        let queryParams;

        // Check if the search term is a number (could be leads ID or phone)
        const isNumeric = /^\d+$/.test(searchTerm);

        if (isNumeric) {
            const numericValue = parseInt(searchTerm);
            // Check if it's a reasonable lead ID (not a phone number)
            const isLikelyLeadId = numericValue <= 999999; // Assume lead IDs are smaller numbers
            
            if (isLikelyLeadId) {
                // Search by both phone number and lead ID
                searchQuery = `
                    SELECT DISTINCT u.id, u.name, u.email, u.mobile, u.role, u.created_at,
                           l.id as lead_id, l.status as lead_status
                    FROM users u
                    LEFT JOIN leads l ON u.id = l.customer_id
                    WHERE u.role = $1 
                    AND (
                        u.mobile::text LIKE $2 
                        OR l.id = $3
                    )
                    ORDER BY u.name
                    LIMIT 20
                `;
                queryParams = [searchRole, `%${searchTerm}%`, numericValue];
            } else {
                // Search only by phone number (too large to be a lead ID)
                searchQuery = `
                    SELECT DISTINCT u.id, u.name, u.email, u.mobile, u.role, u.created_at,
                           l.id as lead_id, l.status as lead_status
                    FROM users u
                    LEFT JOIN leads l ON u.id = l.customer_id
                    WHERE u.role = $1 
                    AND u.mobile::text LIKE $2
                    ORDER BY u.name
                    LIMIT 20
                `;
                queryParams = [searchRole, `%${searchTerm}%`];
            }
        } else {
            // Search by name or email
            searchQuery = `
                SELECT DISTINCT u.id, u.name, u.email, u.mobile, u.role, u.created_at,
                       l.id as lead_id, l.status as lead_status
                FROM users u
                LEFT JOIN leads l ON u.id = l.customer_id
                WHERE u.role = $1 
                AND (
                    LOWER(u.name) LIKE LOWER($2) 
                    OR LOWER(u.email) LIKE LOWER($3)
                )
                ORDER BY u.name
                LIMIT 20
            `;
            queryParams = [searchRole, `%${searchTerm}%`, `%${searchTerm}%`];
        }

        const result = await db.query(searchQuery, queryParams);
        
        // Format the results to include lead information
        const formattedResults = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            mobile: row.mobile,
            role: row.role,
            created_at: row.created_at,
            lead_info: row.lead_id ? {
                lead_id: row.lead_id,
                status: row.lead_status
            } : null
        }));

        return res.status(200).json(formattedResults);

    } catch (error) {
        console.error("Error searching users:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

