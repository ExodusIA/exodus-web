import React, { useState } from 'react';
import Modal from 'react-modal';
import TaskCard from './TaskCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ProgramTasksModal = ({ 
  isOpen, 
  onRequestClose, 
  selectedProgram, 
  programTasks, 
  customTasks, 
  updateCustomTask, 
  deleteCustomTask, 
  addCustomTask 
}) => {
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ taskName: '', taskDescription: '', day: 1 });
  const [errors, setErrors] = useState({});

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm(task);
  };

  const handleFormChange = (e) => {
    setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
  };

  const validateTask = (task) => {
    const newErrors = {};
    if (!task.taskName) newErrors.taskName = 'Nome da Tarefa é obrigatório';
    if (!task.taskDescription) newErrors.taskDescription = 'Descrição da Tarefa é obrigatória';
    if (!task.day) newErrors.day = 'Dia é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveTask = async () => {
    if (!validateTask(taskForm)) return;

    if (editingTask) {
      await updateCustomTask(selectedProgram.programId, editingTask.id, taskForm);
    } else {
      await addCustomTask(selectedProgram.programId, taskForm);
    }
    setEditingTask(null);
    setTaskForm({ taskName: '', taskDescription: '', day: 1 });
    onRequestClose();
  };

  const handleDeleteTask = async () => {
    if (editingTask) {
      await deleteCustomTask(selectedProgram.programId, editingTask.id);
      setEditingTask(null);
      setTaskForm({ taskName: '', taskDescription: '', day: 1 });
      onRequestClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Tarefas do Programa"
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white p-6 rounded shadow-lg max-w-4xl w-full">
        <h2 className="text-xl font-bold mb-4">Tarefas do Programa</h2>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Programa: {selectedProgram?.programName}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[...Array(7)].map((_, dayOfWeek) => (
            <TaskCard
              key={dayOfWeek}
              dayOfWeek={dayOfWeek}
              programTasks={programTasks}
              customTasks={customTasks}
              editCustomTask={handleEditTask}
            />
          ))}
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Adicionar/Editar Tarefa Personalizada</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome da Tarefa</label>
              <Input
                type="text"
                name="taskName"
                value={taskForm.taskName}
                onChange={handleFormChange}
              />
              {errors.taskName && <p className="text-red-500 text-xs italic">{errors.taskName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição da Tarefa</label>
              <Input
                type="text"
                name="taskDescription"
                value={taskForm.taskDescription}
                onChange={handleFormChange}
              />
              {errors.taskDescription && <p className="text-red-500 text-xs italic">{errors.taskDescription}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dia</label>
              <Input
                type="number"
                name="day"
                value={taskForm.day}
                onChange={handleFormChange}
              />
              {errors.day && <p className="text-red-500 text-xs italic">{errors.day}</p>}
            </div>
            <div className="flex justify-end">
              <Button onClick={onRequestClose} variant="secondary" className="mr-2">
                Cancelar
              </Button>
              <Button onClick={handleSaveTask}>
                Salvar
              </Button>
              {editingTask && (
                <Button onClick={handleDeleteTask} className="ml-2 text-red-500">
                  Deletar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProgramTasksModal;
