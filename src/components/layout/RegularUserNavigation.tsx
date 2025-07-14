
import React from "react";
import { FileText, CreditCard, DollarSign } from "lucide-react";
import NavigationLink from "./NavigationLink";

interface RegularUserNavigationProps {
  isCurrentRoute: (path: string) => boolean;
}

const RegularUserNavigation: React.FC<RegularUserNavigationProps> = ({ isCurrentRoute }) => {
  return (
    <>
      <NavigationLink
        to="/apply-loan"
        icon={FileText}
        isActive={isCurrentRoute("/apply-loan")}
      >
        Apply for Loan
      </NavigationLink>
      <NavigationLink
        to="/my-loan-applications"
        icon={CreditCard}
        isActive={isCurrentRoute("/my-loan-applications")}
      >
        My Applications
      </NavigationLink>
      <NavigationLink
        to="/disbursement"
        icon={DollarSign}
        isActive={isCurrentRoute("/disbursement")}
      >
        Disbursement
      </NavigationLink>
    </>
  );
};

export default RegularUserNavigation;
