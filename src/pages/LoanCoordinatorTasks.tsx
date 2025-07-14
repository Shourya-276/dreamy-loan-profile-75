
import React, { useState } from "react";
import LoanCoordinatorLayout from "../components/LoanCoordinatorLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

const LoanCoordinatorTasks = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [date, setDate] = useState<Date>();

  const completedTasks = [
    {
      title: "UTR Confirmed for ₹2.5L",
      completed: "Completed on: 2 Apr, 3:45 PM",
      description: "UTR No: UTR1234XXXX",
      status: "completed"
    },
    {
      title: "Google review collected from Aditi Sh...",
      completed: "Completed on: 2 Apr, 3:45 PM",
      description: "Confirm bank document upload status",
      status: "completed"
    },
    {
      title: "Loan appointment scheduled for Vipu...",
      completed: "Completed: 1 Apr, 12:00 PM",
      description: "Location: Jalgaon",
      status: "completed"
    },
    {
      title: "Google review collected from Aditi Sh...",
      completed: "Completed on: 2 Apr, 3:45 PM",
      description: "Confirm bank document upload status",
      status: "completed"
    }
  ];

  const prebuiltTasks = [
    "Call lead before appointment",
    "Upload signed loan documents", 
    "Confirm disbursement UTR"
  ];

  if (showCreateTask) {
    return (
      <LoanCoordinatorLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6">
              <Button
                onClick={() => setActiveTab("pending")}
                variant={activeTab === "pending" ? "default" : "outline"}
                className={activeTab === "pending" ? "bg-brand-purple" : ""}
              >
                Pending
              </Button>
              <Button
                onClick={() => setActiveTab("completed")}
                variant={activeTab === "completed" ? "default" : "outline"}
                className={activeTab === "completed" ? "bg-brand-purple" : ""}
              >
                Completed
              </Button>
              <div className="ml-auto">
                <Button variant="outline" className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                  Filter
                </Button>
              </div>
            </div>

            {/* Completed Tasks List */}
            <div className="space-y-4 mb-8">
              {completedTasks.map((task, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{task.completed}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More */}
            <div className="text-center mb-8">
              <Button variant="outline">Show More</Button>
            </div>

            {/* Add New Task Section */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" onClick={() => setShowCreateTask(false)}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <h3 className="text-lg font-semibold">Add New Task</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Task Name</label>
                  <Input placeholder="Enter task name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type of Task</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Assign To</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mohit">Mohit Rajput</SelectItem>
                      <SelectItem value="team1">Team Member 1</SelectItem>
                      <SelectItem value="team2">Team Member 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date & Time</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Notes...</label>
                <Textarea placeholder="Enter additional notes" rows={4} />
              </div>

              <div className="flex gap-4 mt-6">
                <Button className="bg-brand-purple hover:bg-brand-purple/90">
                  Create Task
                </Button>
                <Button variant="outline" onClick={() => setShowCreateTask(false)}>
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      </LoanCoordinatorLayout>
    );
  }

  return (
    <LoanCoordinatorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => setActiveTab("pending")}
              variant={activeTab === "pending" ? "default" : "outline"}
              className={activeTab === "pending" ? "bg-brand-purple" : ""}
            >
              Pending
            </Button>
            <Button
              onClick={() => setActiveTab("completed")}
              variant={activeTab === "completed" ? "default" : "outline"}
              className={activeTab === "completed" ? "bg-brand-purple" : ""}
            >
              Completed
            </Button>
            <div className="ml-auto">
              <Button variant="outline" className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                Filter
              </Button>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4 mb-8">
            {completedTasks.map((task, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{task.completed}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Show More */}
          <div className="text-center mb-8">
            <Button variant="outline">Show More</Button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div 
              className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setShowCreateTask(true)}
            >
              <div className="text-2xl mb-2">➕</div>
              <p className="font-medium">Create Task</p>
            </div>
            <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="text-2xl mb-2">🔧</div>
              <p className="font-medium">Prebuilt Tasks</p>
            </div>
            <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="text-2xl mb-2">👤</div>
              <p className="font-medium">Assign Task</p>
            </div>
          </div>

          {/* Prebuilt Tasks */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Prebuilt Tasks</h3>
            <div className="space-y-3">
              {prebuiltTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-orange-500">⭐</span>
                    <span>{task}</span>
                  </div>
                  <Button size="sm" variant="ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LoanCoordinatorLayout>
  );
};

export default LoanCoordinatorTasks;
