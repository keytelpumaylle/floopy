"use client";

import { useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import { useModalStore } from "@/store/useModalStore";
import { analizarMascotaConGemini } from "@/actions/conversations";

// Interfaces para tipado estricto
interface ConsultaHistorial {
  dni: string;
  codigo: string;
  fecha: string;
}

// Función para generar código único en formato DNI-001
const generarCodigoUnico = (dni: string): string => {
  if (!dni || dni.trim() === '') {
    return `CONSULTA-${Date.now()}`;
  }

  // Obtener historial de consultas
  const historial = localStorage.getItem('consultas_historial');
  const listaHistorial: ConsultaHistorial[] = historial ? JSON.parse(historial) : [];

  // Contar cuántas consultas tiene este DNI
  const consultasDNI = listaHistorial.filter((c) => c.dni === dni);
  const numeroConsulta = consultasDNI.length + 1;

  // Formatear número con ceros a la izquierda (001, 002, etc.)
  const numeroFormateado = numeroConsulta.toString().padStart(3, '0');

  return `${dni}-${numeroFormateado}`;
};

export default function Input() {
  //Modal de Informacion adicional
  const { isOpen, closed, open } = useModalStore();


  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { focusedSection, setFocusedSection, petData, setPetData } = useSettingsStore();
  const { prompt, setPrompt, images, isAnalyzing, setIsAnalyzing } =
    useAnalysisStore();
  const [error, setError] = useState<string>("");

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    setPrompt(e.target.value);
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleFocus = () => {
    setFocusedSection("input");
  };

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      setError("Por favor ingresa una descripción de los síntomas");
      return;
    }

    if (images.length === 0) {
      setError("Por favor sube al menos una imagen");
      return;
    }

    setError("");
    setIsAnalyzing(true);

    try {
      // Convertir las imágenes al formato requerido
      const imageInputs = images.map((img) => {
        // Extraer el mime type y los datos base64
        const matches = img.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
          throw new Error("Formato de imagen inválido");
        }
        return {
          mimeType: matches[1],
          data: matches[2],
        };
      });

      const result = await analizarMascotaConGemini({
        descripcion: prompt,
        imagenes: imageInputs,
        petData: {
          genero: petData.genero,
          peso: petData.peso,
          edad: petData.edad,
          dni: petData.dni,
        },
      });

      if ("error" in result) {
        setError(result.error);
        console.error("Error en el análisis:", result.error);
      } else {
        console.log("\n✅ Análisis completado exitosamente");
        console.log("Ver consola del servidor para detalles completos");

        // Generar código único basado en DNI
        const codigoConsulta = generarCodigoUnico(petData.dni);

        // Guardar resultado en localStorage con el código de consulta
        const analisisCompleto = {
          ...result,
          codigo_consulta: codigoConsulta,
          imagenes: images,
          petData: petData,
          fecha: new Date().toISOString(),
        };

        localStorage.setItem(`consulta_${codigoConsulta}`, JSON.stringify(analisisCompleto));

        // Guardar en historial
        const historial = localStorage.getItem('consultas_historial');
        const listaHistorial: ConsultaHistorial[] = historial ? JSON.parse(historial) : [];
        listaHistorial.push({
          dni: petData.dni,
          codigo: codigoConsulta,
          fecha: new Date().toISOString(),
        });
        localStorage.setItem('consultas_historial', JSON.stringify(listaHistorial));

        // Redirigir a la página de detalles
        window.location.href = `/${codigoConsulta}`;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error al analizar:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calcular el flex basado en el foco
  const getFlexClass = () => {
    if (focusedSection === "input") return "flex-[3]"; // Expandido cuando tiene foco
    if (focusedSection === "settings") return "flex-[0.5]"; // Contraído cuando settings tiene foco
    return "flex-1"; // Normal cuando ninguno tiene foco
  };

  const isContracted = focusedSection === "settings";

  return (
    <>
      <div
        className={`transition-all duration-500 ease-in-out min-h-0 ${getFlexClass()}`}
      >
        <div className="border-[#525252] border-1 rounded-[30px] bg-[#141414] h-full flex flex-col overflow-hidden">
          <textarea
            ref={textareaRef}
            onFocus={handleFocus}
            value={prompt}
            onChange={handleTextareaChange}
            className={`flex-1 w-full px-6 resize-none focus:outline-none text-xl bg-transparent transition-all duration-500 ${
              isContracted ? "py-2 overflow-hidden whitespace-nowrap" : "py-4"
            }`}
            placeholder="Mi perro está rascándose mucho y tiene zonas sin pelo ¿Qué puede ser?"
            rows={2}
            disabled={isAnalyzing}
            style={{ overflow: "hidden" }}
          />

          <div
            className={`p-5 flex flex-col gap-2 flex-shrink-0 transition-all duration-500 ${
              isContracted ? "h-0 p-0 opacity-0" : "opacity-100"
            }`}
          >
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Modelo</span>
                <span className="text-sm">Gemini</span>
              </div>
            
              <button
                onClick={open}
                className="px-4 py-2 bg-[#dbef67] text-black rounded-[25px] hover:bg-[#c9d95f] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Sparkles className={isAnalyzing ? "animate-spin" : ""} />
                Analizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*Modal*/}
      {isOpen ? (
        <section className="absolute top-0 left-0 w-full h-full bg-[#eaeaea20] z-50 text-white">
          <div className="relative bg-[#121212] w-[35%] h-full mx-auto inset-0 p-8">
            <header className="flex justify-between border-[#eaeaea20] border-b-1 pb-4">
              <div className="flex flex-col gap-2 ">
                <h3 className="text-3xl font-bold">Mejora el diagnóstico</h3>
                <span className="text-lg font-light">Complete la siguiente informacion</span>
              </div>
              <div>
                <button 
                className="hover:cursor-pointer"
                onClick={closed}>
                  <X />
                </button>
              </div>
            </header>
            
            {/** Contenido del modal*/}
            <div className="my-8 overflow-y-auto">
      

        {/* Genero */}
        <div className="mb-6">
          <label className="text-sm text-gray-300 block mb-2">Género de la mascota</label>
          <select
            value={petData.genero}
            onChange={(e) => setPetData({ genero: e.target.value as 'Macho' | 'Hembra' })}
            className="w-full bg-[#262626] border border-[#525252] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#dbef67] cursor-pointer"
          >
            <option value="">Seleccionar...</option>
            <option value="Macho">Macho</option>
            <option value="Hembra">Hembra</option>
          </select>
        </div>

        {/* Peso Aproximado */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-300">Peso Aproximado (kg) - Mascota</label>
          </div>
          <input
            type="text"
            placeholder="12 kg"
            value={petData.peso}
            onChange={(e) => setPetData({ peso: e.target.value })}
            className="w-full bg-[#262626] border border-[#525252] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#dbef67]"
          />
        </div>

        {/* Edad Aproximado */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-300">Edad Aproximado - Mascota</label>
          </div>
          <input
            type="text"
            placeholder="1 año con 3 meses"
            value={petData.edad}
            onChange={(e) => setPetData({ edad: e.target.value })}
            className="w-full bg-[#262626] border border-[#525252] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#dbef67]"
          />
        </div>

        {/*DNI  */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-300">DNI - Responsable</label>
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


            <footer className="flex justify-end">
              <div>
                <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-[#dbef67] text-black rounded-[25px] hover:bg-[#c9d95f] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Sparkles className={isAnalyzing ? "animate-spin" : ""} />
                {isAnalyzing ? "Analizando..." : "Continuar"}
              </button>
              </div>
            </footer>
          </div>
        </section>
      ) : null}
    </>
  );
}
