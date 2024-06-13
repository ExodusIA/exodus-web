import React from 'react';
import { useLocation } from 'react-router-dom';

const Kanban = () => {
  const location = useLocation();
  const { clientData } = location.state;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">{clientData.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-bold mb-2">Sobre Você</h2>
          <p>Nome: {clientData.name}</p>
          <p>Telefone: {clientData.phone}</p>
          <p>E-mail: {clientData.email}</p>
          <p>Status: {clientData.status?.value}</p>
        </div>
        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-bold mb-2">Exames</h2>
          {/* Lógica para exibir exames */}
        </div>
        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-bold mb-2">Desafios</h2>
          {/* Lógica para exibir desafios */}
        </div>
        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-bold mb-2">Ciclo 3/2024</h2>
          {/* Lógica para exibir ciclo */}
        </div>
        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-bold mb-2">Resultados e Reflexões</h2>
          {/* Lógica para exibir resultados e reflexões */}
        </div>
      </div>
    </div>
  );
};

export default Kanban;
