// app/programs/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { getPrograms, deleteProgram } from "../firebase/firebaseServices";
import { slug } from "../utils/slug";
import { TrashIcon } from "@radix-ui/react-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const programsList = await getPrograms();
      setPrograms(programsList);
      setFilteredPrograms(programsList);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const results = programs.filter((program) =>
      program.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPrograms(results);
  }, [searchTerm, programs]);

  const sortPrograms = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    const sortedPrograms = [...filteredPrograms].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    setSortConfig({ key, direction });
    setFilteredPrograms(sortedPrograms);
  };

  const handleDeleteProgram = async (id) => {
    const confirmAction = window.confirm(
      "Você tem certeza que deseja excluir este programa?"
    );
    if (confirmAction) {
      await deleteProgram(id);
      setPrograms(programs.filter((program) => program.id !== id));
      setFilteredPrograms(filteredPrograms.filter((program) => program.id !== id));
    }
  };

  const handleViewProgram = (program) => {
    navigate(`/programs/${slug(program.name)}/tasks`, { state: { programData: program } });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Programas</h1>
        <Button onClick={() => navigate("/programs/new")} className="mr-4">
          Adicionar Programa
        </Button>
      </div>
      <Input
        type="text"
        placeholder="Pesquisar Programas"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full md:w-1/3"
      />
      <div className="overflow-x-auto">
        <Table className="w-full bg-white shadow rounded-lg">
          <TableHeader>
            <TableRow>
              <TableHead
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => sortPrograms("name")}
              >
                Nome{" "}
                {sortConfig.key === "name" &&
                  (sortConfig.direction === "ascending" ? (
                    <ChevronUp className="inline" />
                  ) : (
                    <ChevronDown className="inline" />
                  ))}
              </TableHead>              
              <TableHead
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => sortPrograms("duration")}
              >
                Duração (dias){" "}
                {sortConfig.key === "duration" &&
                  (sortConfig.direction === "ascending" ? (
                    <ChevronUp className="inline" />
                  ) : (
                    <ChevronDown className="inline" />
                  ))}
              </TableHead>
              <TableHead className="px-4 py-2 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrograms.map((program) => (
              <TableRow
                key={program.id}
                className="text-left border-t hover:bg-gray-100 cursor-pointer"
                onClick={() => handleViewProgram(program)}
              >
                <TableCell className="px-4 py-2">
                  {program.name}
                </TableCell>                
                <TableCell className="px-4 py-2">
                  {program.duration}
                </TableCell>
                <TableCell
                  className="px-4 py-2 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteProgram(program.id)}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Programs;
