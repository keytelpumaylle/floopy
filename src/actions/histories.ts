'use server'

interface HistoryData {
  personDni: number;
  animalName: string;
  genderOfAnimal: number;
  averageWeight: number;
  averageAge: number;
  geminiResponse: string;
}

interface HistoryResponse {
  meta: {
    status: boolean;
    message: string;
  };
  history?: {
    code: string;
    personDni: number;
    animalName: string;
    genderOfAnimal: number;
    averageWeight: number;
    averageAge: number;
    geminiResponse: string;
    createdOn: string;
  };
}

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

interface DniHistoriesResponse {
  meta: {
    status: boolean;
    message: string;
  };
  history?: HistoryItem[];
}

export async function CreateHistories(historyData: HistoryData) {
    try {
        console.log('Enviando datos al backend:', historyData);

        const res = await fetch(`${process.env.API_URL}/api/v1/histories`, {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(historyData),
        })

        console.log('Response status:', res.status);
        console.log('Response headers:', res.headers);

        // Obtener el texto de la respuesta primero
        const responseText = await res.text();
        console.log('Response text:', responseText);

        if (!res.ok) {
            // Intentar parsear el error si hay contenido
            let errorData;
            try {
                errorData = responseText ? JSON.parse(responseText) : { message: 'Error sin respuesta del servidor' };
            } catch {
                errorData = { message: responseText || 'Error al crear el historial' };
            }
            console.error('Error al crear historial:', errorData);
            return { error: errorData.message || errorData.error || 'Error al crear el historial' };
        }

        // Intentar parsear la respuesta exitosa
        let data;
        try {
            data = responseText ? JSON.parse(responseText) : { success: true };
        } catch (parseError) {
            console.error('Error al parsear respuesta exitosa:', parseError);
            return { error: 'Error al procesar la respuesta del servidor' };
        }

        console.log('✅ Historial creado exitosamente:', data);
        return data;
    } catch (error) {
        console.error('❌ Error en CreateHistories:', error);
        return { error: error instanceof Error ? error.message : 'Error desconocido' };
    }
}

export async function GetHistories(code: string, dni: number | string): Promise<HistoryResponse> {
    try {
        console.log(`🔍 Obteniendo historial con código: ${code} y DNI: ${dni}`);

        const res = await fetch(`${process.env.API_URL}/api/v1/histories/${code}/user/${dni}`, {
            method: 'GET'
        })

        const responseText = await res.text();
        let data: HistoryResponse;

        try {
            data = responseText ? JSON.parse(responseText) : { meta: { status: false, message: 'Sin respuesta del servidor' } };
        } catch {
            data = { meta: { status: false, message: 'Error al procesar respuesta' } };
        }

        if (!data.meta.status) {
            console.error('❌ Error al obtener historial:', data.meta.message);
            return data;
        }

        console.log('✅ Historial obtenido exitosamente:', data);
        return data;
    } catch (error) {
        console.error('❌ Error en GetHistories:', error);
        return {
            meta: {
                status: false,
                message: error instanceof Error ? error.message : 'Error al obtener historial'
            }
        };
    }
}

export async function GetDniHistories(dni: number | string): Promise<DniHistoriesResponse> {
    try {
        console.log(`🔍 Obteniendo historiales del DNI: ${dni}`);

        const res = await fetch(`${process.env.API_URL}/api/v1/histories/user/${dni}`, {
            method: 'GET',
        })

        const responseText = await res.text();
        let data: DniHistoriesResponse;

        try {
            data = responseText ? JSON.parse(responseText) : { meta: { status: false, message: 'Sin respuesta del servidor' } };
        } catch {
            data = { meta: { status: false, message: 'Error al procesar respuesta' } };
        }

        if (!data.meta.status) {
            console.error('❌ Error al obtener historiales:', data.meta.message);
            return data;
        }

        console.log('✅ Historiales obtenidos exitosamente:', data.history?.length || 0, 'registros');
        return data;
    } catch (error) {
        console.error('❌ Error en GetDniHistories:', error);
        return {
            meta: {
                status: false,
                message: error instanceof Error ? error.message : 'Error al obtener historiales'
            }
        };
    }
}