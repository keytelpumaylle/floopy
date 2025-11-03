"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { GetHistories } from '@/actions/histories';

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

interface GeminiData {
  analisis_visual_resumen: string;
  lista_hallazgos: Hallazgo[];
  diagnostico_sugerido: DiagnosticoSugerido;
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
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-xl">Cargando diagnóstico...</div>
      </div>
    );
  }

  if (error || !historyData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Error al cargar diagnóstico</h2>
          <p className="text-gray-400">{error || 'No se encontró información'}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 px-6 py-3 bg-[#dbef67] text-black rounded-[15px] hover:bg-[#c9d95f] transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!historyData.geminiData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Error en los datos</h2>
          <p className="text-gray-400">No se pudo procesar la información del diagnóstico</p>
        </div>
      </div>
    );
  }

  const gemini = historyData.geminiData;

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 py-6 w-full flex-shrink-0">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Resultado del Análisis</h1>
          <p className="text-gray-400">Código de consulta: <span className="text-[#dbef67]">{historyData.code}</span></p>
          <p className="text-gray-400 text-sm">Fecha: {new Date(historyData.createdOn).toLocaleString('es-ES')}</p>
        </div>
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 pb-8 space-y-6">

        {/* Datos de la mascota */}
        <div className="bg-[#141414] border border-[#525252] rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Datos de la Mascota</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-gray-400">Nombre:</span>
              <span className="ml-2 font-semibold">{historyData.animalName}</span>
            </div>
            <div>
              <span className="text-gray-400">Género:</span>
              <span className="ml-2">{historyData.genderOfAnimal === 0 ? 'Macho' : 'Hembra'}</span>
            </div>
            <div>
              <span className="text-gray-400">Peso:</span>
              <span className="ml-2">{historyData.averageWeight} kg</span>
            </div>
            <div>
              <span className="text-gray-400">Edad:</span>
              <span className="ml-2">{historyData.averageAge} años</span>
            </div>
            <div>
              <span className="text-gray-400">DNI Responsable:</span>
              <span className="ml-2">{historyData.personDni}</span>
            </div>
          </div>
        </div>

        {/* Resumen del análisis */}
        <div className="bg-[#141414] border border-[#525252] rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Resumen del Análisis Visual</h2>
          <p className="text-gray-300 leading-relaxed">{gemini.analisis_visual_resumen}</p>
        </div>

        {/* Hallazgos */}
        <div className="bg-[#141414] border border-[#525252] rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Hallazgos</h2>
          <div className="space-y-4">
            {gemini.lista_hallazgos.map((hallazgo, index) => (
              <div key={index} className="border-l-4 border-[#dbef67] pl-4">
                <p className="text-lg mb-2">{hallazgo.hallazgo}</p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">
                    Confianza: <span className="text-[#dbef67]">{hallazgo.confianza_visual_porcentaje}%</span>
                  </span>
                  {hallazgo.imagen_relevante && (
                    <span className="text-sm text-gray-400">
                      Imagen relevante: #{hallazgo.imagen_relevante}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnóstico */}
        <div className="bg-[#141414] border border-[#525252] rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Diagnóstico Sugerido</h2>
          <div className="space-y-4">
            <div>
              <span className="text-gray-400">Enfermedad Probable:</span>
              <p className="text-xl font-semibold text-[#dbef67] mt-1">
                {gemini.diagnostico_sugerido.enfermedad_probable}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Confianza del Diagnóstico:</span>
              <p className="text-lg mt-1">
                {gemini.diagnostico_sugerido.confianza_diagnostico_porcentaje}%
              </p>
            </div>
            <div>
              <span className="text-gray-400">Recomendación:</span>
              <p className="text-gray-300 mt-1 leading-relaxed">
                {gemini.diagnostico_sugerido.recomendacion_accion}
              </p>
            </div>
          </div>
        </div>

        {/* Advertencia legal */}
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2 text-red-400">Advertencia Legal</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{gemini.advertencia_legal}</p>
        </div>

        {/* Botón volver */}
        <div className="flex justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-[#dbef67] text-black font-semibold rounded-[15px] hover:bg-[#c9d95f] transition-colors"
          >
            Realizar nuevo análisis
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function DiagnosticoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-xl">Cargando diagnóstico...</div>
      </div>
    }>
      <DiagnosticoContent />
    </Suspense>
  );
}