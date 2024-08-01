"use client";

import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { format, addHours, subHours } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon } from 'lucide-react';
import { getProgramTasks, addProgramTask, updateProgramTask, deleteProgramTask } from '../services/taskService';
import { getClients, addClientProgram } from '../services/clientService';
import { updateProgram, getProgramById } from '../services/programService';
import { DatePickerDemo } from "@/components/ui/date-picker-demo";
import { useBusiness } from '@/contexts/BusinessContext';

Modal.setAppElement('#root');

const ProgramTasks = () => {
  const { programId } = useParams();
  const { business, loading } = useBusiness();
  const [program, setProgram] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [weeks, setWeeks] = useState([1]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [clientModalIsOpen, setClientModalIsOpen] = useState(false);
  const [newTask, setNewTask] = useState({ taskName: '', taskDescription: '', day: 1 });
  const [selectedTask, setSelectedTask] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!programId || loading || !business) return;

    const fetchProgramData = async () => {
      try {
        const programData = await getProgramById(programId);

        if (programData.business.id !== business.id) {
          console.error('Acesso negado: Programa não pertence ao negócio do usuário.');
          return;
        }

        setProgram(programData);

        const tasksList = await getProgramTasks(programId);
        if (tasksList.length === 0) {
          setWeeks([1]);
        } else {
          const tasksWithDetails = tasksList.map(task => ({
            ...task,
            week: Math.ceil(task.day / 7),
            dayOfWeek: task.day % 7 || 7,
          }));

          setTasks(tasksWithDetails);
          const maxWeek = Math.max(...tasksWithDetails.map(task => task.week));
          setWeeks(Array.from({ length: maxWeek }, (_, i) => i + 1));
        }
      } catch (error) {
        console.error('Erro ao buscar dados do programa:', error);
      }
    };

    fetchProgramData();
  }, [programId, loading, business]);

  const addWeek = () => {
    setWeeks([...weeks, weeks.length + 1]);
  };

  const openModal = (week, dayOfWeek, task = null) => {
    if (task) {
      setNewTask({
        taskName: task.taskName,
        taskDescription: task.taskDescription,
        day: task.day,
      });
      setSelectedTask(task);
    } else {
      setNewTask({ taskName: '', taskDescription: '', day: (week - 1) * 7 + dayOfWeek });
      setSelectedTask(null);
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedTask(null);
    setNewTask({ taskName: '', taskDescription: '', day: 1 });
    setErrors({});
  };

  const validateTask = () => {
    const newErrors = {};
    if (!newTask.taskName) newErrors.taskName = 'Nome da Tarefa é obrigatório';
    if (!newTask.taskDescription) newErrors.taskDescription = 'Descrição da Tarefa é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveTask = async () => {
    if (!validateTask()) return;

    try {
      const taskData = {
        taskName: newTask.taskName,
        taskDescription: newTask.taskDescription,
        day: newTask.day,
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
      console.error('Erro ao salvar tarefa:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteProgramTask(program.id, taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      closeModal();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
  };

  const handleTaskClick = (task) => {
    openModal(task.week, task.dayOfWeek, task);
  };

  const handleProgramChange = async () => {
    try {
      await updateProgram(program.id, program);
    } catch (error) {
      console.error('Erro ao atualizar programa:', error);
    }
  };

  const openClientModal = async () => {
    const clientsList = await getClients(business.id);
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
      const adjustedStartDate = addHours(startDate, startDate.getTimezoneOffset() / 60);

      await Promise.all(selectedClients.map(clientId => 
        addClientProgram(clientId, program.id, '9Sti3H8AZL2wnTQT23ff', adjustedStartDate.toISOString(), tasks.length * 7)
      ));

      closeClientModal();
    } catch (error) {
      console.error('Erro ao enviar programa:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {loading ? (
        <p>Carregando...</p>
      ) : program ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Programa: {program.name}</h1>
            <Button onClick={openClientModal}>
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
                          <PlusIcon />
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
              <Button onClick={addWeek}>
                Adicionar Semana
              </Button>
            </div>
          </div>
        </>
      ) : (
        <p>Programa não encontrado ou acesso negado.</p>
      )}

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
            {errors.taskName && <p className="text-red-500 text-xs italic">{errors.taskName}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Descrição da Tarefa</label>
            <Textarea
              value={newTask.taskDescription}
              onChange={(e) => setNewTask({ ...newTask, taskDescription: e.target.value })}
            />
            {errors.taskDescription && <p className="text-red-500 text-xs italic">{errors.taskDescription}</p>}
          </div>
          <div className="flex justify-between">
            {selectedTask && (
              <Button onClick={() => handleDeleteTask(selectedTask.id)} variant="destructive" className="text-red-500 py-1 px-3 rounded mr-2">
                Deletar
              </Button>
            )}
            <div className="flex gap-2">
              <Button onClick={closeModal}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTask}>
                Salvar
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
          <h2 className="text-xl font-bold mb-4">Enviar Programa</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Data de Início</label>
            <DatePickerDemo selectedDate={startDate} setSelectedDate={setStartDate} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Pesquisar Aluno</label>
            <Input
              type="text"
              placeholder="Digite o nome do aluno"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 w-full"
            />
          </div>
          <div className="mb-4 max-h-64 overflow-y-auto">
            {clients
              .filter(client => client.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(client => (
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
          <div className="flex justify-end gap-2">
            <Button onClick={closeClientModal}>
              Cancelar
            </Button>
            <Button onClick={handleSendProgram}>
              Enviar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProgramTasks;
