"use client";

import { useState, useEffect } from "react";
import { GetClinicas as fetchClinicas } from "@/actions/clinicas";
import { useClinicasStore } from "@/store/useClinicasStore";
import { MapPin } from "lucide-react";

export default function ClinicasList() {
  const { clinicas, isLoaded, setClinicas } = useClinicasStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si ya están cargadas, usar el caché
    if (isLoaded) {
      return;
    }

    const loadClinicas = async () => {
      try {
        setIsLoading(true);
        const response = await fetchClinicas();

        // Validar que la respuesta tenga el formato esperado
        if (!response?.meta?.status) {
          throw new Error(response?.meta?.message || "Error al obtener las clínicas");
        }

        // Extraer el array de clínicas
        if (!Array.isArray(response.store)) {
          throw new Error("Formato de datos inválido");
        }

        setClinicas(response.store);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar las clínicas";
        console.error("Error al cargar clínicas:", err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadClinicas();
  }, [isLoaded, setClinicas]);

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <div className="text-gray-400">Cargando clínicas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 text-center text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  if (clinicas.length === 0 && !isLoading) {
    return (
      <div className="mt-6 text-center text-gray-400">
        <p>No hay clínicas disponibles</p>
      </div>
    );
  }

  const truncateAddress = (address: string, maxLength: number = 40): string => {
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength) + ' ...';
  };

  return (
    <div className="mt-6 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-160px)] pr-2">
      {clinicas.map((clinica) => (
        <div
          key={clinica.id}
          className="bg-[#141414] border border-[#525252] rounded-lg p-4 hover:border-[#dbef67] transition-all hover:shadow-lg hover:shadow-[#dbef67]/20 cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white group-hover:text-[#dbef67] transition-colors line-clamp-2">
                {clinica.name}
              </h3>
              <p
                className="text-sm text-gray-400 mt-2 leading-relaxed flex gap-1 items-center"
                title={clinica.address}
              >
                <MapPin size={16} className="flex-shrink-0" />
                {truncateAddress(clinica.address, 30)}
              </p>
            </div>
            <button>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
</svg> 
<span>Contactar</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
