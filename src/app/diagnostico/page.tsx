"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { GetHistories } from '@/actions/histories';
import {
  PawPrint,
  FileText,
  Activity,
  AlertCircle,
  Hospital,
  Pill,
  Stethoscope,
  Calendar,
  User,
  Weight,
  Gauge,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

interface Hallazgo {
  hallazgo: string;
  confianza_visual_porcentaje: number;
  imagen_relevante?: number;
}

interface DiagnosticoSugerido {
  enfermedad_probable: string;
  confianza_diagnostico_porcentaje: number;
  recomendacion_accion: string;
}

interface MedicamentoRecomendado {
  nombre: string;
  descripcion: string;
  disponible_en_tienda: boolean;
  nombre_tienda?: string;
  precio?: number;
}

interface Recomendaciones {
  clinica_recomendada: {
    nombre: string;
    razon: string;
  };
  especialidad_requerida: string;
  medicamentos_recomendados: MedicamentoRecomendado[];
}

interface GeminiData {
  contexto_valido: boolean;
  mensaje_contexto: string;
  analisis_visual_resumen: string;
  lista_hallazgos: Hallazgo[];
  diagnostico_sugerido: DiagnosticoSugerido;
  recomendaciones: Recomendaciones;
  advertencia_legal: string;
}

interface HistoryData {
  code: string;
  personDni: number;
  animalName: string;
  genderOfAnimal: number;
  averageWeight: number;
  averageAge: number;
  geminiResponse: string;
  createdOn: string;
  geminiData?: GeminiData;
}

function DiagnosticoContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const dni = searchParams.get('dni');

  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!code || !dni) {
        setError('Faltan parámetros requeridos (code y dni)');
        setLoading(false);
        return;
      }

      try {
        console.log('Obteniendo historial...');
        const response = await GetHistories(code, dni);

        if (!response.meta.status || !response.history) {
          setError(response.meta.message || 'No se pudo obtener el historial');
          setLoading(false);
          return;
        }

        // Parsear el geminiResponse
        const geminiData: GeminiData = JSON.parse(response.history.geminiResponse);

        setHistoryData({
          ...response.history,
          geminiData
        });
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener historial:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    };

    fetchHistory();
  }, [code, dni]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 text-gray-900 flex items-center justify-center relative">
        {/* Círculos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute top-60 right-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-15"></div>
          <div className="absolute bottom-32 left-1/4 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-25"></div>
        </div>
        <div className="text-xl relative z-10">Cargando diagnóstico...</div>
      </div>
    );
  }

  if (error || !historyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 text-gray-900 flex items-center justify-center relative">
        {/* Círculos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute top-60 right-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-15"></div>
          <div className="absolute bottom-32 left-1/4 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-25"></div>
        </div>
        <div className="text-center relative z-10">
          <h2 className="text-2xl mb-4">Error al cargar diagnóstico</h2>
          <p className="text-gray-600">{error || 'No se encontró información'}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-[15px] hover:bg-purple-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!historyData.geminiData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 text-gray-900 flex items-center justify-center relative">
        {/* Círculos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute top-60 right-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-15"></div>
          <div className="absolute bottom-32 left-1/4 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-25"></div>
        </div>
        <div className="text-center relative z-10">
          <h2 className="text-2xl mb-4">Error en los datos</h2>
          <p className="text-gray-600">No se pudo procesar la información del diagnóstico</p>
        </div>
      </div>
    );
  }

  const gemini = historyData.geminiData;

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

      {/* Header con botón volver */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors text-sm md:text-base"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Volver al inicio</span>
              <span className="sm:hidden">Volver</span>
            </button>
            <div className="flex items-center gap-2 bg-purple-50 px-3 md:px-4 py-1 md:py-2 rounded-full">
              <FileText size={16} className="text-purple-600 md:w-[18px] md:h-[18px]" />
              <span className="text-xs md:text-sm font-medium text-gray-700">Código: {historyData.code.slice(-8)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal en 2 columnas */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">

          {/* SIDEBAR - Información de la mascota */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card principal de la mascota */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-3 rounded-full">
                  <PawPrint className="text-purple-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{historyData.animalName}</h2>
                  <p className="text-sm text-gray-500">{historyData.genderOfAnimal === 0 ? 'Macho' : 'Hembra'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={18} className="text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Fecha del análisis</p>
                    <p className="font-medium text-gray-900">
                      {new Date(historyData.createdOn).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Weight size={18} className="text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Peso</p>
                    <p className="font-medium text-gray-900">{historyData.averageWeight} kg</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Activity size={18} className="text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Edad</p>
                    <p className="font-medium text-gray-900">{historyData.averageAge} años</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <User size={18} className="text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Responsable</p>
                    <p className="font-medium text-gray-900">DNI {historyData.personDni}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TIMELINE - Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resumen del análisis */}
            <div className="relative">
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 to-transparent"></div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-full flex-shrink-0 relative z-10">
                    <FileText className="text-purple-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Resumen del Análisis</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(historyData.createdOn).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{gemini.analisis_visual_resumen}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hallazgos */}
            <div className="relative">
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 to-transparent"></div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-full flex-shrink-0 relative z-10">
                    <Activity className="text-purple-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hallazgos Clínicos</h3>
                    <div className="space-y-4">
                      {gemini.lista_hallazgos.map((hallazgo, index) => (
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
                </div>
              </div>
            </div>

            {/* Diagnóstico */}
            <div className="relative">
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 to-transparent"></div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-full flex-shrink-0 relative z-10">
                    <AlertCircle className="text-purple-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnóstico Sugerido</h3>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                      <p className="text-2xl font-bold text-purple-600 mb-2">
                        {gemini.diagnostico_sugerido.enfermedad_probable}
                      </p>
                      <div className="flex items-center gap-2">
                        <Gauge size={16} className="text-purple-600" />
                        <span className="text-sm text-gray-700">Confianza del diagnóstico:</span>
                        <span className="text-sm font-bold text-purple-600">
                          {gemini.diagnostico_sugerido.confianza_diagnostico_porcentaje}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-yellow-800 mb-1">Recomendación</p>
                          <p className="text-gray-700">{gemini.diagnostico_sugerido.recomendacion_accion}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clínica Recomendada */}
            <div className="relative">
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 to-transparent"></div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-full flex-shrink-0 relative z-10">
                    <Hospital className="text-purple-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Clínica Recomendada</h3>

                    <div className="bg-purple-50 rounded-lg p-4 mb-3">
                      <p className="text-xl font-bold text-gray-900 mb-2">
                        {gemini.recomendaciones.clinica_recomendada.nombre}
                      </p>
                      <p className="text-sm text-gray-700">{gemini.recomendaciones.clinica_recomendada.razon}</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-lg p-3">
                      <Stethoscope size={18} className="text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-500">Especialidad requerida</p>
                        <p className="font-medium text-gray-900">{gemini.recomendaciones.especialidad_requerida}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medicamentos */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-full flex-shrink-0 relative z-10">
                    <Pill className="text-purple-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Medicamentos Recomendados</h3>

                    <div className="space-y-3">
                      {gemini.recomendaciones.medicamentos_recomendados.map((med, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{med.nombre}</h4>
                            {med.disponible_en_tienda ? (
                              <div className="text-right">
                                <p className="text-xs text-gray-500">{med.nombre_tienda}</p>
                                <p className="text-lg font-bold text-purple-600">S/. {med.precio}</p>
                              </div>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full border border-yellow-300 flex-shrink-0">
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
              </div>
            </div>

            {/* Advertencia legal */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">Advertencia Legal</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{gemini.advertencia_legal}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiagnosticoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-xl">Cargando diagnóstico...</div>
      </div>
    }>
      <DiagnosticoContent />
    </Suspense>
  );
}