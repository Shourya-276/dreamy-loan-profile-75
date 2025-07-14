import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import axios from "axios";

interface Task {
  id: number;
  title: string;
  description: string;
  taskType: string;
  priority: string;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
  isPrebuilt: boolean;
  prebuiltTitle?: string;
  prebuiltCategory?: string;
  assignedBy: {
    id: number;
    name: string;
    email: string;
  };
  commentCount: number;
  attachmentCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TaskTemplate {
  id: number;
  title: string;
  description: string;
  taskType: string;
  priority: string;
  estimatedDuration: number;
  category: string;
  isActive: boolean;
}

interface TaskStatistics {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  urgentTasks: number;
  highPriorityTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
}

const Tasks = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Modal states
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Form states
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    taskType: "custom",
    priority: "medium",
    dueDate: null as Date | null,
  });

  // Edit/Delete states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    taskType: "custom",
    priority: "medium",
    dueDate: null as Date | null,
  });

  const serverUrl = import.meta.env.VITE_SERVER_URL;

  // Fetch tasks
  const fetchTasks = async (page = 1, status = activeTab, search = searchTerm) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(status !== 'all' && { status }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(typeFilter !== 'all' && { task_type: typeFilter }),
        ...(search && { search })
      });

      const response = await axios.get(`${serverUrl}/tasks/${user.id}?${params}`, {
        headers: {
          'x-user-role': user.role
        }
      });

      setTasks(response.data.tasks);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch task statistics
  const fetchStatistics = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(`${serverUrl}/tasks/${user.id}/statistics`, {
        headers: {
          'x-user-role': user.role
        }
      });
      setStatistics(response.data.statistics);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  // Fetch prebuilt templates
  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${serverUrl}/tasks/templates/prebuilt`, {
        headers: {
          'x-user-role': user?.role || 'customer'
        }
      });
      setTemplates(response.data.templates);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  // Create task
  const createTask = async () => {
    if (!user?.id || !taskForm.title.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const taskData = {
        title: taskForm.title,
        description: taskForm.description,
        assignedTo: parseInt(user.id),
        assignedBy: parseInt(user.id),
        taskType: taskForm.taskType,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate?.toISOString() || null
      };

      await axios.post(`${serverUrl}/tasks`, taskData, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role
        }
      });

      toast.success('Task created successfully');
      setShowCreateTaskModal(false);
      resetTaskForm();
      fetchTasks();
      fetchStatistics();
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error('Failed to create task');
    }
  };

  // Create task from template
  const createTaskFromTemplate = async (template: TaskTemplate) => {
    if (!user?.id) return;

    try {
      const taskData = {
        assignedTo: parseInt(user.id),
        assignedBy: parseInt(user.id),
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
      };

      await axios.post(`${serverUrl}/tasks/templates/${template.id}/create`, taskData, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role
        }
      });

      toast.success(`Task "${template.title}" created successfully`);
      fetchTasks();
      fetchStatistics();
    } catch (err) {
      console.error('Error creating task from template:', err);
      toast.error('Failed to create task from template');
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId: number, status: string, notes?: string) => {
    if (!user?.id) return;

    try {
      await axios.put(`${serverUrl}/tasks/${taskId}/status`, {
        status,
        changedBy: parseInt(user.id),
        notes
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role
        }
      });

      toast.success(`Task marked as ${status}`);
      fetchTasks();
      fetchStatistics();
    } catch (err) {
      console.error('Error updating task status:', err);
      toast.error('Failed to update task status');
    }
  };



  // Edit task
  const editTask = async () => {
    if (!user?.id || !selectedTask || !editForm.title.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const taskData = {
        title: editForm.title,
        description: editForm.description,
        taskType: editForm.taskType,
        priority: editForm.priority,
        dueDate: editForm.dueDate?.toISOString() || null,
        updatedBy: parseInt(user.id)
      };

      await axios.put(`${serverUrl}/tasks/${selectedTask.id}`, taskData, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role
        }
      });

      toast.success('Task updated successfully');
      setShowEditTaskModal(false);
      setSelectedTask(null);
      resetEditForm();
      fetchTasks();
      fetchStatistics();
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task');
    }
  };

  // Delete task
  const deleteTask = async () => {
    if (!user?.id || !selectedTask) return;

    try {
      await axios.delete(`${serverUrl}/tasks/${selectedTask.id}`, {
        headers: {
          'x-user-role': user.role
        },
        data: {
          deletedBy: parseInt(user.id)
        }
      });

      toast.success('Task deleted successfully');
      setShowDeleteConfirmModal(false);
      setSelectedTask(null);
      fetchTasks();
      fetchStatistics();
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error('Failed to delete task');
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      taskType: "custom",
      priority: "medium",
      dueDate: null
    });
  };

  const resetEditForm = () => {
    setEditForm({
      title: "",
      description: "",
      taskType: "custom",
      priority: "medium",
      dueDate: null
    });
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setEditForm({
      title: task.title,
      description: task.description,
      taskType: task.taskType,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate) : null
    });
    setShowEditTaskModal(true);
  };

  const openDeleteModal = (task: Task) => {
    setSelectedTask(task);
    setShowDeleteConfirmModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTasks(page, activeTab, searchTerm);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day(s)`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} day(s)`;
  };

  // Search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchTasks(1, activeTab, searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Initial load and tab changes
  useEffect(() => {
    if (user?.id) {
      fetchTasks(1, activeTab);
      fetchStatistics();
      fetchTemplates();
      setCurrentPage(1);
    }
  }, [activeTab, priorityFilter, typeFilter, user?.id]);

  if (loading && tasks.length === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
            <p className="text-gray-600 dark:text-gray-400">Loading your tasks...</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
              <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
            {statistics && (
              <p className="text-gray-600 dark:text-gray-400">
                Total: {statistics.totalTasks} | Pending: {statistics.pendingTasks} | Completed: {statistics.completedTasks}
                {statistics.overdueTasks > 0 && (
                  <span className="text-red-600 dark:text-red-400"> | Overdue: {statistics.overdueTasks}</span>
                )}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateTaskModal(true)} className="bg-brand-purple hover:bg-brand-purple/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
            <Button onClick={() => setShowTemplateModal(true)} variant="outline">
              🔧 Use Template
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">⚠️ {error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Tab Navigation and Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4">
              <Button
                onClick={() => setActiveTab("pending")}
                variant={activeTab === "pending" ? "default" : "outline"}
                className={activeTab === "pending" ? "bg-brand-purple text-white" : ""}
              >
                Pending {statistics && `(${statistics.pendingTasks})`}
              </Button>
              <Button
                onClick={() => setActiveTab("in_progress")}
                variant={activeTab === "in_progress" ? "default" : "outline"}
                className={activeTab === "in_progress" ? "bg-brand-purple text-white" : ""}
              >
                In Progress {statistics && `(${statistics.inProgressTasks})`}
              </Button>
              <Button
                onClick={() => setActiveTab("completed")}
                variant={activeTab === "completed" ? "default" : "outline"}
                className={activeTab === "completed" ? "bg-brand-purple text-white" : ""}
              >
                Completed {statistics && `(${statistics.completedTasks})`}
              </Button>
              <Button
                onClick={() => setActiveTab("all")}
                variant={activeTab === "all" ? "default" : "outline"}
                className={activeTab === "all" ? "bg-brand-purple text-white" : ""}
              >
                All {statistics && `(${statistics.totalTasks})`}
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="visit">Visit</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4 mb-8">
            {loading && (
              <div className="text-center py-4">
                <div className="inline-flex items-center">
                  <div className="w-4 h-4 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading tasks...
                </div>
              </div>
            )}

            {!loading && tasks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No tasks found. {searchTerm && "Try adjusting your search terms."}
                </p>
              </div>
            )}

            {!loading && tasks.map((task) => (
              <div 
                key={task.id} 
                className={`border rounded-lg p-4 ${
                  task.priority === 'urgent' 
                    ? 'border-red-200 bg-red-50 dark:bg-red-900/10' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-2 ${getStatusColor(task.status)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{task.title}</h3>
                        {task.isPrebuilt && task.prebuiltCategory && (
                          <Badge variant="secondary" className="text-xs mb-1">
                            {task.prebuiltCategory}
                          </Badge>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <span>•</span>
                          <span className="capitalize">{task.taskType.replace('_', ' ')}</span>
                          {task.dueDate && (
                            <>
                              <span>•</span>
                              <span className={
                                formatDueDate(task.dueDate)?.includes('Overdue') 
                                  ? 'text-red-600 dark:text-red-400' 
                                  : ''
                              }>
                                {formatDueDate(task.dueDate)}
                              </span>
                            </>
                          )}
                          {task.commentCount > 0 && (
                            <>
                              <span>•</span>
                              <span>💬 {task.commentCount}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Edit and Delete buttons */}
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => openEditModal(task)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => openDeleteModal(task)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {task.status !== 'completed' && (
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          className="bg-brand-purple hover:bg-brand-purple/90"
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                        >
                          Mark as Done
                        </Button>
                        {task.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          >
                            Start Task
                          </Button>
                        )}
                      </div>
                    )}

                    {task.status === 'completed' && task.completedAt && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        ✅ Completed on {new Date(task.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={`w-10 ${page === currentPage ? "bg-brand-purple text-white" : ""}`}
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Create Task Modal */}
        <Dialog open={showCreateTaskModal} onOpenChange={setShowCreateTaskModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Task Title *</label>
                <Input
                  placeholder="Enter task title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  placeholder="Enter task description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <Select value={taskForm.taskType} onValueChange={(value) => setTaskForm(prev => ({ ...prev, taskType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="visit">Visit</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Select value={taskForm.priority} onValueChange={(value) => setTaskForm(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !taskForm.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {taskForm.dueDate ? format(taskForm.dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={taskForm.dueDate}
                      onSelect={(date) => setTaskForm(prev => ({ ...prev, dueDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateTaskModal(false);
                    resetTaskForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createTask}
                  className="flex-1 bg-brand-purple hover:bg-brand-purple/90"
                  disabled={!taskForm.title.trim()}
                >
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Template Selection Modal */}
        <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Choose a Prebuilt Task Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{template.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge className={getPriorityColor(template.priority)}>
                          {template.priority}
                        </Badge>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500 capitalize">
                          {template.taskType.replace('_', ' ')}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">
                          ~{template.estimatedDuration} min
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-brand-purple hover:bg-brand-purple/90"
                      onClick={() => {
                        createTaskFromTemplate(template);
                        setShowTemplateModal(false);
                      }}
                    >
                      Use Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Task Modal */}
        <Dialog open={showEditTaskModal} onOpenChange={setShowEditTaskModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Task Title *</label>
                <Input
                  placeholder="Enter task title"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  placeholder="Enter task description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <Select value={editForm.taskType} onValueChange={(value) => setEditForm(prev => ({ ...prev, taskType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="visit">Visit</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Select value={editForm.priority} onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editForm.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editForm.dueDate ? format(editForm.dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editForm.dueDate}
                      onSelect={(date) => setEditForm(prev => ({ ...prev, dueDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditTaskModal(false);
                    setSelectedTask(null);
                    resetEditForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={editTask}
                  className="flex-1 bg-brand-purple hover:bg-brand-purple/90"
                  disabled={!editForm.title.trim()}
                >
                  Update Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete the task "{selectedTask?.title}"? This action cannot be undone.
              </p>
              
              {selectedTask && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-sm">
                    <div className="font-medium">{selectedTask.title}</div>
                    <div className="text-gray-600 dark:text-gray-400 mt-1">
                      {selectedTask.description}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getPriorityColor(selectedTask.priority)}>
                        {selectedTask.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500 capitalize">
                        {selectedTask.taskType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setSelectedTask(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={deleteTask}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Tasks;
