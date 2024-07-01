//Tela desativada

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getProgramTasks, addCustomTask, getCustomTasks } from '../firebase/firebaseServices';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ProgramDetails = () => {
  const location = useLocation();
  const { programData } = location.state;
  const [tasks, setTasks] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);
  const [newCustomTask, setNewCustomTask] = useState({ taskName: '', taskDescription: '', day: 1, position: 1 });
  const [isAddingCustomTask, setIsAddingCustomTask] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      if (programData && programData.programId) {
        const tasksList = await getProgramTasks(programData.programId);
        const customTasksList = await getCustomTasks(programData.id);
        setTasks(tasksList);
        setCustomTasks(customTasksList);
      }
    };

    fetchTasks();
  }, [programData]);

  const handleAddCustomTask = async () => {
    try {
      const customTask = await addCustomTask(programData.id, newCustomTask);
      setCustomTasks([...customTasks, customTask]);
      setNewCustomTask({ taskName: '', taskDescription: '', day: 1, position: 1 });
      setIsAddingCustomTask(false);
    } catch (error) {
      console.error('Error adding custom task:', error);
    }
  };

  const combinedTasks = [...tasks, ...customTasks];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{programData.programName}</h1>
      <div className="flex flex-col">
        {[...Array(Math.max(...combinedTasks.map(task => Math.ceil(task.day / 7))))].map((_, week) => (
          <div key={week} className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Semana {week + 1}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[...Array(7)].map((_, dayOfWeek) => (
                <Card key={dayOfWeek} className="border p-4 rounded relative flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Dia {dayOfWeek + 1}</h3>
                  </div>
                  {combinedTasks
                    .filter(task => Math.ceil(task.day / 7) === week + 1 && task.day % 7 === dayOfWeek + 1)
                    .sort((a, b) => a.position - b.position)
                    .map(task => (
                      <div key={task.id} className="mb-2 cursor-pointer w-full flex items-center justify-center border p-2 rounded text-sm">
                        <div className="truncate text-center">
                          <strong>{task.taskName}</strong>
                          <p>{task.taskDescription}</p>
                        </div>
                      </div>
                    ))}
                </Card>
              ))}
            </div>
          </div>
        ))}
        {isAddingCustomTask ? (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Adicionar Instrução Específica</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Nome da Tarefa</label>
              <Input
                type="text"
                value={newCustomTask.taskName}
                onChange={(e) => setNewCustomTask({ ...newCustomTask, taskName: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Descrição da Tarefa</label>
              <Textarea
                value={newCustomTask.taskDescription}
                onChange={(e) => setNewCustomTask({ ...newCustomTask, taskDescription: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Dia</label>
              <Input
                type="number"
                value={newCustomTask.day}
                onChange={(e) => setNewCustomTask({ ...newCustomTask, day: parseInt(e.target.value) })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Posição</label>
              <Input
                type="number"
                value={newCustomTask.position}
                onChange={(e) => setNewCustomTask({ ...newCustomTask, position: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddCustomTask} className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded mr-2">
                Adicionar
              </Button>
              <Button onClick={() => setIsAddingCustomTask(false)} className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded">
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <Button onClick={() => setIsAddingCustomTask(true)} className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">
              Adicionar Instrução Específica
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramDetails;
