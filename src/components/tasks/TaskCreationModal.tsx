
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, User } from "lucide-react";

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Task Creation Modal Component
 * Handles both custom task creation and prebuilt task selection
 * Provides a unified interface for task management
 */
const TaskCreationModal: React.FC<TaskCreationModalProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState<"selection" | "custom" | "prebuilt">("selection");
  const [taskName, setTaskName] = useState("");
  const [taskType, setTaskType] = useState("");
  const [selectedPrebuiltTask, setSelectedPrebuiltTask] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [notes, setNotes] = useState("");

  /**
   * Prebuilt task options
   * Hardcoded list of common administrative tasks
   */
  const prebuiltTasks = [
    "Ask Customer for Marriage Certificate",
    "Ask Customer for Bank Statement of Last Month"
  ];

  /**
   * Task type options for custom tasks
   * Provides dropdown selection for task categorization
   */
  const taskTypes = [
    "Call",
    "Visit", 
    "Doc",
    "Review"
  ];

  /**
   * Resets all form fields and returns to selection view
   */
  const handleReset = () => {
    setCurrentView("selection");
    setTaskName("");
    setTaskType("");
    setSelectedPrebuiltTask("");
    setAssignTo("");
    setNotes("");
  };

  /**
   * Handles modal close with cleanup
   */
  const handleClose = () => {
    handleReset();
    onClose();
  };

  /**
   * Handles custom task creation
   */
  const handleCreateCustomTask = () => {
    console.log("Creating custom task:", {
      name: taskName,
      type: taskType,
      assignTo,
      notes
    });
    // TODO: Implement actual task creation logic
    handleClose();
  };

  /**
   * Handles prebuilt task creation
   */
  const handleCreatePrebuiltTask = () => {
    console.log("Creating prebuilt task:", {
      name: selectedPrebuiltTask,
      assignTo,
      notes
    });
    // TODO: Implement actual task creation logic
    handleClose();
  };

  /**
   * Renders the initial selection view
   */
  const renderSelectionView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Add New Task</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Choose how you'd like to create your task</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => setCurrentView("custom")}
          variant="outline"
          className="h-20 flex flex-col items-center justify-center space-y-2 border-2 hover:border-brand-purple hover:bg-brand-purple/5"
        >
          <span className="text-lg">📝</span>
          <span className="font-medium">Custom Task</span>
        </Button>
        
        <Button
          onClick={() => setCurrentView("prebuilt")}
          variant="outline"
          className="h-20 flex flex-col items-center justify-center space-y-2 border-2 hover:border-brand-purple hover:bg-brand-purple/5"
        >
          <span className="text-lg">⚡</span>
          <span className="font-medium">Prebuilt Task</span>
        </Button>
      </div>
    </div>
  );

  /**
   * Renders the custom task creation form
   */
  const renderCustomTaskView = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView("selection")}
          className="p-1"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Task</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Task Name
          </label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-purple"
            placeholder="Enter task name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type (Dropdown: Call, Visit, Doc, Review)
          </label>
          <Select value={taskType} onValueChange={setTaskType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select task type" />
            </SelectTrigger>
            <SelectContent>
              {taskTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Date & Time</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assign to (Optional)
          </label>
          <input
            type="text"
            value={assignTo}
            onChange={(e) => setAssignTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-purple"
            placeholder="Assign to team member"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-purple"
            rows={3}
            placeholder="Add any additional notes"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          variant="outline"
          onClick={handleClose}
        >
          Clear
        </Button>
        <Button
          onClick={handleCreateCustomTask}
          disabled={!taskName || !taskType}
          className="bg-brand-purple hover:bg-brand-purple/90"
        >
          Create Task
        </Button>
      </div>
    </div>
  );

  /**
   * Renders the prebuilt task selection form
   */
  const renderPrebuiltTaskView = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView("selection")}
          className="p-1"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Task</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Prebuilt Task
          </label>
          <Select value={selectedPrebuiltTask} onValueChange={setSelectedPrebuiltTask}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose from prebuilt tasks" />
            </SelectTrigger>
            <SelectContent>
              {prebuiltTasks.map((task) => (
                <SelectItem key={task} value={task}>
                  {task}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Date & Time</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assign to (Optional)
          </label>
          <input
            type="text"
            value={assignTo}
            onChange={(e) => setAssignTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-purple"
            placeholder="Assign to team member"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-purple"
            rows={3}
            placeholder="Add any additional notes"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          variant="outline"
          onClick={handleClose}
        >
          Clear
        </Button>
        <Button
          onClick={handleCreatePrebuiltTask}
          disabled={!selectedPrebuiltTask}
          className="bg-brand-purple hover:bg-brand-purple/90"
        >
          Create Task
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {currentView === "selection" && renderSelectionView()}
        {currentView === "custom" && renderCustomTaskView()}
        {currentView === "prebuilt" && renderPrebuiltTaskView()}
      </DialogContent>
    </Dialog>
  );
};

export default TaskCreationModal;
