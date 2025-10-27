"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

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

interface AnalisisGuardado {
  analisis_visual_resumen: string;
  lista_hallazgos: Hallazgo[];
  diagnostico_sugerido: DiagnosticoSugerido;
  advertencia_legal: string;
  codigo_consulta: string;
  imagenes: string[];
  petData: {
    genero: string;
    peso: string;
    edad: string;
    dni: string;
  };
  fecha: string;
}

export default function PageId() {
  const params = useParams();
  const id = params.id as string;
  const [analisis, setAnalisis] = useState<AnalisisGuardado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const data = localStorage.getItem(`consulta_${id}`);
      if (data) {
        setAnalisis(JSON.parse(data));
      }
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!analisis) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Consulta no encontrada</h2>
          <p className="text-gray-400">No se encontró información para el código: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Resultado del Análisis</h1>
          <p className="text-gray-400">Código de consulta: <span className="text-[#dbef67]">{analisis.codigo_consulta}</span></p>
          <p className="text-gray-400 text-sm">Fecha: {new Date(analisis.fecha).toLocaleString('es-ES')}</p>
        </div>

        {/* Datos de la mascota */}
        <div className="bg-[#141414] border border-[#525252] rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Datos de la Mascota</h2>
          <div className="grid grid-cols-2 gap-4">
            {analisis.petData.genero && (
              <div>
                <span className="text-gray-400">Género:</span>
                <span className="ml-2">{analisis.petData.genero}</span>
              </div>
            )}
            {analisis.petData.peso && (
              <div>
                <span className="text-gray-400">Peso:</span>
                <span className="ml-2">{analisis.petData.peso}</span>
              </div>
            )}
            {analisis.petData.edad && (
              <div>
                <span className="text-gray-400">Edad:</span>
                <span className="ml-2">{analisis.petData.edad}</span>
              </div>
            )}
            {analisis.petData.dni && (
              <div>
                <span className="text-gray-400">DNI Responsable:</span>
                <span className="ml-2">{analisis.petData.dni}</span>
              </div>
            )}
          </div>
        </div>

        {/* Imágenes */}
        <div className="bg-[#141414] border border-[#525252] rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Imágenes Analizadas</h2>
          <div className="grid grid-cols-3 gap-4">
            {analisis.imagenes.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-[#525252]">
                <Image
                  src={img}
                  width={400}
                  height={400}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Resumen del análisis */}
        <div className="bg-[#141414] border border-[#525252] rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Resumen del Análisis Visual</h2>
          <p className="text-gray-300 leading-relaxed">{analisis.analisis_visual_resumen}</p>
        </div>

        {/* Hallazgos */}
        <div className="bg-[#141414] border border-[#525252] rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Hallazgos</h2>
          <div className="space-y-4">
            {analisis.lista_hallazgos.map((hallazgo, index) => (
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
        <div className="bg-[#141414] border border-[#525252] rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Diagnóstico Sugerido</h2>
          <div className="space-y-4">
            <div>
              <span className="text-gray-400">Enfermedad Probable:</span>
              <p className="text-xl font-semibold text-[#dbef67] mt-1">
                {analisis.diagnostico_sugerido.enfermedad_probable}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Confianza del Diagnóstico:</span>
              <p className="text-lg mt-1">
                {analisis.diagnostico_sugerido.confianza_diagnostico_porcentaje}%
              </p>
            </div>
            <div>
              <span className="text-gray-400">Recomendación:</span>
              <p className="text-gray-300 mt-1 leading-relaxed">
                {analisis.diagnostico_sugerido.recomendacion_accion}
              </p>
            </div>
          </div>
        </div>

        {/* Advertencia legal */}
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2 text-red-400">Advertencia Legal</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{analisis.advertencia_legal}</p>
        </div>
      </div>
    </div>
  );
}