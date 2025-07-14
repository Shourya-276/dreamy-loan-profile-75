# LFI Loan CRM - Backend API

## Architecture Overview

This backend is structured using a **role-based modular approach** to handle different user types and their specific functionality while maintaining shared components.

## Directory Structure

```
backend/
├── app.js                          # Express app configuration
├── index.js                        # Server entry point & route mounting
├── db.js                          # Database connection
├── lib/                           # Shared utilities
│   └── supabaseClient.js
├── middleware/                     # Authentication & authorization
│   └── roleAuth.js                # Role-based access control
├── controllers/
│   ├── shared/                    # Shared functionality (customers + all roles)
│   │   ├── authController.js
│   │   ├── personalDetailsController.js
│   │   ├── incomeDetailsController.js
│   │   ├── propertyDetailsController.js
│   │   ├── coApplicantsController.js
│   │   ├── loanOffersController.js
│   │   ├── documentController.js
│   │   └── documentSubmissionsController.js
│   ├── salesManager/              # Sales manager specific
│   │   ├── dashboardController.js
│   │   └── leadsController.js
│   ├── loanCoordinator/           # Loan coordinator specific (future)
│   └── loanAdministrator/         # Loan administrator specific (future)
├── routes/
│   ├── shared/                    # Shared routes
│   │   ├── auth.js
│   │   ├── personalDetails.js
│   │   ├── incomeDetails.js
│   │   ├── propertyDetails.js
│   │   ├── coApplicants.js
│   │   ├── loanOffers.js
│   │   ├── documents.js
│   │   └── documentSubmissions.js
│   ├── salesManager/              # Sales manager routes
│   │   ├── dashboard.js
│   │   └── leads.js
│   ├── loanCoordinator/           # Future: loan coordinator routes
│   └── loanAdministrator/         # Future: loan administrator routes
├── services/                      # Business logic
│   ├── hdfcOffer.js              # HDFC loan calculation
│   ├── sbiOffer.js               # SBI loan calculation
│   └── salesManager/             # Future: sales manager services
└── validators/                    # Input validation
    └── inputValidation.js
```

## User Roles & Permissions

### 1. Customer (`customer`)
- **Access**: Shared functionality only
- **Features**: Apply for loans, upload documents, check eligibility
- **Endpoints**: All `/shared/*` routes

### 2. Sales Manager (`salesmanager`)
- **Access**: Shared functionality + Sales Manager specific
- **Features**: Manage leads, view dashboard metrics, track sanctions
- **Endpoints**: `/shared/*` + `/sales-manager/*`

### 3. Loan Coordinator (`loancoordinator`)
- **Access**: Shared functionality + Loan Coordinator specific
- **Features**: Task management, document verification
- **Endpoints**: `/shared/*` + `/loan-coordinator/*` (future)

### 4. Loan Administrator (`loanadministrator`)
- **Access**: Shared functionality + Loan Administrator specific
- **Features**: Overall administration, reports, disbursements
- **Endpoints**: `/shared/*` + `/loan-administrator/*` (future)

## API Endpoints

### Shared Endpoints
```
POST   /login                           # User authentication
POST   /signup                          # User registration
POST   /personal-details                # Save personal details
GET    /personal-details/:userId        # Get personal details
POST   /income-details                  # Save income details
GET    /income-details/:userId          # Get income details
POST   /property-details                # Save property details
GET    /property-details/:userId        # Get property details
POST   /co-applicants                   # Save co-applicants
GET    /loan-offers/:userId             # Get loan offers
POST   /documents                       # Upload documents
GET    /documents/:userId               # List documents
DELETE /documents/:id                   # Delete document
POST   /document-submissions            # Submit documents
```

### Sales Manager Endpoints
```
GET    /sales-manager/dashboard/metrics/:userId        # Dashboard metrics
GET    /sales-manager/dashboard/recent-leads/:userId   # Recent leads
GET    /sales-manager/leads/:userId                    # Get all leads
PUT    /sales-manager/leads/:leadId/status             # Update lead status
POST   /sales-manager/leads                            # Create new lead
```

## Database Schema

### Core Tables (Shared)
- `users` - User accounts with roles
- `personal_details` - Customer personal information
- `income_details` - Customer income information
- `property_details` - Property information
- `co_applicants` - Co-applicant details
- `documents` - Document storage metadata
- `document_submissions` - Document submission tracking

### Sales Manager Tables
- `leads` - Customer leads assigned to sales managers
- `bank_sanctions` - Bank sanction information
- `disbursements` - Disbursement tracking
- `sales_targets` - Sales manager targets
- `tasks` - Task management
- `reports` - Generated reports

## Role-Based Authentication

The system uses role-based middleware (`middleware/roleAuth.js`) to control access:

```javascript
// Require specific role
router.use(requireSalesManager);

// Require any staff role
router.use(requireStaff);

// Custom role requirement
router.use(requireRole(['salesmanager', 'loancoordinator']));
```

## Adding New User Roles

To add a new user role (e.g., `underwriter`):

1. **Create directories**:
   ```bash
   mkdir -p controllers/underwriter
   mkdir -p routes/underwriter
   mkdir -p services/underwriter
   ```

2. **Add role middleware**:
   ```javascript
   // In middleware/roleAuth.js
   export const requireUnderwriter = requireRole('underwriter');
   ```

3. **Create controllers**:
   ```javascript
   // controllers/underwriter/dashboardController.js
   export async function getDashboardData(req, res) { ... }
   ```

4. **Create routes**:
   ```javascript
   // routes/underwriter/dashboard.js
   router.use(requireUnderwriter);
   router.get('/metrics/:userId', getDashboardData);
   ```

5. **Mount routes in index.js**:
   ```javascript
   import underwriterRoutes from "./routes/underwriter/dashboard.js";
   app.use("/underwriter/dashboard", underwriterRoutes);
   ```

6. **Update database schema** if needed
7. **Update frontend routing** in `App.tsx`

## Environment Variables

Required environment variables:
```
DATABASE_CONNECTION_STRING=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...
PORT=3000
```

## Development Guidelines

### Controller Organization
- **Shared controllers**: Common functionality used by multiple roles
- **Role-specific controllers**: Functionality specific to one role
- Keep business logic in services, not controllers

### Route Organization
- Use role-based middleware for protection
- Group related endpoints in the same route file
- Follow RESTful conventions

### Database Design
- Use role-based table organization
- Add proper indexes for performance
- Use foreign keys for data integrity

## Testing

```bash
# Run backend server
npm start

# Test endpoints
curl -X GET http://localhost:3000/sales-manager/dashboard/metrics/1 \
  -H "x-user-role: salesmanager"
```

## Future Enhancements

1. **JWT Authentication**: Replace simple role checking with proper JWT tokens
2. **Rate Limiting**: Add rate limiting middleware
3. **Logging**: Implement structured logging
4. **API Documentation**: Add Swagger/OpenAPI documentation
5. **Tests**: Add unit and integration tests
6. **Caching**: Implement Redis caching for frequently accessed data 
