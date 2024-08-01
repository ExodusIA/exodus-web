import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrograms, addProgram } from '../services/programService';
import { slug } from '../utils/slug';
import { Button } from "@/components/ui/button";
import { useBusiness } from '@/contexts/BusinessContext';

const ProgramCreate = () => {
  const [newProgram, setNewProgram] = useState({ name: '', description: '' });
  const [existingPrograms, setExistingPrograms] = useState([]);
  const navigate = useNavigate();
  const { business, loading } = useBusiness();

  useEffect(() => {
    const fetchPrograms = async (businessId) => {
      try {
        const programsList = await getPrograms(businessId);
        setExistingPrograms(programsList);
      } catch (error) {
        console.error('Erro ao buscar programas:', error);
      }
    };

    fetchPrograms(business.id);
  }, [business]);

  const handleSave = async () => {
    const programExists = existingPrograms.some(program => program.name.toLowerCase() === newProgram.name.toLowerCase());

    if (programExists) {
      alert('Um programa com este nome já existe. Por favor, escolha outro nome.');
      return;
    }

    try {
      const createdProgram = await addProgram({...newProgram, business: business.id});
      navigate(`/programs/${createdProgram.id}/tasks`);
    } catch (error) {
      console.error('Erro ao salvar programa:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Adicionar Programa</h1>
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
      <Button onClick={handleSave}>Salvar e Adicionar Tarefas</Button>
    </div>
  );
};

export default ProgramCreate;
