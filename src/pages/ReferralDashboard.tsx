
/**
 * REFERRAL DASHBOARD PAGE
 * 
 * This is a specialized dashboard page designed exclusively for the referral user (aman@referral.com).
 * It provides a complete referral management interface with multiple tabs for different functionalities.
 * 
 * USAGE:
 * - Only accessible to users with email 'aman@referral.com'
 * - Imported and routed in App.tsx
 * - Protected route that redirects unauthorized users
 * 
 * FEATURES:
 * - Home tab with performance metrics and recent leads
 * - My Profile tab for user profile management
 * - View Leads tab with lead management and creation
 * - Payout Summary tab for financial tracking
 * - Invoice tab for invoice creation and management
 * 
 * COMPONENTS USED:
 * - Uses custom referral layout component
 * - Multiple tab components for different sections
 * - Form components for data entry
 * 
 * DEPENDENCIES:
 * - React hooks for state management
 * - AuthContext for user verification
 * - Custom UI components from shadcn/ui
 */

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import ReferralLayout from "../components/ReferralLayout";
import ReferralHome from "../components/referral/ReferralHome";
import ReferralProfile from "../components/referral/ReferralProfile";
import ReferralLeads from "../components/referral/ReferralLeads";
import ReferralPayoutSummary from "../components/referral/ReferralPayoutSummary";
import ReferralInvoice from "../components/referral/ReferralInvoice";

const ReferralDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("home");

  // Check if user is authorized for referral dashboard
  if (!user || user.email !== "aman@referral.com") {
    return <Navigate to="/dashboard" />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "home":
        return <ReferralHome />;
      case "profile":
        return <ReferralProfile />;
      case "leads":
        return <ReferralLeads />;
      case "payout":
        return <ReferralPayoutSummary />;
      case "invoice":
        return <ReferralInvoice />;
      default:
        return <ReferralHome />;
    }
  };

  return (
    <ReferralLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActiveTab()}
    </ReferralLayout>
  );
};

export default ReferralDashboard;
