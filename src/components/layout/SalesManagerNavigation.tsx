
import React from "react";
import { Users, Building2, DollarSign, Send, BarChart, CheckSquare } from "lucide-react";
import NavigationLink from "./NavigationLink";

interface SalesManagerNavigationProps {
  isCurrentRoute: (path: string) => boolean;
}

const SalesManagerNavigation: React.FC<SalesManagerNavigationProps> = ({ isCurrentRoute }) => {
  return (
    <>
      <NavigationLink
        to="/leads"
        icon={Users}
        isActive={isCurrentRoute("/leads")}
      >
        Leads Management
      </NavigationLink>
      <NavigationLink
        to="/bank-sanctions"
        icon={Building2}
        isActive={isCurrentRoute("/bank-sanctions")}
      >
        Bank Sanctions
      </NavigationLink>
      <NavigationLink
        to="/disbursement-management"
        icon={DollarSign}
        isActive={isCurrentRoute("/disbursement-management")}
      >
        Disbursement
      </NavigationLink>
      <NavigationLink
        to="/sales-manager-initiate-disbursement"
        icon={Send}
        isActive={isCurrentRoute("/sales-manager-initiate-disbursement")}
      >
        Initiate Disbursement
      </NavigationLink>
      <NavigationLink
        to="/reports"
        icon={BarChart}
        isActive={isCurrentRoute("/reports")}
      >
        Report
      </NavigationLink>
      <NavigationLink
        to="/tasks"
        icon={CheckSquare}
        isActive={isCurrentRoute("/tasks")}
      >
        Task
      </NavigationLink>
    </>
  );
};

export default SalesManagerNavigation;
