import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const classOptions = [
  { value: 'CERET - TERÇA E QUINTA - 6:45', label: 'CERET - TERÇA E QUINTA - 6:45' },
  { value: 'CERET - SEGUNDA E QUARTA - 18:30', label: 'CERET - SEGUNDA E QUINTA - 18:30' },
  { value: 'CERET - TERÇA E QUINTA - 8:15', label: 'CERET - TERÇA E QUINTA - 8:15' },
  { value: 'CERET - TERÇA E QUINTA - 9:45 (TURMA 60+)', label: 'CERET - TERÇA E QUINTA - 9:45 (TURMA 60+)' },
  { value: 'Mentoria Individual', label: 'Mentoria Individual' },
  { value: 'Clube de Desafios', label: 'Clube de Desafios' },
  { value: 'IBIRA', label: 'IBIRA' },
];

const Automations = () => {
  const [clients, setClients] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.baserow.io/api/database/rows/table/302737/?user_field_names=true', {
          headers: {
            Authorization: 'Token ksKlG2r9Ezpl22Sk2kBgATPFHZgIhyrL'
          }
        });
        const activeClients = response.data.results.filter(client => 
          client.status?.value === 'Ativo' && client.program?.value === 'Mentoria');
        setClients(activeClients);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchData();
  }, []);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedClients([]);
    setSelectedClasses([]);
    setSelectAll(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedClients([]);
      setSelectedClasses([]);
    } else {
      setSelectedClients(clients);
      setSelectedClasses(classOptions.map(option => option.value));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectClass = (className) => {
    if (selectedClasses.includes(className)) {
      const newClasses = selectedClasses.filter(c => c !== className);
      const newClients = clients.filter(client => 
        newClasses.includes(client.class?.value));
      setSelectedClients(newClients);
      setSelectedClasses(newClasses);
    } else {
      const newClients = clients.filter(client => 
        client.class?.value === className);
      setSelectedClients([...selectedClients, ...newClients]);
      setSelectedClasses([...selectedClasses, className]);
    }
    setSelectAll(newClients.length === clients.length);
  };

  const handleSelectClient = (client) => {
    if (selectedClients.includes(client)) {
      const newClients = selectedClients.filter(c => c.id !== client.id);
      setSelectedClients(newClients);
      setSelectAll(false);
    } else {
      const newClients = [...selectedClients, client];
      setSelectedClients(newClients);
      setSelectAll(newClients.length === clients.length);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Implementar lógica para envio da mensagem
    closeModal();
  };

  return (
    <div>
      <button onClick={openModal} className="bg-blue-500 text-white px-4 py-2 rounded">
        Enviar Mensagem
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Enviar Mensagem"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded shadow-lg max-w-4xl w-full">
          <h2 className="text-xl font-bold mb-4">Enviar Mensagem</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="mr-2"
                />
                <label htmlFor="selectAll" className="font-medium text-gray-700">
                  Selecionar Todos
                </label>
              </div>
              <div className="flex flex-wrap">
                {classOptions.map(option => (
                  <div key={option.value} className="flex items-center mb-2 mr-4">
                    <input
                      type="checkbox"
                      id={option.value}
                      checked={selectedClasses.includes(option.value)}
                      onChange={() => handleSelectClass(option.value)}
                      className="mr-2"
                    />
                    <label htmlFor={option.value} className="font-medium text-gray-700">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-4 max-h-40 overflow-y-auto border rounded p-2">
              {clients.map(client => (
                <div key={client.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(client)}
                    onChange={() => handleSelectClient(client)}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">{client.name}</label>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Qual a intenção dessa mensagem?
              </label>
              <textarea
                id="message"
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">
                Cancelar
              </button>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Enviar
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Automations;
