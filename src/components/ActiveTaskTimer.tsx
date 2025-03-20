
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTimer } from '@/contexts/TimerContext';
import { Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export const ActiveTaskTimer = () => {
  const { activeTask, getTimeSpentFormatted, completeTask } = useTimer();
  const { toast } = useToast();

  const handleCompleteTask = () => {
    if (activeTask) {
      completeTask(activeTask.id);
      toast({
        title: "Task Completed",
        description: `"${activeTask.name}" marked as completed. Time spent: ${getTimeSpentFormatted()}`,
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Active Task</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {activeTask ? (
          <>
            <div className="text-lg font-semibold truncate">{activeTask.name}</div>
            <div className="text-2xl font-bold text-primary mt-2">{getTimeSpentFormatted()}</div>
            <p className="text-xs text-muted-foreground mt-1">Time running</p>
            <Button 
              onClick={handleCompleteTask} 
              variant="outline" 
              size="sm"
              className="mt-3 w-full border-green-300 text-green-700 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Complete Task
            </Button>
          </>
        ) : (
          <div className="text-muted-foreground">No active task</div>
        )}
      </CardContent>
    </Card>
  );
};
