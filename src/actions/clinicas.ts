'use server'

export async function GetClinicas() {
    
    const res = await fetch(`${process.env.API_URL}/api/v1/stores`, {
        method: 'GET'
    })

    const data = await res.json();
    return data;
}