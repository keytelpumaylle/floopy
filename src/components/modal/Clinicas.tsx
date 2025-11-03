'use client'
import { useModalStore } from "@/store/useModalStore";
import { useClinicasStore } from "@/store/useClinicasStore";
import { X, Store } from "lucide-react";
import GetClinicas from "../clinicas/GetClinicas";

export default function ModalClinicas() {
    const {closed} = useModalStore();
    const { clinicas } = useClinicasStore();

  return (
    <section
    onClick={closed}
    className="fixed inset-0 h-full w-full z-100 bg-[#0a0a0a90]">
      <div
      onClick={(e) => e.stopPropagation()}
      className="absolute w-[40%] h-full bg-[#0a0a0a] top-0 right-0 py-5 px-10 border-[#525252] border-l-2 shadow-2xl">
        <header className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Store className="text-[#dbef67]" size={24} />
              <div>
                <h2 className="text-lg font-semibold">Clínicas Activas</h2>
                {clinicas.length > 0 && (
                  <p className="text-xs text-gray-400">{clinicas.length} clínicas disponibles</p>
                )}
              </div>
            </div>
            <button
              onClick={closed}
              className="border-[#525252] border-1 rounded-md p-2 hover:cursor-pointer hover:bg-[#525252] transition-colors"
              aria-label="Cerrar modal"
            >
                <X/>
            </button>
        </header>
        {/* Componente que llamará a todas las clínicas disponibles */}
        <GetClinicas />
      </div>
    </section>
  );
}