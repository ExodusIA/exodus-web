// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, PersonIcon, GearIcon, RocketIcon, CalendarIcon } from '@radix-ui/react-icons';

const Sidebar = () => {
  return (
    <div className="w-36 h-full bg-gray-800 text-white fixed">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-center">Exodus</h1>
      </div>
      <nav className="">
        <NavLink 
          to="/" 
          className="flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white"          
        >
          <HomeIcon className="mr-2" /> Home
        </NavLink>
        <NavLink 
          to="/clients" 
          className="flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <PersonIcon className="mr-2" /> Clientes
        </NavLink>
        <NavLink 
          to="/programs" 
          className="flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <CalendarIcon className="mr-2" /> Programas
        </NavLink>
        <NavLink 
          to="/automations" 
          className="flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <RocketIcon className="mr-2" /> Automações
        </NavLink>
        <NavLink 
          to="/settings" 
          className="flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <GearIcon className="mr-2" /> Configurações
        </NavLink>
        
      </nav>
    </div>
  );
};

export default Sidebar;
