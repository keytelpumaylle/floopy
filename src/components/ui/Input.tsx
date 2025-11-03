"use client";

import { useRef, useState } from "react";
import { Sparkles } from "lucide-react";
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { focusedSection, setFocusedSection, petData } = useSettingsStore();
  const { prompt, setPrompt, images, isAnalyzing, setIsAnalyzing } =
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
        addNotification({
          type: "error",
          message: result.error,
          duration: 7000,
        });
        console.error("Error en el análisis:", result.error);
        setIsAnalyzing(false);
        return;
      }

      console.log("\n✅ Análisis completado exitosamente");
      console.log("Ver consola del servidor para detalles completos");

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

      if ("error" in historyResult) {
        console.error("❌ Error al guardar en la base de datos:", historyResult.error);
        addNotification({
          type: "error",
          message: `Error al guardar: ${historyResult.error}`,
          duration: 7000,
        });
        setIsAnalyzing(false);
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
        return;
      }

      console.log(`📋 Código del historial: ${historyCode}`);

      addNotification({
        type: "success",
        message: "¡Análisis completado y guardado exitosamente! Redirigiendo...",
        duration: 3000,
      });

      setIsAnalyzing(false);
      setPendingAnalysis(false);

      // Redirigir a la página de diagnóstico con el código y DNI
      setTimeout(() => {
        window.location.href = `/diagnostico?code=${historyCode}&dni=${petData.dni}`;
      }, 1000);
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

    try {
      // PASO 1: Validar si el usuario existe
      console.log("🔍 Validando usuario...");
      const userSearch = await SearchUsers(parseInt(petData.dni));

      if (!userSearch.meta.status) {
        // Usuario no existe, abrir modal para pedir nombre
        console.log("⚠️ Usuario no encontrado, solicitando registro...");
        setPendingAnalysis(true);
        setIsUserModalOpen(true);
        return; // El flujo continuará después de que el usuario ingrese su nombre
      }

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
        <div className="border-[#525252] border-1 rounded-[15px] bg-[#141414] h-full flex flex-col overflow-hidden">
          <textarea
            ref={textareaRef}
            onFocus={handleFocus}
            value={prompt}
            onChange={handleTextareaChange}
            className={`flex-1 w-full px-6 resize-none focus:outline-none text-xl bg-transparent transition-all duration-500 ${
              isContracted ? "py-2 overflow-hidden whitespace-nowrap" : "py-4"
            }`}
            placeholder="Describe los sintomas o malestares de tu mascota..."
            rows={2}
            disabled={isAnalyzing}
            style={{ overflow: "hidden" }}
          />

          <div
            className={`p-5 flex flex-col gap-2 flex-shrink-0 transition-all duration-500 ${
              isContracted ? "h-0 p-0 opacity-0" : "opacity-100"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Modelo</span>
                <span className="text-sm">Gemini</span>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-[#dbef67] text-black rounded-[25px] hover:bg-[#c9d95f] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
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
    </>
  );
}
