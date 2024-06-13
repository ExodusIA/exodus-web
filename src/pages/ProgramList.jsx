import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { slug } from '../utils/slug';
import { EyeOpenIcon, Cross1Icon, PlusCircledIcon, CheckIcon, TrashIcon } from '@radix-ui/react-icons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.baserow.io/api/database/rows/table/308790/?user_field_names=true', {
          headers: {
            Authorization: `Token ksKlG2r9Ezpl22Sk2kBgATPFHZgIhyrL` // Use a variável de ambiente
          }
        });

        setPrograms(response.data.results);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleViewTasks = (program) => {
    navigate(`/programs/${slug(program.name)}/tasks`, { state: { programData: program }});
  };

  const handleApplyProgram = (program) => {
    navigate(`/programs/${slug(program.name)}/apply`, { state: { programData: program }});
  };

  const handleDeleteProgram = async (id) => {
    try {
      await axios.delete(`https://api.baserow.io/api/database/rows/table/308790/${id}/`, {
        headers: {
          Authorization: 'Token ksKlG2r9Ezpl22Sk2kBgATPFHZgIhyrL'
        }
      });
      setPrograms(programs.filter(program => program.id !== id));
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Programas</h1>
        <button 
          onClick={() => navigate('/programs/new')} 
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-800"
        >
          + Criar Programa
        </button>
      </div>
      <Table className="w-full bg-white shadow rounded-lg">
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-2 text-left">Nome</TableHead>
            <TableHead className="px-4 py-2 text-left">Descrição</TableHead>
            <TableHead className="px-4 py-2 text-left">Duração (dias)</TableHead>
            <TableHead className="px-4 py-2 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs.map(program => (
            <TableRow key={program.id} className="text-left border-t">
              <TableCell className="px-4 py-2">{program.name}</TableCell>
              <TableCell className="px-4 py-2">{program.description}</TableCell>
              <TableCell className="px-4 py-2">{program.duration}</TableCell>
              <TableCell className="px-4 py-2 text-right">
                <button className="text-blue-500 hover:text-blue-700 mr-2" onClick={() => handleViewTasks(program)}>
                  <EyeOpenIcon className="h-5 w-5" />
                </button>
                <button className="text-green-500 hover:text-green-700 mr-2" onClick={() => handleApplyProgram(program)}>
                  <CheckIcon className="h-5 w-5" />
                </button>
                <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteProgram(program.id)}>
                  <TrashIcon className="h-5 w-5" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Programs;
