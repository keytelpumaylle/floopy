"use client";

import { useState, useEffect } from "react";
import { GetClinicas as fetchClinicas } from "@/actions/clinicas";
import { useClinicasStore, Clinica } from "@/store/useClinicasStore";
import { MapPin } from "lucide-react";

interface ClinicasListProps {
  onSelectClinica: (clinica: Clinica) => void;
}

export default function ClinicasList({ onSelectClinica }: ClinicasListProps) {
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
          onClick={() => onSelectClinica(clinica)}
          className="bg-gray-100 border border-gray-300 rounded-lg p-4 hover:border-purple-600 transition-all hover:shadow-lg hover:shadow-purple-600/20 cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                {clinica.name}
              </h3>
              <p
                className="text-sm text-gray-600 mt-2 leading-relaxed flex gap-1 items-center"
                title={clinica.address}
              >
                <MapPin size={16} className="flex-shrink-0" />
                {truncateAddress(clinica.address, 30)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
