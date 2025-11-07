"use client";

import { useState } from "react";
import VerificationCodeForm from "@/components/ui/VerificationCodeForm";
import { GetDniHistories, GetHistories } from "@/actions/histories";
import {
  Calendar,
  FileText,
  X,
  Folder,
  FolderOpen,
  Clock,
  Activity,
  PawPrint,
  AlertCircle,
  Hospital,
  Pill,
  Stethoscope,
  Gauge,
  CheckCircle,
  Search
} from "lucide-react";

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
  contexto_valido: boolean;
  mensaje_contexto: string;
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
  recomendaciones: {
    clinica_recomendada: {
      nombre: string;
      razon: string;
    };
    especialidad_requerida: string;
    medicamentos_recomendados: Array<{
      nombre: string;
      descripcion: string;
      disponible_en_tienda: boolean;
      nombre_tienda?: string;
      precio?: number;
    }>;
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
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center p-4 relative">
        {/* Círculos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute top-60 right-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-15"></div>
          <div className="absolute bottom-32 left-1/4 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-25"></div>
          <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-purple-600 rounded-full blur-3xl opacity-10"></div>
        </div>
        <div className="relative z-10">
          <VerificationCodeForm onSubmit={handleDniSubmit} isLoading={isLoading} />
        </div>
      </div>
    );
  }

  // Vista con historiales tipo Google Drive
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 relative">
      {/* Círculos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-60 right-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-15"></div>
        <div className="absolute bottom-32 left-1/4 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-25"></div>
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-purple-600 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-purple-400 to-blue-300 rounded-full blur-3xl opacity-15"></div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Historiales Médicos</h1>
              <p className="text-sm md:text-base text-gray-600">
                DNI: <span className="text-purple-600 font-semibold">{currentDni}</span> • {" "}
                <span className="text-gray-500">{historiales.length} {historiales.length === 1 ? 'registro' : 'registros'}</span>
              </p>
            </div>
            <button
              onClick={() => {
                setHistoriales([]);
                setSelectedHistory(null);
                setError(null);
                setCurrentDni("");
              }}
              className="w-full sm:w-auto px-3 md:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:border-purple-600 hover:text-purple-600 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Search size={18} />
              <span className="hidden sm:inline">Buscar otro DNI</span>
              <span className="sm:hidden">Buscar DNI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10">
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
            <p className="text-red-600 text-sm md:text-base">{error}</p>
          </div>
        )}

        {/* Grid de Folders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {historiales.map((history) => (
            <div
              key={history.code}
              onMouseEnter={() => setHoveredFolder(history.code)}
              onMouseLeave={() => setHoveredFolder(null)}
              onClick={() => handleViewDiagnostic(history)}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-purple-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Folder Icon */}
                <div className="mb-4 flex items-center justify-between">
                  {hoveredFolder === history.code ? (
                    <FolderOpen size={48} className="text-purple-600 transition-all" />
                  ) : (
                    <Folder size={48} className="text-purple-500 transition-all" />
                  )}
                  <div className="bg-purple-50 px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-purple-600">HC-{history.code.slice(-4)}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <PawPrint size={16} className="text-purple-600" />
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{history.animalName}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{history.genderOfAnimal === 0 ? 'Macho' : 'Hembra'}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span className="text-xs">
                      {new Date(history.createdOn).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} />
                    <span className="text-xs">
                      {new Date(history.createdOn).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{history.averageWeight} kg</span>
                    <span>{history.averageAge} años</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Historia Clínica */}
      {selectedHistory && selectedHistory.geminiData && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setSelectedHistory(null)}
        >
          <div
            className="bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-full md:max-w-5xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header de Historia Clínica */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 md:p-6 lg:p-8">
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="bg-white/20 p-2 md:p-4 rounded-xl md:rounded-2xl backdrop-blur-sm">
                    <FileText size={24} className="md:w-[32px] md:h-[32px]" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">Historia Clínica</h2>
                    <p className="text-purple-100 text-xs md:text-sm">Registro Médico Veterinario</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedHistory(null)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors flex-shrink-0"
                >
                  <X size={20} className="md:w-[24px] md:h-[24px]" />
                </button>
              </div>

              {/* Info del paciente */}
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-purple-200 text-xs mb-1">Paciente</p>
                  <p className="font-semibold">{selectedHistory.animalName}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-purple-200 text-xs mb-1">Código HC</p>
                  <p className="font-semibold">HC-{selectedHistory.code}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-purple-200 text-xs mb-1">Fecha</p>
                  <p className="font-semibold">
                    {new Date(selectedHistory.createdOn).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-purple-200 text-xs mb-1">Hora</p>
                  <p className="font-semibold">
                    {new Date(selectedHistory.createdOn).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido scrollable */}
            <div className="overflow-y-auto max-h-[calc(95vh-200px)] md:max-h-[calc(90vh-280px)] p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
              {/* Datos del Paciente */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <PawPrint size={20} className="text-purple-600" />
                  Datos del Paciente
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Género</p>
                    <p className="font-semibold text-black">{selectedHistory.genderOfAnimal === 0 ? '♂ Macho' : '♀ Hembra'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Peso</p>
                    <p className="font-semibold text-black">{selectedHistory.averageWeight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Edad</p>
                    <p className="font-semibold text-black">{selectedHistory.averageAge} años</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Responsable</p>
                    <p className="font-semibold text-black">DNI {selectedHistory.personDni}</p>
                  </div>
                </div>
              </div>

              {/* Resumen del Análisis */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText size={20} className="text-purple-600" />
                  Resumen del Análisis
                </h3>
                <p className="text-gray-700 leading-relaxed">{selectedHistory.geminiData.analisis_visual_resumen}</p>
              </div>

              {/* Hallazgos Clínicos */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-purple-600" />
                  Hallazgos Clínicos
                </h3>
                <div className="space-y-3">
                  {selectedHistory.geminiData.lista_hallazgos.map((hallazgo, index) => (
                    <div key={index} className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-gray-900 font-medium flex-1">{hallazgo.hallazgo}</p>
                        {hallazgo.imagen_relevante && (
                          <span className="bg-white text-purple-600 text-xs px-2 py-1 rounded-full ml-2">
                            Imagen #{hallazgo.imagen_relevante}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Gauge size={14} className="text-purple-600" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full transition-all"
                            style={{ width: `${hallazgo.confianza_visual_porcentaje}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-purple-600">
                          {hallazgo.confianza_visual_porcentaje}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnóstico */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle size={20} className="text-purple-600" />
                  Diagnóstico Sugerido
                </h3>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 mb-4">
                  <p className="text-2xl font-bold text-purple-600 mb-2">
                    {selectedHistory.geminiData.diagnostico_sugerido.enfermedad_probable}
                  </p>
                  <div className="flex items-center gap-2">
                    <Gauge size={16} className="text-purple-600" />
                    <span className="text-sm text-gray-700">Confianza del diagnóstico:</span>
                    <span className="text-sm font-bold text-purple-600">
                      {selectedHistory.geminiData.diagnostico_sugerido.confianza_diagnostico_porcentaje}%
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-yellow-800 mb-1">Recomendación</p>
                      <p className="text-gray-700 text-sm">{selectedHistory.geminiData.diagnostico_sugerido.recomendacion_accion}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recomendaciones */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Hospital size={20} className="text-purple-600" />
                  Recomendaciones
                </h3>

                {/* Clínica */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2 text-purple-600">Clínica Recomendada</h4>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="font-bold text-black text-lg mb-1">{selectedHistory.geminiData.recomendaciones.clinica_recomendada.nombre}</p>
                    <p className="text-sm text-gray-700">{selectedHistory.geminiData.recomendaciones.clinica_recomendada.razon}</p>
                  </div>
                </div>

                {/* Especialidad */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-lg p-3">
                    <Stethoscope size={18} className="text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500">Especialidad requerida</p>
                      <p className="font-medium text-gray-900">{selectedHistory.geminiData.recomendaciones.especialidad_requerida}</p>
                    </div>
                  </div>
                </div>

                {/* Medicamentos */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-purple-600 flex items-center gap-2">
                    <Pill size={16} />
                    Medicamentos Recomendados
                  </h4>
                  <div className="space-y-2">
                    {selectedHistory.geminiData.recomendaciones.medicamentos_recomendados.map((med, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-gray-900">{med.nombre}</h5>
                          {med.disponible_en_tienda ? (
                            <div className="text-right">
                              <p className="text-xs text-gray-500">{med.nombre_tienda}</p>
                              <p className="text-lg font-bold text-purple-600">S/. {med.precio}</p>
                            </div>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full border border-yellow-300">
                              No disponible
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{med.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advertencia Legal */}
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">Advertencia Legal</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedHistory.geminiData.advertencia_legal}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
