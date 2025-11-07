'use server'

export async function GetClinicas() {
    
    const res = await fetch(`${process.env.API_URL}/api/v1/stores`, {
        method: 'GET'
    })

    const data = await res.json();
    return data;
}

export async function GetSpecialties(id: string) {
    const res = await fetch(`${process.env.API_URL}/api/v1/stores/${id}/specialties`, {
        method: 'GET'
    })

    const data = await res.json();
    return data;
}

export async function GetMedications(id: string) {
    const res = await fetch(`${process.env.API_URL}/api/v1/stores/${id}/medications`, {
        method: 'GET'
    })

    const data = await res.json();
    return data;
}