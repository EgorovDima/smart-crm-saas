import React, { createContext, useState, useContext, useEffect } from 'react';

type Task = {
  id: string;
  name: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  assignee: string;
  deadline: string;
  timeEstimate: number;
  timeSpent?: number;
};

type TimerContextType = {
  activeTask: Task | null;
  startTime: number | null;
  elapsedTime: number;
  startTimer: (task: Task) => void;
  stopTimer: () => void;
  completeTask: (taskId: string) => void;
  getTimeSpentFormatted: () => string;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [taskHistory, setTaskHistory] = useState<Record<string, number>>({});

  // Load from localStorage on initial render
  useEffect(() => {
    const savedState = localStorage.getItem('taskTimer');
    if (savedState) {
      try {
        const { activeTask, startTime, elapsedTime, taskHistory } = JSON.parse(savedState);
        setActiveTask(activeTask);
        
        if (startTime) {
          // Calculate elapsed time since last save
          const currentTime = Date.now();
          const additionalTime = startTime ? Math.floor((currentTime - startTime) / 1000) : 0;
          setStartTime(currentTime);
          setElapsedTime(elapsedTime + additionalTime);
        } else {
          setStartTime(null);
          setElapsedTime(elapsedTime);
        }
        
        setTaskHistory(taskHistory || {});
      } catch (error) {
        console.error('Error parsing timer data from localStorage', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('taskTimer', JSON.stringify({
      activeTask,
      startTime,
      elapsedTime,
      taskHistory
    }));
  }, [activeTask, startTime, elapsedTime, taskHistory]);

  // Update elapsed time every second when timer is running
  useEffect(() => {
    let interval: number | undefined;
    
    if (startTime) {
      interval = window.setInterval(() => {
        const currentTime = Date.now();
        const newElapsedTime = Math.floor((currentTime - startTime) / 1000) + elapsedTime;
        setElapsedTime(newElapsedTime);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, elapsedTime]);

  const startTimer = (task: Task) => {
    // Save time for previous task if there was one
    if (activeTask && activeTask.id !== task.id) {
      const previousTimeSpent = taskHistory[activeTask.id] || 0;
      setTaskHistory({
        ...taskHistory,
        [activeTask.id]: previousTimeSpent + elapsedTime
      });
    }
    
    // Start timing new task
    setActiveTask(task);
    setStartTime(Date.now());
    
    // If it's the same task being restarted, keep the elapsed time
    // If it's a new task, reset elapsed time
    if (activeTask?.id !== task.id) {
      setElapsedTime(0);
    }
  };

  const stopTimer = () => {
    if (activeTask && startTime) {
      // Save current elapsed time to task history
      const currentTimeSpent = taskHistory[activeTask.id] || 0;
      setTaskHistory({
        ...taskHistory,
        [activeTask.id]: currentTimeSpent + elapsedTime
      });
    }
    
    setStartTime(null);
  };

  const completeTask = (taskId: string) => {
    // Save final time for the task
    if (activeTask && activeTask.id === taskId && startTime) {
      const currentTimeSpent = taskHistory[taskId] || 0;
      setTaskHistory({
        ...taskHistory,
        [taskId]: currentTimeSpent + elapsedTime
      });
    }
    
    // If the completed task is the active one, clear the active task
    if (activeTask && activeTask.id === taskId) {
      setActiveTask(null);
      setStartTime(null);
      setElapsedTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeSpentFormatted = () => {
    return formatTime(elapsedTime);
  };

  const value = {
    activeTask,
    startTime,
    elapsedTime,
    startTimer,
    stopTimer,
    completeTask,
    getTimeSpentFormatted
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
