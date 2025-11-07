'use client'
import { useState } from "react";
import { useModalStore } from "@/store/useModalStore";
import { useClinicasStore, Clinica } from "@/store/useClinicasStore";
import { X, Store } from "lucide-react";
import GetClinicas from "../clinicas/GetClinicas";
import ClinicaDetalle from "../clinicas/ClinicaDetalle";

export default function ModalClinicas() {
    const {closed} = useModalStore();
    const { clinicas } = useClinicasStore();
    const [selectedClinica, setSelectedClinica] = useState<Clinica | null>(null);

    const handleSelectClinica = (clinica: Clinica) => {
      setSelectedClinica(clinica);
    };

    const handleBack = () => {
      setSelectedClinica(null);
    };

  return (
    <section
    onClick={closed}
    className="fixed inset-0 h-full w-full z-100 bg-black/50 backdrop-blur-sm">
      <div
      onClick={(e) => e.stopPropagation()}
      className="absolute w-full sm:w-[80%] md:w-[60%] lg:w-[40%] h-full bg-white top-0 right-0 py-4 md:py-5 px-4 md:px-6 lg:px-10 border-gray-300 border-l-2 shadow-2xl overflow-y-auto">
        <header className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Store className="text-purple-600" size={24} />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedClinica ? 'Detalles de Clínica' : 'Clínicas Activas'}
                </h2>
                {!selectedClinica && clinicas.length > 0 && (
                  <p className="text-xs text-gray-600">{clinicas.length} clínicas disponibles</p>
                )}
              </div>
            </div>
            <button
              onClick={closed}
              className="border-gray-300 border-1 rounded-md p-2 hover:cursor-pointer hover:bg-gray-100 transition-colors text-gray-900"
              aria-label="Cerrar modal"
            >
                <X/>
            </button>
        </header>

        {/* Mostrar lista de clínicas o detalles según selección */}
        {selectedClinica ? (
          <ClinicaDetalle clinica={selectedClinica} onBack={handleBack} />
        ) : (
          <GetClinicas onSelectClinica={handleSelectClinica} />
        )}
      </div>
    </section>
  );
}