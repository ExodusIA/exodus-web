// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Clients from './pages/Clients';
import Settings from './pages/Settings';
import Automations from './pages/Automations';
import Kanban from './pages/Kanban';
import ProgramList from './pages/ProgramList';
import ProgramCreate from './pages/ProgramCreate';
import ProgramTasks from './pages/ProgramTasks';
import ProgramDetails from './pages/ProgramDetails';

const App = () => {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-grow p-6 ml-36">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:clientName" element={<Kanban />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/programs" element={<ProgramList />} />
            <Route path="/programs/:programId" element={<ProgramDetails />} />
            <Route path="/programs/new" element={<ProgramCreate />} />
            <Route path="/programs/:programName/tasks" element={<ProgramTasks />} />
            <Route path="/automations" element={<Automations />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
