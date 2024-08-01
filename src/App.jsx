import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Automations from './pages/Automations';
import Kanban from './pages/Kanban';
import ProgramList from './pages/ProgramList';
import ProgramCreate from './pages/ProgramCreate';
import ProgramTasks from './pages/ProgramTasks';
import ClientCreate from './pages/ClientCreate';
import ClientList from './pages/ClientList';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import { BusinessProvider } from './contexts/BusinessContext';

const App = () => {
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <BusinessProvider>
        <div className="flex min-h-screen">
          {user && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
          <div className={`flex-grow transition-all duration-300 ${user ? (isSidebarOpen ? 'ml-44' : 'ml-16') : ''}`}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PrivateRoute element={<Home />} />} />
              <Route path="/clients" element={<PrivateRoute element={<ClientList />} />} />
              <Route path="/clients/:clientId" element={<PrivateRoute element={<Kanban />} />} />
              <Route path="/clients/new" element={<PrivateRoute element={<ClientCreate />} />} />
              <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
              <Route path="/programs" element={<PrivateRoute element={<ProgramList />} />} />
              <Route path="/programs/new" element={<PrivateRoute element={<ProgramCreate />} />} />
              <Route path="/programs/:programId/tasks" element={<PrivateRoute element={<ProgramTasks />} />} />
              <Route path="/automations" element={<PrivateRoute element={<Automations />} />} />
            </Routes>
          </div>
        </div>
      </BusinessProvider>
    </Router>
  );
};

export default App;
