"use client";

import { useRef, useState } from "react";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { analizarMascotaConGemini } from "@/actions/conversations";
import { CreateHistories } from "@/actions/histories";
import { SearchUsers, CreateUsers } from "@/actions/user";
import UserNameModal from "@/components/modal/UserNameModal";

export default function Input() {
  // Estado para el modal de nombre de usuario
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState(false);

  // Estado para el modal de loading
  const [loadingSteps, setLoadingSteps] = useState<{message: string, completed: boolean}[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { focusedSection, setFocusedSection, petData } = useSettingsStore();
  const { prompt, setPrompt, images, isAnalyzing, setIsAnalyzing, language, setLanguage } =
    useAnalysisStore();
  const { addNotification } = useNotificationStore();

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

  // Helper para actualizar los pasos del loading
  const addLoadingStep = (message: string) => {
    setLoadingSteps(prev => [...prev, { message, completed: false }]);
  };

  const completeLoadingStep = () => {
    setLoadingSteps(prev => {
      const newSteps = [...prev];
      if (newSteps.length > 0) {
        newSteps[newSteps.length - 1].completed = true;
      }
      return newSteps;
    });
  };

  // Función para crear usuario cuando no existe
  const handleUserNameSubmit = async (name: string) => {
    try {
      console.log("📝 Creando nuevo usuario...");

      const createResult = await CreateUsers({
        dni: parseInt(petData.dni),
        name: name
      });

      if (!createResult.meta.status) {
        addNotification({
          type: "error",
          message: `Error al crear usuario: ${createResult.meta.message}`,
          duration: 7000,
        });
        setIsUserModalOpen(false);
        setIsAnalyzing(false);
        return;
      }

      console.log("✅ Usuario creado exitosamente");
      addNotification({
        type: "success",
        message: "¡Usuario registrado exitosamente!",
        duration: 3000,
      });

      setIsUserModalOpen(false);

      // Continuar con el análisis
      if (pendingAnalysis) {
        await proceedWithAnalysis();
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
      addNotification({
        type: "error",
        message: "Error al crear usuario",
        duration: 7000,
      });
      setIsUserModalOpen(false);
      setIsAnalyzing(false);
    }
  };

  // Función para proceder con el análisis de Gemini
  const proceedWithAnalysis = async () => {
    try {
      // Paso 1: Preparando imágenes
      addLoadingStep("Preparando imágenes para análisis");
      await new Promise(resolve => setTimeout(resolve, 500));

      // Convertir las imágenes al formato requerido
      const imageInputs = images.map((img) => {
        const matches = img.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
          throw new Error("Formato de imagen inválido");
        }
        return {
          mimeType: matches[1],
          data: matches[2],
        };
      });
      completeLoadingStep();

      // Paso 2: Consultando clínicas disponibles
      addLoadingStep("Consultando clínicas veterinarias disponibles");
      await new Promise(resolve => setTimeout(resolve, 800));
      completeLoadingStep();

      // Paso 3: Enviando solicitud a Gemini
      addLoadingStep("Enviando solicitud a Gemini AI para análisis");
      const result = await analizarMascotaConGemini({
        descripcion: prompt,
        imagenes: imageInputs,
        petData: {
          genero: petData.genero,
          peso: petData.peso,
          edad: petData.edad,
          dni: petData.dni,
        },
        language: language,
      });
      completeLoadingStep();

      if ("error" in result) {
        addNotification({
          type: "error",
          message: result.error,
          duration: 7000,
        });
        console.error("Error en el análisis:", result.error);
        setIsAnalyzing(false);
        setLoadingSteps([]);
        return;
      }

      // Paso 4: Validando contexto de las imágenes
      addLoadingStep("Validando contexto de las imágenes");
      await new Promise(resolve => setTimeout(resolve, 500));

      // Validar si el contexto es válido
      if (!result.contexto_valido) {
        console.log("⚠️ Contexto inválido detectado");
        addNotification({
          type: "warning",
          message: `Las imágenes están fuera de contexto: ${result.mensaje_contexto}`,
          duration: 7000,
        });
        setIsAnalyzing(false);
        setPendingAnalysis(false);
        setLoadingSteps([]);
        return;
      }
      completeLoadingStep();

      console.log("\n✅ Análisis completado exitosamente");
      console.log("Ver consola del servidor para detalles completos");

      // Paso 5: Guardando en la base de datos
      addLoadingStep("Guardando diagnóstico en la base de datos");

      // Preparar datos para CreateHistories
      const historyData = {
        personDni: parseInt(petData.dni),
        animalName: petData.animalName,
        genderOfAnimal: petData.genero === "Macho" ? 0 : 1,
        averageWeight: parseFloat(petData.peso),
        averageAge: parseFloat(petData.edad),
        geminiResponse: JSON.stringify(result),
      };

      // Guardar en la base de datos
      console.log("📤 Enviando datos al servidor...");
      const historyResult = await CreateHistories(historyData);
      completeLoadingStep();

      if ("error" in historyResult) {
        console.error("❌ Error al guardar en la base de datos:", historyResult.error);
        addNotification({
          type: "error",
          message: `Error al guardar: ${historyResult.error}`,
          duration: 7000,
        });
        setIsAnalyzing(false);
        setLoadingSteps([]);
        return;
      }

      console.log("✅ Historial guardado en la base de datos exitosamente");

      // Obtener el código del historial
      const historyCode = historyResult.code;

      if (!historyCode) {
        console.error("❌ No se recibió el código del historial");
        addNotification({
          type: "error",
          message: "Error: No se pudo obtener el código del historial",
          duration: 7000,
        });
        setIsAnalyzing(false);
        setPendingAnalysis(false);
        setLoadingSteps([]);
        return;
      }

      console.log(`📋 Código del historial: ${historyCode}`);

      // Paso 6: Finalizando
      addLoadingStep("Preparando resultados");
      await new Promise(resolve => setTimeout(resolve, 800));
      completeLoadingStep();

      addNotification({
        type: "success",
        message: "¡Análisis completado y guardado exitosamente! Redirigiendo...",
        duration: 3000,
      });

      // Redirigir a la página de diagnóstico con el código y DNI
      setTimeout(() => {
        setIsAnalyzing(false);
        setPendingAnalysis(false);
        setLoadingSteps([]);
        window.location.href = `/diagnostico?code=${historyCode}&dni=${petData.dni}`;
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      addNotification({
        type: "error",
        message: `Error al analizar: ${errorMessage}`,
        duration: 7000,
      });
      console.error("Error al analizar:", err);
      setIsAnalyzing(false);
      setPendingAnalysis(false);
      setLoadingSteps([]);
    }
  };

  const handleAnalyze = async () => {
    // Validar campos vacíos
    const camposFaltantes: string[] = [];

    if (!prompt.trim()) {
      camposFaltantes.push("Descripción de los síntomas");
    }

    if (images.length === 0) {
      camposFaltantes.push("Añade una imagen");
    }

    if (!petData.animalName.trim()) {
      camposFaltantes.push("Nombre de la mascota");
    }

    if (!petData.genero) {
      camposFaltantes.push("Género de la mascota");
    }

    if (!petData.peso.trim()) {
      camposFaltantes.push("Peso de la mascota");
    } else {
      const pesoNum = parseFloat(petData.peso);
      if (isNaN(pesoNum) || pesoNum <= 0) {
        camposFaltantes.push("Peso de la mascota (debe ser un número válido mayor a 0)");
      }
    }

    if (!petData.edad.trim()) {
      camposFaltantes.push("Edad de la mascota");
    } else {
      const edadNum = parseFloat(petData.edad);
      if (isNaN(edadNum) || edadNum <= 0) {
        camposFaltantes.push("Edad de la mascota (debe ser un número válido mayor a 0)");
      }
    }

    if (!petData.dni.trim()) {
      camposFaltantes.push("DNI del responsable");
    } else {
      const dniNum = petData.dni.trim();
      if (!/^\d{8}$/.test(dniNum)) {
        camposFaltantes.push("DNI del responsable (debe tener exactamente 8 dígitos)");
      }
    }

    // Si hay campos faltantes, mostrar notificación
    if (camposFaltantes.length > 0) {
      let mensaje = "";

      if (camposFaltantes.length === 1) {
        mensaje = `Por favor completa el campo: <strong>${camposFaltantes[0]}</strong>`;
      } else {
        mensaje = `Por favor completa los siguientes campos:<ul class="list-disc ml-4 mt-2">`;
        camposFaltantes.forEach((campo) => {
          mensaje += `<li>${campo}</li>`;
        });
        mensaje += `</ul>`;
      }

      addNotification({
        type: "warning",
        message: mensaje,
        duration: 7000,
      });
      return;
    }

    setIsAnalyzing(true);
    setLoadingSteps([]);

    try {
      // PASO 1: Validar si el usuario existe
      addLoadingStep("Verificando usuario en el sistema");
      console.log("🔍 Validando usuario...");
      const userSearch = await SearchUsers(parseInt(petData.dni));

      if (!userSearch.meta.status) {
        // Usuario no existe, abrir modal para pedir nombre
        console.log("⚠️ Usuario no encontrado, solicitando registro...");
        setPendingAnalysis(true);
        setIsUserModalOpen(true);
        setLoadingSteps([]);
        return; // El flujo continuará después de que el usuario ingrese su nombre
      }

      completeLoadingStep();

      // Usuario existe, continuar con el análisis
      console.log("✅ Usuario encontrado:", userSearch.user?.name);
      addNotification({
        type: "info",
        message: `Bienvenido de nuevo, ${userSearch.user?.name}`,
        duration: 3000,
      });

      // Proceder con el análisis
      await proceedWithAnalysis();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      addNotification({
        type: "error",
        message: `Error: ${errorMessage}`,
        duration: 7000,
      });
      console.error("Error:", err);
      setIsAnalyzing(false);
      setLoadingSteps([]);
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
        className={`transition-all duration-500 ease-in-out min-h-[250px] md:min-h-0 ${getFlexClass()}`}
      >
        <div className="border-gray-300 border-1 rounded-[15px] bg-gray-100 h-full flex flex-col overflow-hidden text-black">
          <textarea
            ref={textareaRef}
            onFocus={handleFocus}
            value={prompt}
            onChange={handleTextareaChange}
            className={`flex-1 w-full px-4 md:px-6 resize-none focus:outline-none text-base md:text-lg lg:text-xl bg-transparent transition-all duration-500 ${
              isContracted ? "py-2 overflow-hidden whitespace-nowrap" : "py-3 md:py-4"
            }`}
            placeholder="Describe los sintomas o malestares de tu mascota..."
            rows={2}
            disabled={isAnalyzing}
            style={{ overflow: "hidden" }}
          />

          <div
            className={`p-3 md:p-4 lg:p-5 flex flex-col gap-2 flex-shrink-0 transition-all duration-500 ${
              isContracted ? "h-0 p-0 opacity-0" : "opacity-100"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Modelo</span>
                <span className="text-xs md:text-sm">Gemini</span>

                {/* Selector de idioma */}
                <div className="flex items-center gap-1 border border-gray-300 rounded-md px-2 py-1">
                  <span className="text-xs text-gray-500">Idioma:</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'español' | 'english' | 'quechua')}
                    disabled={isAnalyzing}
                    className="text-xs bg-transparent focus:outline-none cursor-pointer disabled:cursor-not-allowed text-gray-900"
                  >
                    <option value="español">Español</option>
                    <option value="english">English</option>
                    <option value="quechua">Quechua</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-3 md:px-4 py-2 bg-purple-600 text-white rounded-[25px] hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap text-sm md:text-base"
              >
                <Sparkles className={isAnalyzing ? "animate-spin" : ""} />
                {isAnalyzing ? "Analizando..." : "Analizar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para registro de usuario */}
      <UserNameModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setIsAnalyzing(false);
          setPendingAnalysis(false);
        }}
        onSubmit={handleUserNameSubmit}
        dni={petData.dni}
      />

      {/* Modal de Loading */}
      {isAnalyzing && !isUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-md w-full p-4 md:p-6 lg:p-8">
            {/* Icono de loading girando */}
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="relative">
                <Loader2 className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-purple-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Título */}
            <h3 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-2">
              Analizando
            </h3>
            <p className="text-center text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
              Por favor espera mientras procesamos la información
            </p>

            {/* Lista de pasos */}
            <div className="space-y-4">
              {loadingSteps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 transition-all duration-300 ${
                    step.completed ? "opacity-100" : "opacity-70"
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                    )}
                  </div>
                  <p
                    className={`text-sm ${
                      step.completed ? "text-gray-600 line-through" : "text-gray-900 font-medium"
                    }`}
                  >
                    {step.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Barra de progreso animada */}
            <div className="mt-8">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-purple-400 h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${(loadingSteps.filter(s => s.completed).length / Math.max(loadingSteps.length, 1)) * 100}%`,
                  }}
                />
              </div>
              <p className="text-center text-xs text-gray-500 mt-2">
                {loadingSteps.filter(s => s.completed).length} de {loadingSteps.length} completados
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
