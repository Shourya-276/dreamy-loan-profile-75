import React, { useState } from "react";
import LoanAdministratorLayout from "../components/LoanAdministratorLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Plus, Repeat, UserCheck } from "lucide-react";
import TaskCreationModal from "../components/tasks/TaskCreationModal";

/**
 * LOAN ADMINISTRATOR TASKS PAGE
 * 
 * This file contains the task management page for Loan Administrator users.
 * It provides comprehensive task tracking, creation, and management functionality.
 * 
 * USAGE:
 * - Accessed via route: /loan-administrator-tasks
 * - Protected route - only accessible to users with 'loanadministrator' role
 * - Uses LoanAdministratorLayout as the page wrapper
 * - Navigation available from admin sidebar menu
 * 
 * FEATURES:
 * - Tab switching between pending and completed tasks
 * - Task creation and assignment functionality
 * - Prebuilt task templates for common activities
 * - Task status management with visual indicators
 * 
 * COMPONENTS USED:
 * - LoanAdministratorLayout: Main layout wrapper
 * - Card, Button, Badge: UI components from shadcn/ui
 * - Custom task cards with priority indicators
 * 
 * STATE MANAGEMENT:
 * - Active tab switching between pending/completed
 * - Task status tracking and updates
 * - Sample task data with realistic scenarios
 * 
 * TASK CATEGORIES:
 * - Follow-up tasks with customers
 * - Document collection and verification
 * - Appointment scheduling and management
 * - UTR confirmation and processing
 * 
 * FUTURE ENHANCEMENTS:
 * - Real-time task updates and notifications
 * - Task assignment to team members
 * - Integration with calendar systems
 * - Automated task creation based on loan status
 */

/**
 * Interface for completed task items
 * Defines the structure for displaying completed task information
 */
interface CompletedTask {
  title: string;
  completedDate: string;
  utrNumber?: string;
  description?: string;
  location?: string;
  icon: string;
  color: string;
}

/**
 * Interface for prebuilt task templates
 * Defines reusable task templates for common administrative actions
 */
interface PrebuiltTask {
  title: string;
  icon: string;
}

/**
 * Task Management Page for Loan Administrators
 * Handles task creation, assignment, and tracking for loan processing workflow
 * Provides both custom task creation and prebuilt task templates
 */
const LoanAdministratorTasks: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [isTaskCreationModalOpen, setIsTaskCreationModalOpen] = useState(false);

  /**
   * Completed tasks data with detailed information
   * Shows historical task completion with timestamps and additional context
   */
  const completedTasksData: CompletedTask[] = [
    {
      title: "UTR Confirmed for ₹2.5L",
      completedDate: "2 Apr, 3:45 PM",
      utrNumber: "UTR1234XXXX",
      icon: "✓",
      color: "green"
    },
    {
      title: "Google review collected from Aditi Sh...",
      completedDate: "2 Apr, 3:45 PM",
      description: "Confirm bank document upload status",
      icon: "✓",
      color: "green"
    },
    {
      title: "Loan appointment scheduled for Vipu...",
      completedDate: "1 Apr, 12:00 PM",
      location: "Location: Jalgaon",
      icon: "✓",
      color: "green"
    },
    {
      title: "Google review collected from Aditi Sh...",
      completedDate: "2 Apr, 3:45 PM",
      description: "Confirm bank document upload status",
      icon: "✓",
      color: "green"
    }
  ];

  /**
   * Prebuilt task templates for common administrative workflows
   * Provides quick access to frequently used task types
   */
  const prebuiltTasksData: PrebuiltTask[] = [
    { title: "Call lead before appointment", icon: "★" },
    { title: "Upload signed loan documents", icon: "★" },
    { title: "Confirm disbursement UTR", icon: "★" }
  ];

  /**
   * Handles tab switching between pending and completed tasks
   */
  const handleTabChange = (tab: string): void => {
    setActiveTab(tab);
  };

  /**
   * Handles task creation action
   * Opens the task creation modal
   */
  const handleCreateTask = (): void => {
    setIsTaskCreationModalOpen(true);
  };

  /**
   * Handles prebuilt task selection
   * Placeholder function for using prebuilt task templates
   */
  const handlePrebuiltTask = (): void => {
    console.log("Accessing prebuilt tasks...");
    // TODO: Implement prebuilt task selection functionality
  };

  /**
   * Handles task assignment action
   * Placeholder function for assigning tasks to team members
   */
  const handleAssignTask = (): void => {
    console.log("Assigning task...");
    // TODO: Implement task assignment functionality
  };

  /**
   * Renders individual completed task cards
   * Shows task details with completion status and additional information
   */
  const renderCompletedTaskCard = (task: CompletedTask, index: number) => (
    <Card key={index} className="p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start space-x-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
          task.color === "green" ? "bg-green-500" : "bg-blue-500"
        }`}>
          <span className="text-sm">{task.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">{task.title}</h3>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span className="mr-2">📅</span>
            <span>{task.completedDate}</span>
          </div>
          {task.utrNumber && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{task.utrNumber}</p>
          )}
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
          )}
          {task.location && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{task.location}</p>
          )}
        </div>
      </div>
    </Card>
  );

  /**
   * Renders action cards for task management functions
   * Provides quick access to main task management features
   */
  const renderActionCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card 
        className="p-6 text-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        onClick={handleCreateTask}
      >
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Plus className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </div>
        <h3 className="font-medium text-gray-900 dark:text-white">Create Task</h3>
      </Card>
      
      <Card 
        className="p-6 text-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        onClick={handlePrebuiltTask}
      >
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Repeat className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </div>
        <h3 className="font-medium text-gray-900 dark:text-white">Prebuilt Tasks</h3>
      </Card>
      
      <Card 
        className="p-6 text-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        onClick={handleAssignTask}
      >
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <UserCheck className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </div>
        <h3 className="font-medium text-gray-900 dark:text-white">Assign Task</h3>
      </Card>
    </div>
  );

  return (
    <LoanAdministratorLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        
        <Card className="bg-white dark:bg-gray-800 p-6">
          {/* Tab Navigation and Filter */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => handleTabChange("pending")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === "pending"
                    ? "bg-brand-purple text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleTabChange("completed")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === "completed"
                    ? "bg-brand-purple text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Completed
              </button>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
          </div>

          {/* Completed Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {completedTasksData.map((task, index) => renderCompletedTaskCard(task, index))}
          </div>

          {/* Show More Button */}
          <div className="flex justify-center mb-8">
            <Button variant="outline">Show More</Button>
          </div>

          {/* Action Cards */}
          {renderActionCards()}

          {/* Prebuilt Tasks Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Prebuilt Tasks</h3>
            <div className="space-y-3">
              {prebuiltTasksData.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{task.icon}</span>
                    <span className="text-gray-900 dark:text-white">{task.title}</span>
                  </div>
                  <button className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                    →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Task Creation Modal */}
      <TaskCreationModal
        isOpen={isTaskCreationModalOpen}
        onClose={() => setIsTaskCreationModalOpen(false)}
      />
    </LoanAdministratorLayout>
  );
};

export default LoanAdministratorTasks;
