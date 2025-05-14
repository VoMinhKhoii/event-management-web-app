// Functions to load data for components using React Router's loader API

/**
 * Loader function for getting data about a single event
 * This is used by the EventDetails component
 */
export const singleEventLoader = async ({ params }) => {
    try {
        const eventId = params.id;

        const eventResponse = await fetch(`http://localhost:8800/api/events/${eventId}`,{
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' // This is critical for sending cookies/session
        });

        if (!eventResponse.ok) {
            if (eventResponse.status === 404) {
                throw new Response('Event not found', { status: 404 });
            }
            throw new Error(`Failed to fetch event with ID: ${eventId}, Status: ${eventResponse.status}`);
        }

        const eventData = await eventResponse.json();

        if (eventData && !eventData.publicity) {
            try {
                const [invitationsRes, requestsRes] = await Promise.all([
                    fetch(`${apiBaseUrl}/${eventId}/invitations-get`, { credentials: 'include' }),
                    fetch(`${apiBaseUrl}/${eventId}/requests-get`, { credentials: 'include' })
                ]);

                if (invitationsRes.ok) {
                    const invitationsData = await invitationsRes.json();
                    eventData.invitations = invitationsData.invitations || [];
                } else {
                    console.warn(`Loader: Failed to fetch invitations for private event ${eventId}, Status: ${invitationsRes.status}`);
                    eventData.invitations = [];
                }

                if (requestsRes.ok) {
                    const requestsData = await requestsRes.json();
                    eventData.requests = requestsData.requests || [];
                } else {
                    console.warn(`Loader: Failed to fetch requests for private event ${eventId}, Status: ${requestsRes.status}`);
                    eventData.requests = [];
                }
            } catch (accessErr) {
                console.error(`Loader: Error fetching invitations/requests for private event ${eventId}:`, accessErr);
                eventData.invitations = [];
                eventData.requests = [];
            }
        } else if (eventData) {
            eventData.invitations = eventData.invitations || [];
            eventData.requests = eventData.requests || [];
        }

        return eventData;
    } catch (error) {
        console.error('Error in singleEventLoader:', error);
        if (error instanceof Response) {
            throw error;
        }
        throw new Response('Error loading event details', { status: 500 });
    }
};

/**
 * Loader function for fetching comments for an event
 */
export const eventCommentsLoader = async ({ params }) => {
    try {
        const eventId = params.id;
        const response = await fetch(`/api/events/${eventId}/comments`);

        if (!response.ok) {
            throw new Error(`Failed to fetch comments for event with ID: ${eventId}`);
        }

        const comments = await response.json();
        return comments;
    } catch (error) {
        console.error("Error loading event comments:", error);
        return [];
    }
};

/**
 * Loader function for fetching event invitations (for organizers)
 */
export const eventInvitationsLoader = async ({ params }) => {
    try {
        const eventId = params.id;
        const response = await fetch(`/api/events/${eventId}/invitations`);

        if (!response.ok) {
            throw new Error(`Failed to fetch invitations for event with ID: ${eventId}`);
        }

        const invitations = await response.json();
        return invitations;
    } catch (error) {
        console.error("Error loading event invitations:", error);
        return [];
    }
};
