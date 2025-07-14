import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LoanProvider } from "./contexts/LoanContext";

// Page imports
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import SalesManagerDashboard from "./pages/SalesManagerDashboard";
import LoanCoordinatorDashboard from "./pages/LoanCoordinatorDashboard";
import LoanCoordinatorProfile from "./pages/LoanCoordinatorProfile";
import LoanCoordinatorBankSanctions from "./pages/LoanCoordinatorBankSanctions";
import LoanCoordinatorDisbursement from "./pages/LoanCoordinatorDisbursement";
import LoanCoordinatorDocument from "./pages/LoanCoordinatorDocument";
import LoanCoordinatorReports from "./pages/LoanCoordinatorReports";
import LoanCoordinatorTasks from "./pages/LoanCoordinatorTasks";
import LoanAdministratorDashboard from "./pages/LoanAdministratorDashboard";
import LoanAdministratorProfile from "./pages/LoanAdministratorProfile";
import LoanAdministratorBankSanctions from "./pages/LoanAdministratorBankSanctions";
import LoanAdministratorDisbursement from "./pages/LoanAdministratorDisbursement";
import LoanAdministratorDocument from "./pages/LoanAdministratorDocument";
import LoanAdministratorReports from "./pages/LoanAdministratorReports";
import LoanAdministratorTasks from "./pages/LoanAdministratorTasks";
import ReferralDashboard from "./pages/ReferralDashboard";
import Profile from "./pages/Profile";
import CheckEligibility from "./pages/CheckEligibility";
import SalesManagerCheckEligibility from "./pages/SalesManagerCheckEligibility";
import ExploreLoanOffers from "./pages/ExploreLoanOffers";
import ApplyLoan from "./pages/ApplyLoan";
import DocumentUpload from "./pages/DocumentUpload";
import Disbursement from "./pages/Disbursement";
import NotFound from "./pages/NotFound";
// import MyLoanApplications from "./pages/MyLoanApplications";
import Review from "./pages/Review";
import LeadsManagement from "./pages/LeadsManagement";
import BankSanctions from "./pages/BankSanctions";
import DisbursementManagement from "./pages/DisbursementManagement";
import Reports from "./pages/Reports";
import Tasks from "./pages/Tasks";
import ConnectorDashboard from "./pages/ConnectorDashboard";
import ConnectorProfile from "./pages/ConnectorProfile";
import ConnectorLeads from "./pages/ConnectorLeads";
import ConnectorPayout from "./pages/ConnectorPayout";
import ConnectorInvoice from "./pages/ConnectorInvoice";
import ConnectorQuickEligibility from "./pages/ConnectorQuickEligibility";
import CheckCibil from "./users/customer/pages/CheckCibil";
import SalesManagerInitiateDisbursement from "./pages/SalesManagerInitiateDisbursement";
import SalesManagerLoanOffers from "./pages/SalesManagerLoanOffers";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminProfile from "./pages/SuperAdminProfile";
import SuperAdminMasters from "./pages/SuperAdminMasters";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfile from "./pages/AdminProfile";
import AdminMasters from "./pages/AdminMasters";
import AdminProjectMaster from "./pages/AdminProjectMaster";
import AdminProjectDocuments from "./pages/AdminProjectDocuments";
import AdminBankROIMaster from "./pages/AdminBankROIMaster";
import AdminBankROIConfig from "./pages/AdminBankROIConfig";
import AdminEmployeeMaster from "./pages/AdminEmployeeMaster";
import AdminInvoice from "./pages/AdminInvoice";
import AdminReport from "./pages/AdminReport";
import AdminApprovals from "./pages/AdminApprovals";
import BuilderDashboard from "./pages/BuilderDashboard";
import BuilderProfile from "./pages/BuilderProfile";
import BuilderLeads from "./pages/BuilderLeads";
import BuilderProjects from "./pages/BuilderProjects";
import BuilderLoanStatus from "./pages/BuilderLoanStatus";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-brand-purple border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Role-based dashboard wrapper
const DashboardWrapper = () => {
  const { user } = useAuth();
  
  // Special case for super admin
  if (user?.email === 'aman@superadmin.com') {
    return <Navigate to="/super-admin-dashboard" />;
  }
  
  // Special case for admin
  if (user?.email === 'aman@admin.com') {
    return <Navigate to="/admin-dashboard" />;
  }
  
  // Special case for builder user
  if (user?.email === 'aman@builder.com') {
    return <Navigate to="/builder-dashboard" />;
  }
  
  // Special case for referral user
  if (user?.email === 'aman@referral.com') {
    return <Navigate to="/referral-dashboard" />;
  }
  
  // Special case for connector user
  if (user?.role === 'connector') {
    return <Navigate to="/connector-dashboard" />;
  }
  
  // Special case for loan coordinator user
  if (user?.email === 'aman@loancoordinator.com') {
    return <Navigate to="/loan-coordinator-dashboard" />;
  }
  
  if (user?.role === 'salesmanager') {
    return <SalesManagerDashboard />;
  }
  
  if (user?.role === 'loancoordinator') {
    return <LoanCoordinatorDashboard />;
  }
  
  if (user?.role === 'loanadministrator') {
    return <Navigate to="/loan-administrator-dashboard" />;
  }
  
  return <Dashboard />;
};

// Role-based check eligibility wrapper
const CheckEligibilityWrapper = () => {
  const { user } = useAuth();
  
  if (user?.role === 'salesmanager') {
    return <SalesManagerCheckEligibility />;
  }
  
  return <CheckEligibility />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <LoanProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardWrapper /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/check-cibil" element={<ProtectedRoute><CheckCibil /></ProtectedRoute>} />
                <Route path="/check-eligibility" element={<ProtectedRoute><CheckEligibilityWrapper /></ProtectedRoute>} />
                <Route path="/explore-loan-offers" element={<ProtectedRoute><ExploreLoanOffers /></ProtectedRoute>} />
                <Route path="/apply-loan" element={<ProtectedRoute><ApplyLoan /></ProtectedRoute>} />
                {/* <Route path="/my-loan-applications" element={<ProtectedRoute><MyLoanApplications /></ProtectedRoute>} /> */}
                <Route path="/document" element={<ProtectedRoute><DocumentUpload /></ProtectedRoute>} />
                <Route path="/disbursement" element={<ProtectedRoute><Disbursement /></ProtectedRoute>} />
                <Route path="/review" element={<ProtectedRoute><Review /></ProtectedRoute>} />
                
                {/* Builder Routes */}
                <Route path="/builder-dashboard" element={<ProtectedRoute><BuilderDashboard /></ProtectedRoute>} />
                <Route path="/builder-profile" element={<ProtectedRoute><BuilderProfile /></ProtectedRoute>} />
                <Route path="/builder-leads" element={<ProtectedRoute><BuilderLeads /></ProtectedRoute>} />
                <Route path="/builder-projects" element={<ProtectedRoute><BuilderProjects /></ProtectedRoute>} />
                <Route path="/builder-loan-status" element={<ProtectedRoute><BuilderLoanStatus /></ProtectedRoute>} />
                
                {/* Super Admin Routes */}
                <Route path="/super-admin-dashboard" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
                <Route path="/super-admin-profile" element={<ProtectedRoute><SuperAdminProfile /></ProtectedRoute>} />
                <Route path="/super-admin-masters" element={<ProtectedRoute><SuperAdminMasters /></ProtectedRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin-profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
                <Route path="/admin-masters" element={<ProtectedRoute><AdminMasters /></ProtectedRoute>} />
                <Route path="/admin-project-master" element={<ProtectedRoute><AdminProjectMaster /></ProtectedRoute>} />
                <Route path="/admin-project-documents/:projectId" element={<ProtectedRoute><AdminProjectDocuments /></ProtectedRoute>} />
                <Route path="/admin-bank-roi-master" element={<ProtectedRoute><AdminBankROIMaster /></ProtectedRoute>} />
                <Route path="/admin-bank-roi-config/:bankId" element={<ProtectedRoute><AdminBankROIConfig /></ProtectedRoute>} />
                <Route path="/admin-employee-master" element={<ProtectedRoute><AdminEmployeeMaster /></ProtectedRoute>} />
                <Route path="/admin-invoice" element={<ProtectedRoute><AdminInvoice /></ProtectedRoute>} />
                <Route path="/admin-report" element={<ProtectedRoute><AdminReport /></ProtectedRoute>} />
                <Route path="/admin-approvals" element={<ProtectedRoute><AdminApprovals /></ProtectedRoute>} />
                
                {/* Referral Dashboard - Special User */}
                <Route path="/referral-dashboard" element={<ProtectedRoute><ReferralDashboard /></ProtectedRoute>} />
                
                {/* Connector Dashboard - Special User */}
                <Route path="/connector-dashboard" element={<ProtectedRoute><ConnectorDashboard /></ProtectedRoute>} />
                <Route path="/connector-profile" element={<ProtectedRoute><ConnectorProfile /></ProtectedRoute>} />
                <Route path="/connector-quick-eligibility" element={<ProtectedRoute><ConnectorQuickEligibility /></ProtectedRoute>} />
                <Route path="/connector-leads" element={<ProtectedRoute><ConnectorLeads /></ProtectedRoute>} />
                <Route path="/connector-payout" element={<ProtectedRoute><ConnectorPayout /></ProtectedRoute>} />
                <Route path="/connector-invoice" element={<ProtectedRoute><ConnectorInvoice /></ProtectedRoute>} />
                
                {/* Sales Manager specific routes */}
                <Route path="/leads" element={<ProtectedRoute><LeadsManagement /></ProtectedRoute>} />
                <Route path="/bank-sanctions" element={<ProtectedRoute><BankSanctions /></ProtectedRoute>} />
                <Route path="/disbursement-management" element={<ProtectedRoute><DisbursementManagement /></ProtectedRoute>} />
                <Route path="/sales-manager-initiate-disbursement" element={<ProtectedRoute><SalesManagerInitiateDisbursement /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                
                {/* Loan Coordinator specific routes */}
                <Route path="/loan-coordinator-dashboard" element={<ProtectedRoute><LoanCoordinatorDashboard /></ProtectedRoute>} />
                <Route path="/loan-coordinator-profile" element={<ProtectedRoute><LoanCoordinatorProfile /></ProtectedRoute>} />
                <Route path="/loan-coordinator-bank-sanctions" element={<ProtectedRoute><LoanCoordinatorBankSanctions /></ProtectedRoute>} />
                <Route path="/loan-coordinator-disbursement" element={<ProtectedRoute><LoanCoordinatorDisbursement /></ProtectedRoute>} />
                <Route path="/loan-coordinator-document" element={<ProtectedRoute><LoanCoordinatorDocument /></ProtectedRoute>} />
                <Route path="/loan-coordinator-reports" element={<ProtectedRoute><LoanCoordinatorReports /></ProtectedRoute>} />
                <Route path="/loan-coordinator-tasks" element={<ProtectedRoute><LoanCoordinatorTasks /></ProtectedRoute>} />
                
                {/* Loan Administrator specific routes */}
                <Route path="/loan-administrator-dashboard" element={<ProtectedRoute><LoanAdministratorDashboard /></ProtectedRoute>} />
                <Route path="/loan-administrator-profile" element={<ProtectedRoute><LoanAdministratorProfile /></ProtectedRoute>} />
                <Route path="/loan-administrator-bank-sanctions" element={<ProtectedRoute><LoanAdministratorBankSanctions /></ProtectedRoute>} />
                <Route path="/loan-administrator-disbursement" element={<ProtectedRoute><LoanAdministratorDisbursement /></ProtectedRoute>} />
                <Route path="/loan-administrator-document" element={<ProtectedRoute><LoanAdministratorDocument /></ProtectedRoute>} />
                <Route path="/loan-administrator-reports" element={<ProtectedRoute><LoanAdministratorReports /></ProtectedRoute>} />
                <Route path="/loan-administrator-tasks" element={<ProtectedRoute><LoanAdministratorTasks /></ProtectedRoute>} />
                
                {/* Sales Manager Loan Offers */}
                <Route path="/sales-manager-loan-offers" element={<ProtectedRoute><SalesManagerLoanOffers /></ProtectedRoute>} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LoanProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
