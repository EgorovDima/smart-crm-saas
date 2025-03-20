
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTimer } from '@/contexts/TimerContext';
import { Clock } from 'lucide-react';

export const ActiveTaskTimer = () => {
  const { activeTask, getTimeSpentFormatted } = useTimer();

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
          </>
        ) : (
          <div className="text-muted-foreground">No active task</div>
        )}
      </CardContent>
    </Card>
  );
};
