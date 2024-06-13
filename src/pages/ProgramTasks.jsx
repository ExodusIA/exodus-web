"use client";

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon } from '@radix-ui/react-icons';

Modal.setAppElement('#root');

const ProgramTasks = () => {
  const location = useLocation();
  const { programData } = location.state || {};
  const [tasks, setTasks] = useState([]);
  const [weeks, setWeeks] = useState([1]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newTask, setNewTask] = useState({ Programs: [programData.name], taskName: '', taskDescription: '', day: 1, position: 1 });
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (programData && programData.id) {
      const loadTasks = async () => {
        const tasks = await fetchAllTaskDetails(programData.id);
      
        const tasksWithDetails = tasks.map(task => ({
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
  }, [programData]);

  const addWeek = () => {
    setWeeks([...weeks, weeks.length + 1]);
  };

  const openModal = (week, dayOfWeek, task = null) => {
    if (task) {
      setNewTask({
        Programs: task.Programs,
        taskName: task.taskName,
        taskDescription: task.taskDescription,
        day: task.day,
        position: task.position,
      });
      setSelectedTask(task);
    } else {
      setNewTask({ Programs: [programData?.name || ''], taskName: '', taskDescription: '', day: (week - 1) * 7 + dayOfWeek, position: 1 });
      setSelectedTask(null);
    }
    setModalIsOpen(true);
  };
  

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedTask(null);
    setNewTask({ Programs: [programData?.name || ''], taskName: '', taskDescription: '', day: 1, position: 1 });
  };
  

  const fetchAllTaskDetails = async (programId) => {
    try {
      const response = await axios.get(
        'https://api.baserow.io/api/database/rows/table/308946/?user_field_names=true&filters=%7B%22filter_type%22%3A%22AND%22%2C%22filters%22%3A%5B%7B%22type%22%3A%22link_row_has%22%2C%22field%22%3A%22Programs%22%2C%22value%22%3A%2225%22%7D%5D%2C%22groups%22%3A%5B%5D%7D',
        {
          headers: {
            Authorization: `Token ksKlG2r9Ezpl22Sk2kBgATPFHZgIhyrL`,
          }
        }        
      );

      return response.data.results;
    } catch (error) {
      console.error('Error fetching task details:', error);
      return [];
    }
  };  

  const handleSaveTask = async () => {
    try {
      const data = {
        taskName: newTask.taskName,
        day: newTask.day,
        taskDescription: newTask.taskDescription,
        position: newTask.position,
        Programs: newTask.Programs.map(program => program.id), // Certifique-se de que está enviando os IDs dos programas
      };

      const response = selectedTask
        ? await axios.patch(`https://api.baserow.io/api/database/rows/table/308946/${selectedTask.id}/?user_field_names=true`, data, {
            headers: {
              Authorization: `Token ksKlG2r9Ezpl22Sk2kBgATPFHZgIhyrL`,
            },
          })
        : await axios.post('https://api.baserow.io/api/database/rows/table/308946/?user_field_names=true', data, {
            headers: {
              Authorization: `Token ksKlG2r9Ezpl22Sk2kBgATPFHZgIhyrL`,
            },
          });

      const savedTask = response.data;
      savedTask.week = Math.ceil(savedTask.day / 7);
      savedTask.dayOfWeek = savedTask.day % 7 || 7;

      setTasks((prevTasks) => {
        if (selectedTask) {
          return prevTasks.map((task) => (task.id === savedTask.id ? savedTask : task));
        } else {
          return [...prevTasks, savedTask];
        }
      });

      closeModal();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`https://api.baserow.io/api/database/rows/table/308946/${taskId}/`, {
        headers: {
          Authorization: `Token ksKlG2r9Ezpl22Sk2kBgATPFHZgIhyrL`,
        },
      });
      setTasks(tasks.filter(task => task.id !== taskId));
      closeModal();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskClick = (task) => {
    openModal(task.week, task.dayOfWeek, task);
  };
  

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">Programa: {programData.name}</h1>
      <div className="flex flex-col">
        {weeks.map((week) => (
          <div key={week} className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Semana {week}</h2>
            <div className="grid grid-cols-7 gap-4">
              {[...Array(7)].map((_, dayOfWeek) => (
                <Card key={dayOfWeek} className="border p-4 rounded relative flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Dia {dayOfWeek + 1}</h3>
                    <Button onClick={() => openModal(week, dayOfWeek + 1)} className="p-2">
                      +
                    </Button>
                  </div>
                  {tasks
                    .filter(task => task.week === week && task.dayOfWeek === dayOfWeek + 1)
                    .map(task => (
                      <div key={task.id} className="mb-2 cursor-pointer w-full flex items-center justify-center border p-2 rounded" onClick={() => handleTaskClick(task)}>
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
        <Button onClick={addWeek} className="mt-4">
          Adicionar Semana
        </Button>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Task Details"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
          <h2 className="text-xl font-bold mb-4">{selectedTask ? 'Edit Task' : 'Add Task'}</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Task Name</label>
            <Input
              type="text"
              value={newTask.taskName}
              onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Task Description (Markdown)</label>
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
    </div>
  );
};

export default ProgramTasks;
