"use client";

import React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerDemo({ selectedDate, setSelectedDate }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white shadow-lg z-50" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          initialFocus
          locale={ptBR}
          className="z-50"
          renderNavigation={({ previousMonth, nextMonth }) => (
            <div className="flex items-center justify-between p-2">
              <button onClick={previousMonth}>
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <div className="font-semibold">
                {format(selectedDate || new Date(), "MMMM yyyy", { locale: ptBR })}
              </div>
              <button onClick={nextMonth}>
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        />
      </PopoverContent>
    </Popover>
  );
}
