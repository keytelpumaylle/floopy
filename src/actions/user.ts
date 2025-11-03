'use server'

interface UserResponse {
    meta: {
        status: boolean;
        message: string;
    };
    user?: {
        dni: number;
        name: string;
    };
}

interface UserData {
    dni: number;
    name: string;
}

export async function SearchUsers(dni: number | string): Promise<UserResponse> {
    try {
        console.log(`🔍 Buscando usuario con DNI: ${dni}`);

        const res = await fetch(`${process.env.API_URL}/api/v1/users/${dni}`, {
            method: 'GET'
        })

        const responseText = await res.text();
        let data: UserResponse;

        try {
            data = responseText ? JSON.parse(responseText) : { meta: { status: false, message: 'Sin respuesta del servidor' } };
        } catch {
            data = { meta: { status: false, message: 'Error al procesar respuesta' } };
        }

        console.log('Resultado de búsqueda:', data);
        return data;
    } catch (error) {
        console.error('❌ Error en SearchUsers:', error);
        return {
            meta: {
                status: false,
                message: error instanceof Error ? error.message : 'Error al buscar usuario'
            }
        };
    }
}

export async function CreateUsers(userData: UserData): Promise<UserResponse> {
    try {
        console.log('📝 Creando usuario:', userData);

        const res = await fetch(`${process.env.API_URL}/api/v1/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dni: userData.dni,
                name: userData.name,
            })
        })

        const responseText = await res.text();
        let data: UserResponse;

        try {
            data = responseText ? JSON.parse(responseText) : { meta: { status: false, message: 'Sin respuesta del servidor' } };
        } catch {
            data = { meta: { status: false, message: 'Error al procesar respuesta' } };
        }

        console.log('✅ Usuario creado:', data);
        return data;
    } catch (error) {
        console.error('❌ Error en CreateUsers:', error);
        return {
            meta: {
                status: false,
                message: error instanceof Error ? error.message : 'Error al crear usuario'
            }
        };
    }
}