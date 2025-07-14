import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
// Shared routes (customer functionality)
import authRoutes from "./routes/shared/auth.js";
import personalDetailsRoutes from "./routes/shared/personalDetails.js";
import incomeDetailsRoutes from "./routes/shared/incomeDetails.js";
import propertyDetailsRoutes from "./routes/shared/propertyDetails.js";
import coApplicantsRoutes from "./routes/shared/coApplicants.js";
import loanOffersRoutes from "./routes/shared/loanOffers.js";
import documentsRoutes from "./routes/shared/documents.js";
import documentSubmissionsRoutes from "./routes/shared/documentSubmissions.js";
import s3Routes from "./routes/shared/s3.js";
import populateLeadsRoutes from "./routes/shared/populateLeads.js";
import tasksRoutes from "./routes/shared/tasks.js";

// Sales Manager routes
import salesManagerDashboardRoutes from "./routes/salesManager/dashboard.js";
import salesManagerLeadsRoutes from "./routes/salesManager/leads.js";
import salesManagerUsersRoutes from "./routes/salesManager/users.js";
import salesManagerEligibilityRoutes from "./routes/salesManager/eligibility.js";
import salesManagerSanctionsRoutes from "./routes/salesManager/sanctions.js";

// Admin routes
import adminEmployeeMasterRoutes from "./routes/admin/employeeMaster.js";
import adminBankROIRoutes from "./routes/admin/bankROI.js";

// Builder routes
import builderProjectRoutes from "./routes/builder/projects.js";

const port = process.env.PORT || 3000;

app.get("/", (_req, res) => res.send("Hello World"));

// Mount feature-specific routers
app.use("/", authRoutes);                 // /login, /signup
app.use("/personal-details", personalDetailsRoutes);
app.use("/income-details", incomeDetailsRoutes);
app.use("/property-details", propertyDetailsRoutes);
app.use("/co-applicants", coApplicantsRoutes);
app.use("/loan-offers", loanOffersRoutes);
app.use("/documents", documentsRoutes);
app.use("/document-submissions", documentSubmissionsRoutes);
app.use("/s3", s3Routes);
app.use("/leads-management", populateLeadsRoutes);
app.use("/tasks", tasksRoutes);

// Sales Manager specific routes
app.use("/sales-manager/dashboard", salesManagerDashboardRoutes);
app.use("/sales-manager/leads", salesManagerLeadsRoutes);
app.use("/sales-manager/users", salesManagerUsersRoutes);
app.use("/sales-manager/eligibility", salesManagerEligibilityRoutes);
app.use("/sales-manager/sanctions", salesManagerSanctionsRoutes);

// Admin specific routes
app.use("/admin/employee-master", adminEmployeeMasterRoutes);
app.use("/admin/bank-roi", adminBankROIRoutes);

// Builder specific routes
app.use("/builder/projects", builderProjectRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});