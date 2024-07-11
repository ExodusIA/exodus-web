import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, PersonIcon, GearIcon, RocketIcon, CalendarIcon, ExitIcon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import { getAuth, signOut } from 'firebase/auth';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const iconSizeClass = 'w-6 h-6';

  return (
    <div className={`fixed h-full bg-gray-800 text-white flex flex-col justify-between transition-all duration-300 ${isOpen ? 'w-44' : 'w-16'}`}>
      <div>
        <div className="p-4 flex justify-between items-center">
          {isOpen && <h1 className="text-2xl font-bold text-center pb-1">Exodus</h1>}
          <button
            className={`text-white ${isOpen ? '' : 'mx-auto'}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <HamburgerMenuIcon className={iconSizeClass} />
          </button>
        </div>
        <nav className="space-y-2">
          <NavLink 
            to="/" 
            className="flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <HomeIcon className={`${iconSizeClass} ${isOpen ? 'ml-3 mr-2' : 'mx-auto'}`} />
            {isOpen && 'Home'}
          </NavLink>
          <NavLink 
            to="/clients" 
            className="flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <PersonIcon className={`${iconSizeClass} ${isOpen ? 'ml-3 mr-2' : 'mx-auto'}`} />
            {isOpen && 'Clientes'}
          </NavLink>
          <NavLink 
            to="/programs" 
            className="flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <CalendarIcon className={`${iconSizeClass} ${isOpen ? 'ml-3 mr-2' : 'mx-auto'}`} />
            {isOpen && 'Programas'}
          </NavLink>
          <NavLink 
            to="/automations" 
            className="flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <RocketIcon className={`${iconSizeClass} ${isOpen ? 'ml-3 mr-2' : 'mx-auto'}`} />
            {isOpen && 'Automações'}
          </NavLink>
          <NavLink 
            to="/settings" 
            className="flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <GearIcon className={`${iconSizeClass} ${isOpen ? 'ml-3 mr-2' : 'mx-auto'}`} />
            {isOpen && 'Configurações'}
          </NavLink>
        </nav>
      </div>
      <div>
        <button 
          onClick={handleLogout}
          className="flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left"
        >
          <ExitIcon className={`${iconSizeClass} ${isOpen ? 'ml-3 mr-2' : 'mx-auto'}`} />
          {isOpen && 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
