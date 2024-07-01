"use client";

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Modal from 'react-modal';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon } from '@radix-ui/react-icons';
import { getProgramTasks, addProgramTask, updateProgramTask, deleteProgramTask, updateProgram, getClients, addClientProgram } from '../firebase/firebaseServices';
import { format } from 'date-fns';

Modal.setAppElement('#root');

const ProgramTasks = () => {
  const location = useLocation();
  const { programData } = location.state || {};
  const [program, setProgram] = useState(programData);
  const [tasks, setTasks] = useState([]);
  const [weeks, setWeeks] = useState([1]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [clientModalIsOpen, setClientModalIsOpen] = useState(false);
  const [newTask, setNewTask] = useState({ taskName: '', taskDescription: '', day: 1, position: 1 });
  const [selectedTask, setSelectedTask] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [startDate, setStartDate] = useState(new Date());

  useEffect(() => {
    if (program && program.id) {
      const loadTasks = async () => {
        const tasksList = await getProgramTasks(program.id);
        const tasksWithDetails = tasksList.map(task => ({
          ...task,
          week: Math.ceil(task.day / 7),
          dayOfWeek: task.day % 7 || 7,
        }));

        setTasks(tasksWithDetails);
        const maxWeek = Math.max(...tasksWithDetails.map(task => task.week));
        setWeeks(Array.from({ length: maxWeek }, (_, i) => i + 1));
      };

      loadTasks();
    }
  }, [program]);

  const addWeek = () => {
    setWeeks([...weeks, weeks.length + 1]);
  };

  const openModal = (week, dayOfWeek, task = null) => {
    if (task) {
      setNewTask({
        taskName: task.taskName,
        taskDescription: task.taskDescription,
        day: task.day,
        position: task.position,
      });
      setSelectedTask(task);
    } else {
      setNewTask({ taskName: '', taskDescription: '', day: (week - 1) * 7 + dayOfWeek, position: 1 });
      setSelectedTask(null);
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedTask(null);
    setNewTask({ taskName: '', taskDescription: '', day: 1, position: 1 });
  };

  const handleSaveTask = async () => {
    try {
      const taskData = {
        taskName: newTask.taskName,
        taskDescription: newTask.taskDescription,
        day: newTask.day,
        position: newTask.position,
      };

      let updatedTask;
      if (selectedTask) {
        await updateProgramTask(program.id, selectedTask.id, taskData);
        updatedTask = { ...taskData, id: selectedTask.id, week: Math.ceil(taskData.day / 7), dayOfWeek: taskData.day % 7 || 7 };
      } else {
        const createdTask = await addProgramTask(program.id, taskData);
        updatedTask = { ...taskData, id: createdTask.id, week: Math.ceil(taskData.day / 7), dayOfWeek: taskData.day % 7 || 7 };
      }

      const updatedTasks = selectedTask
        ? tasks.map(task => (task.id === selectedTask.id ? updatedTask : task))
        : [...tasks, updatedTask];

      setTasks(updatedTasks);
      closeModal();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteProgramTask(program.id, taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      closeModal();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskClick = (task) => {
    openModal(task.week, task.dayOfWeek, task);
  };

  const handleProgramChange = async () => {
    try {
      await updateProgram(program.id, program);
    } catch (error) {
      console.error('Error updating program:', error);
    }
  };

  const openClientModal = async () => {
    const clientsList = await getClients();
    setClients(clientsList);
    setClientModalIsOpen(true);
  };

  const closeClientModal = () => {
    setClientModalIsOpen(false);
    setSelectedClients([]);
  };

  const handleSelectClient = (clientId) => {
    setSelectedClients(prevSelected => 
      prevSelected.includes(clientId)
        ? prevSelected.filter(id => id !== clientId)
        : [...prevSelected, clientId]
    );
  };

  const handleSendProgram = async () => {
    try {
      const formattedDate = format(startDate, 'yyyy-MM-dd');

      await Promise.all(selectedClients.map(clientId => 
        addClientProgram({
          clientId,
          programId: program.id,
          assignedDate: formattedDate,
          duration: tasks.length * 7
        })
      ));

      closeClientModal();
    } catch (error) {
      console.error('Error sending program:', error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Programa: {program.name}</h1>
        <Button onClick={openClientModal} className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded">
          Enviar Programa
        </Button>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Nome do Programa</label>
        <Input
          type="text"
          value={program.name}
          onChange={(e) => setProgram({ ...program, name: e.target.value })}
          onBlur={handleProgramChange}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Descrição do Programa</label>
        <Textarea
          value={program.description}
          onChange={(e) => setProgram({ ...program, description: e.target.value })}
          onBlur={handleProgramChange}
        />
      </div>
      <div className="flex flex-col">
        {weeks.map((week) => (
          <div key={week} className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Semana {week}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[...Array(7)].map((_, dayOfWeek) => (
                <Card key={dayOfWeek} className="border p-4 rounded relative flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Dia {dayOfWeek + 1}</h3>
                    <div
                      onClick={() => openModal(week, dayOfWeek + 1)}
                      className="cursor-pointer text-xl text-gray-400 hover:text-blue-600"
                    >
                      +
                    </div>
                  </div>
                  {tasks
                    .filter(task => task.week === week && task.dayOfWeek === dayOfWeek + 1)
                    .map(task => (
                      <div
                        key={task.id}
                        className="mb-2 cursor-pointer w-full flex items-center justify-center border p-2 rounded text-sm"
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="truncate text-center">
                          <strong>{task.taskName}</strong>
                        </div>
                      </div>
                    ))}
                </Card>
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-end mt-4">
          <Button onClick={addWeek} className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded">
            Adicionar Semana
          </Button>
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Detalhes da Tarefa"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
          <h2 className="text-xl font-bold mb-4">{selectedTask ? 'Editar Tarefa' : 'Adicionar Tarefa'}</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nome da Tarefa</label>
            <Input
              type="text"
              value={newTask.taskName}
              onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Descrição da Tarefa (Markdown)</label>
            <Textarea
              value={newTask.taskDescription}
              onChange={(e) => setNewTask({ ...newTask, taskDescription: e.target.value })}
            />
          </div>
          <div className="flex justify-between">
            {selectedTask && (
              <Button onClick={() => handleDeleteTask(selectedTask.id)} variant="destructive" className="mr-2">
                Delete
              </Button>
            )}
            <div className="flex">
              <Button onClick={closeModal} variant="secondary" className="mr-2">
                Cancel
              </Button>
              <Button onClick={handleSaveTask}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={clientModalIsOpen}
        onRequestClose={closeClientModal}
        contentLabel="Enviar Programa"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
          <h2 className="text-xl font-bold mb-4">Selecione os Alunos</h2>
          <div className="mb-4 max-h-64 overflow-y-auto">
            {clients.map(client => (
              <div key={client.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedClients.includes(client.id)}
                  onChange={() => handleSelectClient(client.id)}
                />
                <label className="text-sm font-medium text-gray-700">{client.name}</label>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Data de Início</label>
            <ReactDatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={closeClientModal} variant="secondary" className="mr-2">
              Cancelar
            </Button>
            <Button onClick={handleSendProgram} className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded">
              Enviar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProgramTasks;
