"use client";

import { useState } from "react";
import VerificationCodeForm from "@/components/ui/VerificationCodeForm";
import { GetDniHistories, GetHistories } from "@/actions/histories";
import { Calendar, User, FileText, ChevronRight } from "lucide-react";

interface HistoryItem {
  code: string;
  personDni: number;
  animalName: string;
  genderOfAnimal: number;
  averageWeight: number;
  averageAge: number;
  geminiResponse: string;
  createdOn: string;
}

interface GeminiData {
  analisis_visual_resumen: string;
  lista_hallazgos: Array<{
    hallazgo: string;
    confianza_visual_porcentaje: number;
    imagen_relevante?: number;
  }>;
  diagnostico_sugerido: {
    enfermedad_probable: string;
    confianza_diagnostico_porcentaje: number;
    recomendacion_accion: string;
  };
  advertencia_legal: string;
}

interface HistoryDetail extends HistoryItem {
  geminiData?: GeminiData;
}

export default function HistorialPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [historiales, setHistoriales] = useState<HistoryItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HistoryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentDni, setCurrentDni] = useState<string>("");

  const handleDniSubmit = async (dni: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentDni(dni);

    try {
      const response = await GetDniHistories(dni);

      if (!response.meta.status || !response.history) {
        setError(response.meta.message || "No se encontraron historiales");
        setHistoriales([]);
        setIsLoading(false);
        return;
      }

      setHistoriales(response.history);
      setIsLoading(false);
    } catch (err) {
      console.error("Error al obtener historiales:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setHistoriales([]);
      setIsLoading(false);
    }
  };

  const handleViewDiagnostic = async (history: HistoryItem) => {
    try {
      const response = await GetHistories(history.code, history.personDni);

      if (!response.meta.status || !response.history) {
        console.error("Error al obtener detalle:", response.meta.message);
        return;
      }

      const geminiData: GeminiData = JSON.parse(response.history.geminiResponse);

      setSelectedHistory({
        ...response.history,
        geminiData
      });
    } catch (err) {
      console.error("Error al obtener detalle:", err);
    }
  };

  // Vista inicial: Solo el formulario
  if (historiales.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <VerificationCodeForm onSubmit={handleDniSubmit} isLoading={isLoading} />
      </div>
    );
  }

  // Vista con historiales (sin detalle o con detalle)
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Historial Médico</h1>
          <p className="text-gray-400">DNI: <span className="text-[#dbef67]">{currentDni}</span></p>
          <button
            onClick={() => {
              setHistoriales([]);
              setSelectedHistory(null);
              setError(null);
              setCurrentDni("");
            }}
            className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Volver a buscar otro DNI
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Layout dividido o completo */}
        <div className={`grid ${selectedHistory ? 'grid-cols-2 gap-6' : 'grid-cols-1'}`}>
          {/* Lista de historiales */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">
              {historiales.length} {historiales.length === 1 ? 'Diagnóstico' : 'Diagnósticos'}
            </h2>
            {historiales.map((history) => (
              <div
                key={history.code}
                className={`bg-[#141414] border ${
                  selectedHistory?.code === history.code ? 'border-[#dbef67]' : 'border-[#525252]'
                } rounded-lg p-6 hover:border-[#dbef67] transition-colors`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <FileText size={20} className="text-[#dbef67]" />
                      {history.animalName}
                    </h3>
                    <p className="text-sm text-gray-400">Código: {history.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{history.genderOfAnimal === 0 ? '♂ Macho' : '♀ Hembra'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    {new Date(history.createdOn).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={16} />
                    DNI: {history.personDni}
                  </span>
                </div>

                <button
                  onClick={() => handleViewDiagnostic(history)}
                  className="w-full bg-[#dbef67] hover:bg-[#c9d95f] text-black font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Ver Diagnóstico
                  <ChevronRight size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Detalle del diagnóstico seleccionado */}
          {selectedHistory && selectedHistory.geminiData && (
            <div className="sticky top-8 h-fit max-h-[calc(100vh-4rem)] flex flex-col">
              <div className="bg-[#141414] border border-[#525252] rounded-lg overflow-hidden flex flex-col h-full">
                {/* Header fijo */}
                <div className="flex justify-between items-start p-6 pb-4 flex-shrink-0 border-b border-[#525252]">
                  <h2 className="text-2xl font-semibold">Detalle del Diagnóstico</h2>
                  <button
                    onClick={() => setSelectedHistory(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Contenido scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                {/* Datos de la mascota */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Datos de la Mascota</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Nombre:</span>
                      <span className="ml-2 font-semibold">{selectedHistory.animalName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Género:</span>
                      <span className="ml-2">{selectedHistory.genderOfAnimal === 0 ? 'Macho' : 'Hembra'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Peso:</span>
                      <span className="ml-2">{selectedHistory.averageWeight} kg</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Edad:</span>
                      <span className="ml-2">{selectedHistory.averageAge} años</span>
                    </div>
                  </div>
                </div>

                {/* Resumen */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Resumen del Análisis</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {selectedHistory.geminiData.analisis_visual_resumen}
                  </p>
                </div>

                {/* Hallazgos */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Hallazgos</h3>
                  <div className="space-y-3">
                    {selectedHistory.geminiData.lista_hallazgos.map((hallazgo, index) => (
                      <div key={index} className="border-l-4 border-[#dbef67] pl-3">
                        <p className="text-sm mb-1">{hallazgo.hallazgo}</p>
                        <p className="text-xs text-gray-400">
                          Confianza: <span className="text-[#dbef67]">{hallazgo.confianza_visual_porcentaje}%</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diagnóstico */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Diagnóstico Sugerido</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-400">Enfermedad Probable:</span>
                      <p className="text-lg font-semibold text-[#dbef67] mt-1">
                        {selectedHistory.geminiData.diagnostico_sugerido.enfermedad_probable}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Confianza:</span>
                      <p className="text-base mt-1">
                        {selectedHistory.geminiData.diagnostico_sugerido.confianza_diagnostico_porcentaje}%
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Recomendación:</span>
                      <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                        {selectedHistory.geminiData.diagnostico_sugerido.recomendacion_accion}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advertencia */}
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-2 text-red-400">Advertencia Legal</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {selectedHistory.geminiData.advertencia_legal}
                  </p>
                </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}