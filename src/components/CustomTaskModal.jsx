import React from 'react';
import Modal from 'react-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CustomTaskModal = ({ isOpen, onRequestClose, task, setTask, handleSave, handleDelete, errors }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Editar Tarefa Personalizada"
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
        <h2 className="text-xl font-bold mb-4">Editar Tarefa Personalizada</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome da Tarefa</label>
            <Input
              type="text"
              value={task?.taskName}
              onChange={(e) => setTask({ ...task, taskName: e.target.value })}
            />
            {errors.taskName && <p className="text-red-500 text-xs italic">{errors.taskName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição da Tarefa</label>
            <Input
              type="text"
              value={task?.taskDescription}
              onChange={(e) => setTask({ ...task, taskDescription: e.target.value })}
            />
            {errors.taskDescription && <p className="text-red-500 text-xs italic">{errors.taskDescription}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dia</label>
            <Input
              type="number"
              value={task?.day}
              onChange={(e) => setTask({ ...task, day: e.target.value })}
            />
            {errors.day && <p className="text-red-500 text-xs italic">{errors.day}</p>}
          </div>
          <div className="flex justify-end">
            <Button onClick={onRequestClose} variant="secondary" className="mr-2">
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
            <Button onClick={handleDelete} className="ml-2 text-red-500">
              Deletar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CustomTaskModal;
