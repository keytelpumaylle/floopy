"use client";

import { useSettingsStore } from "@/store/useSettingsStore";

export default function Settings() {
  const { petData, setPetData } = useSettingsStore();

  return (
    <div
      className={`transition-all duration-500 ease-in-out overflow-hidden min-h-0`}
    >
      <div className="border-[#525252] border-1 rounded-[15px] bg-[#141414] px-6 py-4 h-full overflow-y-auto">
          <div className=" overflow-y-auto">
            {/* Nombre de la Mascota */}
            <div className="mb-4">
              <label className="text-sm text-gray-300 block mb-2">
                Nombre de la Mascota
              </label>
              <input
                type="text"
                placeholder="Firulais"
                value={petData.animalName}
                onChange={(e) => setPetData({ animalName: e.target.value })}
                className="w-full bg-[#262626] border border-[#525252] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#dbef67]"
              />
            </div>

            {/* Genero */}
            <div className="mb-4">
              <label className="text-sm text-gray-300 block mb-2">
                Género de la mascota
              </label>
              <select
                value={petData.genero}
                onChange={(e) =>
                  setPetData({ genero: e.target.value as "Macho" | "Hembra" })
                }
                className="w-full bg-[#262626] border border-[#525252] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#dbef67] cursor-pointer"
              >
                <option value="">Seleccionar...</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>

            {/* Peso y Edad en dos columnas */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Peso Aproximado */}
              <div>
                <label className="text-sm text-gray-300 block mb-2">
                  Peso Aproximado (kg)
                </label>
                <input
                  type="text"
                  placeholder="12"
                  value={petData.peso}
                  onChange={(e) => setPetData({ peso: e.target.value })}
                  className="w-full bg-[#262626] border border-[#525252] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#dbef67]"
                />
              </div>

              {/* Edad Aproximada */}
              <div>
                <label className="text-sm text-gray-300 block mb-2">
                  Edad Aproximada
                </label>
                <input
                  type="text"
                  placeholder="1 año 3 meses"
                  value={petData.edad}
                  onChange={(e) => setPetData({ edad: e.target.value })}
                  className="w-full bg-[#262626] border border-[#525252] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#dbef67]"
                />
              </div>
            </div>

            {/*DNI  */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-300">
                  DNI - Responsable
                </label>
              </div>
              <input
                type="text"
                placeholder="7654321"
                name="dni"
                value={petData.dni}
                onChange={(e) => setPetData({ dni: e.target.value })}
                className="w-full bg-[#262626] border border-[#525252] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#dbef67]"
              />
            </div>
          </div>
      </div>
    </div>
  );
}
