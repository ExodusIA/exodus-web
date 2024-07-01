import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrograms, addProgram } from '../firebase/firebaseServices'; // Importa as funções CRUD
import { slug } from '../utils/slug';

const ProgramCreate = () => {
  const [newProgram, setNewProgram] = useState({ name: '', description: '', duration: 0 });
  const [existingPrograms, setExistingPrograms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrograms = async () => {
      const programsList = await getPrograms();
      setExistingPrograms(programsList);
    };

    fetchPrograms();
  }, []);

  const handleSave = async () => {
    const programExists = existingPrograms.some(program => program.name.toLowerCase() === newProgram.name.toLowerCase());

    if (programExists) {
      alert('Um programa com este nome já existe. Por favor, escolha outro nome.');
      return;
    }

    try {
      const createdProgram = await addProgram(newProgram);
      navigate(`/programs/${slug(newProgram.name)}/tasks`, { state: { programData: createdProgram }});
    } catch (error) {
      console.error('Erro ao salvar programa:', error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Criar Novo Programa</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded"
          value={newProgram.name}
          onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          className="w-full px-3 py-2 border rounded"
          value={newProgram.description}
          onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Duração (dias)</label>
        <input
          type="number"
          className="w-full px-3 py-2 border rounded"
          value={newProgram.duration}
          onChange={(e) => setNewProgram({ ...newProgram, duration: e.target.value })}
        />
      </div>
      <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">Salvar e Adicionar Tarefas</button>
    </div>
  );
};

export default ProgramCreate;
