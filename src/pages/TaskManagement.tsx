import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Check, Play, Plus, Pause, Timer, CheckCircle } from 'lucide-react';
import { useTimer } from '@/contexts/TimerContext';
import { useToast } from '@/components/ui/use-toast';

type Task = {
  id: string;
  name: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  assignee: string;
  deadline: string;
  timeEstimate: number;
  timeSpent?: number;
};

const initialTasks: Task[] = [
  {
    id: '1',
    name: 'Contact new logistics partner',
    status: 'In Progress',
    assignee: 'John Doe',
    deadline: '2023-06-15',
    timeEstimate: 3,
  },
  {
    id: '2',
    name: 'Prepare client proposal',
    status: 'Not Started',
    assignee: 'Maria Smith',
    deadline: '2023-06-17',
    timeEstimate: 5,
  },
  {
    id: '3',
    name: 'Review shipping documentation',
    status: 'Completed',
    assignee: 'Alex Johnson',
    deadline: '2023-06-10',
    timeEstimate: 2,
  },
  {
    id: '4',
    name: 'Update carrier database',
    status: 'In Progress',
    assignee: 'Sarah Williams',
    deadline: '2023-06-20',
    timeEstimate: 4,
  },
  {
    id: '5',
    name: 'Analyze Q2 transportation expenses',
    status: 'Not Started',
    assignee: 'Robert Brown',
    deadline: '2023-06-25',
    timeEstimate: 6,
  },
];

const TaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    name: '',
    status: 'Not Started',
    assignee: '',
    deadline: '',
    timeEstimate: 1
  });
  
  const { activeTask, startTimer, stopTimer, completeTask, getTimeSpentFormatted } = useTimer();
  const { toast } = useToast();

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Error parsing tasks from localStorage', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddNewTask = () => {
    if (!newTask.name) return;
    
    const task: Task = {
      id: Date.now().toString(),
      name: newTask.name || '',
      status: newTask.status as 'Not Started' | 'In Progress' | 'Completed',
      assignee: newTask.assignee || '',
      deadline: newTask.deadline || '',
      timeEstimate: newTask.timeEstimate || 1,
    };

    setTasks([...tasks, task]);
    setIsDialogOpen(false);
    setNewTask({
      name: '',
      status: 'Not Started',
      assignee: '',
      deadline: '',
      timeEstimate: 1
    });
  };

  const updateTaskStatus = (id: string, status: 'Not Started' | 'In Progress' | 'Completed') => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, status };
        
        if (status === 'Completed') {
          completeTask(id);
          toast({
            title: "Task Completed",
            description: `"${task.name}" marked as completed. Time spent: ${getTimeSpentFormatted()}`,
          });
        }
        
        return updatedTask;
      }
      return task;
    });
    
    setTasks(updatedTasks);
  };

  const handleStartTask = (task: Task) => {
    if (activeTask?.id === task.id && activeTask.status === 'In Progress') {
      return;
    }
    
    updateTaskStatus(task.id, 'In Progress');
    startTimer(task);
    
    toast({
      title: "Task Started",
      description: `Now tracking time for "${task.name}"`,
    });
  };

  const handleCompleteTask = (id: string) => {
    updateTaskStatus(id, 'Completed');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-lg text-muted-foreground">Task Management with Timing</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-gray-800 hover:bg-gray-900">
          <Plus className="mr-2 h-4 w-4" /> Add New Task
        </Button>
      </div>

      {activeTask && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-blue-800">Currently Working On:</p>
            <h3 className="text-lg font-semibold">{activeTask.name}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-white border border-blue-200 rounded-md px-3 py-2 flex items-center">
              <Timer className="mr-2 h-4 w-4 text-blue-500" />
              <span className="text-lg font-mono font-semibold">{getTimeSpentFormatted()}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => stopTimer()}
              className="border-blue-300 text-blue-700"
            >
              <Pause className="h-4 w-4 mr-1" /> Pause
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (activeTask) {
                  handleCompleteTask(activeTask.id);
                  toast({
                    title: "Task Completed",
                    description: `"${activeTask.name}" marked as completed. Time spent: ${getTimeSpentFormatted()}`,
                  });
                }
              }}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Complete
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <h2 className="px-4 py-3 text-lg font-semibold">Tasks Overview</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Time Estimate</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className={activeTask?.id === task.id ? "bg-blue-50" : ""}>
                <TableCell className="font-medium">
                  {task.name}
                  {activeTask?.id === task.id && (
                    <div className="text-xs font-medium text-blue-600 mt-1">
                      Currently tracking: {getTimeSpentFormatted()}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                    {task.status}
                  </span>
                </TableCell>
                <TableCell>{task.assignee}</TableCell>
                <TableCell>{task.deadline}</TableCell>
                <TableCell>{task.timeEstimate} hours</TableCell>
                <TableCell>
                  {task.status !== 'Completed' ? (
                    <div className="flex gap-2">
                      {task.status === 'Not Started' || (task.status === 'In Progress' && activeTask?.id !== task.id) ? (
                        <Button
                          onClick={() => handleStartTask(task)}
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs"
                        >
                          <Play className="h-3 w-3 mr-1" /> Start
                        </Button>
                      ) : task.status === 'In Progress' && activeTask?.id === task.id ? (
                        <Button
                          onClick={() => handleCompleteTask(task.id)}
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" /> Complete
                        </Button>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-green-600 font-medium text-sm">Completed</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-name">Task Name</Label>
              <Input 
                id="task-name" 
                value={newTask.name} 
                onChange={(e) => setNewTask({...newTask, name: e.target.value})} 
                placeholder="Enter task name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input 
                id="assignee" 
                value={newTask.assignee} 
                onChange={(e) => setNewTask({...newTask, assignee: e.target.value})} 
                placeholder="Enter assignee name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newTask.status} 
                  onValueChange={(value) => setNewTask({...newTask, status: value as any})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input 
                  id="deadline" 
                  type="date" 
                  value={newTask.deadline} 
                  onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time-estimate">Time Estimate (hours)</Label>
              <Input 
                id="time-estimate" 
                type="number" 
                min="1"
                value={newTask.timeEstimate} 
                onChange={(e) => setNewTask({...newTask, timeEstimate: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNewTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManagement;
