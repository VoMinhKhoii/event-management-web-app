export const singleEventLoader = async ({request, params }) => {
    const eventId = params.id;
    const response = await fetch(`http://localhost:8800/api/event/${eventId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to fetch event data');
    }

    const data = await response.json();
    return data;
}