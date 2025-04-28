// Functions to load data for components using React Router's loader API

/**
 * Loader function for getting data about a single event
 * This is used by the EventDetails component
 */
export const singleEventLoader = async ({ params }) => {
    try {
        const eventId = params.eventId;
        const response = await fetch(`http://localhost:8800/api/events/${eventId}`,{
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' // This is critical for sending cookies/session
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch event with ID: ${eventId}`);
        }

        const eventData = await response.json();
        return eventData;
    } catch (error) {
        console.error("Error loading event data:", error);
        return null;
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