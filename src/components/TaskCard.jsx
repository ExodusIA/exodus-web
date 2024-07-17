import React from 'react';
import { Card } from '@/components/ui/card';

const TaskCard = ({ dayOfWeek, programTasks, customTasks, editCustomTask }) => {
  return (
    <Card className="border p-4 rounded relative flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Dia {dayOfWeek + 1}</h3>
      </div>
      {programTasks
        .filter(task => (task.day - 1) % 7 === dayOfWeek)
        .map(task => (
          <div key={task.id} className="mb-2 w-full flex items-center justify-center border p-2 rounded text-sm bg-gray-200">
            <div className="truncate text-center">
              <strong>{task.taskName}</strong>
              <p>{task.taskDescription}</p>
            </div>
          </div>
        ))}
      {customTasks
        .filter(task => (task.day - 1) % 7 === dayOfWeek)
        .map(task => (
          <div key={task.id} className="mb-2 w-full flex items-center justify-center border p-2 rounded text-sm bg-yellow-200" onClick={() => editCustomTask(task)}>
            <div className="truncate text-center">
              <strong>{task.taskName}</strong>
              <p>{task.taskDescription}</p>
            </div>
          </div>
        ))}
    </Card>
  );
};

export default TaskCard;
