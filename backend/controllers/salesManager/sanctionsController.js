import db from "../../db.js";

/**
 * Get all LFI sanctions for a sales manager with unique users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSanctionsForSalesManager = async (req, res) => {
  const { salesManagerId } = req.params;
  console.log(salesManagerId);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const search = req.query.search || "";
  const status = req.query.status || "all";
  const bankName = req.query.bankName || "";
  
  try {
    // Build the base query to get unique users with their sanctions
    // We join with users table to get customer names
    // We join with leads table to ensure the leads are assigned to this sales manager
    let query = `
      WITH user_sanctions AS (
        SELECT DISTINCT ON (u.id)
          u.id as user_id,
          u.name as customer_name,
          u.email,
          u.mobile,
          lfi.id as sanction_id,
          lfi.bank_name,
          lfi.max_amount,
          lfi.interest_rate,
          lfi.status,
          lfi.created_at,
          l.id as lead_id
        FROM users u
        JOIN leads l ON u.id = l.customer_id
        JOIN lfi_sanctions lfi ON u.id = lfi.user_id
        WHERE l.sales_manager_id = $1
    `;
    
    // Add filters
    const queryParams = [salesManagerId];
    let paramIndex = 2;
    
    if (search) {
      query += ` AND (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR CAST(u.mobile AS TEXT) ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    if (status !== "all") {
      query += ` AND lfi.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    if (bankName) {
      query += ` AND lfi.bank_name ILIKE $${paramIndex}`;
      queryParams.push(`%${bankName}%`);
      paramIndex++;
    }
    
    // Close the CTE and select from it
    query += `
      ORDER BY u.id, lfi.max_amount DESC
      )
      SELECT * FROM user_sanctions
      ORDER BY max_amount DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    
    // Execute the query
    const result = await db.query(query, queryParams);
    
    // Count total records for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT u.id) 
      FROM users u
      JOIN leads l ON u.id = l.customer_id
      JOIN lfi_sanctions lfi ON u.id = lfi.user_id
      WHERE l.sales_manager_id = $1
    `;
    
    let countParams = [salesManagerId];
    let countParamIndex = 2;
    
    if (search) {
      countQuery += ` AND (u.name ILIKE $${countParamIndex} OR u.email ILIKE $${countParamIndex} OR CAST(u.mobile AS TEXT) ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }
    
    if (status !== "all") {
      countQuery += ` AND lfi.status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }
    
    if (bankName) {
      countQuery += ` AND lfi.bank_name ILIKE $${countParamIndex}`;
      countParams.push(`%${bankName}%`);
      countParamIndex++;
    }
    
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    // Format the response
    const sanctions = result.rows.map(row => ({
      leadId: `#${row.lead_id}`,
      name: row.customer_name,
      amount: row.max_amount,
      userId: row.user_id,
      date: new Date(row.created_at).toISOString().split('T')[0]
    }));
    
    res.json({
      sanctions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching LFI sanctions:", error);
    res.status(500).json({ error: "Failed to fetch sanctions data" });
  }
}; 