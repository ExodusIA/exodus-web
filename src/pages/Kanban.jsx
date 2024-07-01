import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getClientPrograms, deleteClientProgram } from '../firebase/firebaseServices';
import { format, differenceInDays, isValid } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Kanban = () => {
  const location = useLocation();
  const { clientData } = location.state;
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      if (clientData && clientData.id) {
        const programsList = await getClientPrograms(clientData.id);
        setPrograms(programsList);
      }
    };

    fetchPrograms();
  }, [clientData]);

  const handleDeleteProgram = async (clientProgramId) => {
    try {
      const confirmAction = window.confirm("Você tem certeza que deseja excluir este programa?");
      if (confirmAction) {
        await deleteClientProgram(clientProgramId);
        setPrograms(programs.filter(program => program.id !== clientProgramId));
      }
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const calculateStatus = (assignedDate, duration) => {
    const today = new Date();
    const startDate = new Date(assignedDate);
    const daysPassed = differenceInDays(today, startDate);
    if (daysPassed < 0) return 'Não Iniciado';
    return daysPassed <= duration ? 'Ativo' : 'Concluído';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800';
      case 'Concluído':
        return 'bg-red-100 text-red-800';
      case 'Não Iniciado':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Sobre Você</h2>
          <p><strong>Nome:</strong> {clientData.name}</p>
          <p><strong>Telefone:</strong> {clientData.phone}</p>
          <p><strong>E-mail:</strong> {clientData.email}</p>
          <p><strong>Status:</strong> {clientData.status === 1 ? 'Ativo' : 'Inativo'}</p>
        </div>
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Exames</h2>
          {/* Lógica para exibir exames */}
        </div>
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Resultados e Reflexões</h2>
          {/* Lógica para exibir resultados e reflexões */}
        </div>
      </div>
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Programas</h2>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Programa</TableHead>
                <TableHead>Data de Início</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length > 0 ? (
                programs.map((program) => {
                  const status = calculateStatus(program.assignedDate, program.programDuration);
                  return (
                    <TableRow key={program.id}>
                      <TableCell>{program.programName}</TableCell>
                      <TableCell>{isValid(new Date(program.assignedDate)) ? format(new Date(program.assignedDate), 'dd/MM/yyyy') : 'Data Inválida'}</TableCell>
                      <TableCell>{program.programDuration} dias</TableCell>
                      <TableCell>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(status)}`}>
                          {status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button onClick={() => handleDeleteProgram(program.id)} className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded">
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan="5" className="text-center">Nenhum programa ativo</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Kanban;
