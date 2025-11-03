"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";
import promptConfig from "./prompt.json";

// Tipos TypeScript basados en el schema del prompt
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

interface GeminiResponse {
  analisis_visual_resumen: string;
  lista_hallazgos: Hallazgo[];
  diagnostico_sugerido: DiagnosticoSugerido;
  advertencia_legal: string;
  codigo_consulta?: string;
}

interface ErrorResponse {
  error: string;
}

type ApiResponse = GeminiResponse | ErrorResponse;

// Tipos para los datos de entrada
interface PetDataInput {
  genero: string;
  peso: string;
  edad: string;
  dni: string;
}

interface ImageInput {
  mimeType: string;
  data: string;
}

interface AnalysisInput {
  descripcion: string;
  imagenes: ImageInput[];
  petData: PetDataInput;
}

// Verificar que el TOKEN esté disponible
const API_KEY = process.env.GEMINI_TOKEN;
if (!API_KEY) {
  console.error("❌ ERROR: TOKEN no encontrado en variables de entorno");
  throw new Error("TOKEN no configurado en .env.local");
}

// Inicializar Gemini AI con la configuración del prompt
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: promptConfig.config.response_mime_type,
    responseSchema: promptConfig.config.response_schema as Schema,
  },
  systemInstruction: promptConfig.config.system_instruction,
});

export async function analizarMascotaConGemini(
  input: AnalysisInput
): Promise<ApiResponse> {
  const { descripcion, imagenes, petData } = input;
  try {
    console.log("\n=== INICIANDO ANÁLISIS CON GEMINI ===");
    console.log("Descripción del usuario:", descripcion);
    console.log("Número de imágenes:", imagenes.length);
    console.log("Datos de la mascota:");
    console.log("  - Género:", petData.genero || "No especificado");
    console.log("  - Peso:", petData.peso || "No especificado");
    console.log("  - Edad:", petData.edad || "No especificado");
    console.log("=====================================\n");

    // Construir el contexto adicional con los datos de la mascota
    let contextoPet = "";
    if (petData.genero || petData.peso || petData.edad) {
      contextoPet = "\n\nDatos adicionales de la mascota:";
      if (petData.genero) contextoPet += `\n- Género: ${petData.genero}`;
      if (petData.peso) contextoPet += `\n- Peso: ${petData.peso}`;
      if (petData.edad) contextoPet += `\n- Edad: ${petData.edad}`;
    }

    // Construir el contenido para enviar a Gemini
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      {
        text: "Analiza las imágenes proporcionadas. Identifica cualquier síntoma visible, anomalía o indicio de enfermedad en el animal. Basándote en el análisis visual, la descripción del usuario y los datos de la mascota, proporciona un análisis veterinario completo.",
      },
    ];

    // Agregar imágenes si existen
    if (imagenes && imagenes.length > 0) {
      console.log("Agregando imágenes al análisis...");
      imagenes.forEach((imagen, index) => {
        parts.push({
          inlineData: {
            mimeType: imagen.mimeType,
            data: imagen.data,
          },
        });
        console.log(`  ✓ Imagen ${index + 1} agregada (${imagen.mimeType})`);
      });
    }

    // Agregar la descripción del usuario con los datos de la mascota
    parts.push({
      text: `Descripción del usuario: ${descripcion}${contextoPet}`,
    });

    console.log("\nEnviando solicitud a Gemini...");

    // Enviar el contenido a Gemini
    const response = await model.generateContent(parts);
    const apiResponse = await response.response;

    console.log("\n=== RESPUESTA RECIBIDA DE GEMINI ===");

    // Validar que existan candidatos en la respuesta
    if (!apiResponse.candidates || apiResponse.candidates.length === 0) {
      console.error("❌ Error: No se recibieron candidatos en la respuesta");
      return { error: "No se pudo obtener una respuesta de la API." };
    }

    const content = apiResponse.candidates[0].content;

    // Validar contenido
    if (!content || !content.parts || content.parts.length === 0) {
      console.error("❌ Error: La respuesta no contiene contenido válido");
      return {
        error: "La respuesta de la API está vacía o tiene un formato incorrecto.",
      };
    }

    const responseText = content.parts[0]?.text || "";

    console.log("Respuesta raw de Gemini:");
    console.log(responseText);
    console.log("====================================\n");

    // Parsear la respuesta JSON
    let data: unknown;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error("❌ Error al parsear JSON:", error);
      console.error("Respuesta recibida:", responseText.substring(0, 500));
      return {
        error: `Error al parsear la respuesta JSON: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }

    // Validar estructura de la respuesta
    if (
      typeof data === "object" &&
      data !== null &&
      "analisis_visual_resumen" in data &&
      "lista_hallazgos" in data &&
      "diagnostico_sugerido" in data &&
      "advertencia_legal" in data
    ) {
      const geminiData = data as GeminiResponse;

      console.log("\n=== ANÁLISIS PROCESADO EXITOSAMENTE ===");
      console.log("\n📋 Resumen del análisis visual:");
      console.log(geminiData.analisis_visual_resumen);

      console.log("\n🔍 Lista de hallazgos:");
      geminiData.lista_hallazgos.forEach((hallazgo, index) => {
        console.log(`  ${index + 1}. ${hallazgo.hallazgo}`);
        console.log(`     Confianza: ${hallazgo.confianza_visual_porcentaje}%`);
        if (hallazgo.imagen_relevante) {
          console.log(`     Imagen relevante: ${hallazgo.imagen_relevante}`);
        }
      });

      console.log("\n🏥 Diagnóstico sugerido:");
      console.log(`  Enfermedad probable: ${geminiData.diagnostico_sugerido.enfermedad_probable}`);
      console.log(`  Confianza: ${geminiData.diagnostico_sugerido.confianza_diagnostico_porcentaje}%`);
      console.log(`  Recomendación: ${geminiData.diagnostico_sugerido.recomendacion_accion}`);

      console.log("\n⚠️  Advertencia legal:");
      console.log(geminiData.advertencia_legal);
      console.log("\n=======================================\n");

      return {
        ...geminiData
      };
    } else {
      console.error("❌ Error: Formato de respuesta inválido");
      console.error("Datos recibidos:", data);
      return {
        error: "La API no devolvió un objeto con el formato esperado.",
      };
    }
  } catch (error: unknown) {
    console.error("\n❌ ERROR AL LLAMAR A GEMINI:", error);
    return {
      error: `Error al llamar a la API: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}