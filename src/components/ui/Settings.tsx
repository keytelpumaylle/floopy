"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { X } from "lucide-react";

export default function Settings() {
  const { focusedSection, setFocusedSection, petData, setPetData } = useSettingsStore();

  const handleClose = () => {
    setFocusedSection('none');
  };

  // Calcular el flex basado en el foco
  const getFlexClass = () => {
    if (focusedSection === 'settings') return 'flex-[3]'; // Expandido cuando tiene foco
    return 'h-0 opacity-0'; // Cerrado en todos los demás casos (input o none)
  };

  // No mostrar el contenido si no está en modo settings
  if (focusedSection !== 'settings') {
    return (
      <div className="h-0 opacity-0 transition-all duration-500 ease-in-out overflow-hidden" />
    );
  }

  return (
    <div
      className={`transition-all duration-500 ease-in-out overflow-hidden min-h-0 ${getFlexClass()}`}
    >
      <div className="border-[#525252] border-1 rounded-[30px] bg-[#141414] p-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Detalles generales</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-[#262626] transition-colors"
            aria-label="Cerrar ajustes"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Genero */}
        <div className="mb-6">
          <label className="text-sm text-gray-300 block mb-2">Género de la mascota</label>
          <select
            value={petData.genero}
            onChange={(e) => setPetData({ genero: e.target.value as 'Macho' | 'Hembra' })}
            className="w-full bg-[#262626] border border-[#525252] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#dbef67] cursor-pointer"
          >
            <option value="">Seleccionar...</option>
            <option value="Macho">Macho</option>
            <option value="Hembra">Hembra</option>
          </select>
        </div>

        {/* Peso Aproximado */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-300">Peso Aproximado (kg) - Mascota</label>
          </div>
          <input
            type="text"
            placeholder="12 kg"
            value={petData.peso}
            onChange={(e) => setPetData({ peso: e.target.value })}
            className="w-full bg-[#262626] border border-[#525252] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#dbef67]"
          />
        </div>

        {/* Edad Aproximado */}
        <div className="">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-300">Edad Aproximado - Mascota</label>
          </div>
          <input
            type="text"
            placeholder="1 año con 3 meses"
            value={petData.edad}
            onChange={(e) => setPetData({ edad: e.target.value })}
            className="w-full bg-[#262626] border border-[#525252] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#dbef67]"
          />
        </div>
      </div>
    </div>
  );
}
