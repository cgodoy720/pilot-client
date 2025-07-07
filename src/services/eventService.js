const API_BASE_URL = 'http://localhost:7001/api/admissions-events';

class EventService {
    // Get all events with optional filters
    static async getEvents(filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.start_date) queryParams.append('start_date', filters.start_date);
        if (filters.end_date) queryParams.append('end_date', filters.end_date);

        const response = await fetch(`${API_BASE_URL}?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch events');
        return response.json();
    }

    // Get event by ID
    static async getEventById(eventId) {
        const response = await fetch(`${API_BASE_URL}/${eventId}`);
        if (!response.ok) throw new Error('Failed to fetch event');
        return response.json();
    }

    // Register for an event
    static async registerForEvent(eventId, userData) {
        const response = await fetch(`${API_BASE_URL}/${eventId}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error('Failed to register for event');
        return response.json();
    }

    // Get event registrations
    static async getEventRegistrations(eventId) {
        const response = await fetch(`${API_BASE_URL}/${eventId}/registrations`);
        if (!response.ok) throw new Error('Failed to fetch registrations');
        return response.json();
    }

    // Update registration status (for admins)
    static async updateRegistrationStatus(eventId, registrationId, status) {
        const response = await fetch(
            `${API_BASE_URL}/${eventId}/registrations/${registrationId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            }
        );
        if (!response.ok) throw new Error('Failed to update registration status');
        return response.json();
    }

    // Cancel registration
    static async cancelRegistration(eventId, registrationId) {
        const response = await fetch(
            `${API_BASE_URL}/${eventId}/registrations/${registrationId}`,
            {
                method: 'DELETE',
            }
        );
        if (!response.ok) throw new Error('Failed to cancel registration');
        return response.json();
    }

    // Create new event (admin only)
    static async createEvent(eventData) {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        });
        if (!response.ok) throw new Error('Failed to create event');
        return response.json();
    }

    // Update event (admin only)
    static async updateEvent(eventId, eventData) {
        const response = await fetch(`${API_BASE_URL}/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        });
        if (!response.ok) throw new Error('Failed to update event');
        return response.json();
    }

    // Delete event (admin only)
    static async deleteEvent(eventId) {
        const response = await fetch(`${API_BASE_URL}/${eventId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete event');
        return response.json();
    }

    // Cancel event (admin only)
    static async cancelEvent(eventId, reason = '') {
        const response = await fetch(`${API_BASE_URL}/${eventId}/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reason }),
        });
        if (!response.ok) throw new Error('Failed to cancel event');
        return response.json();
    }

    // Reschedule event (admin only)
    static async rescheduleEvent(eventId, newStartTime, newEndTime, reason = '') {
        const response = await fetch(`${API_BASE_URL}/${eventId}/reschedule`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                start_time: newStartTime,
                end_time: newEndTime,
                reason 
            }),
        });
        if (!response.ok) throw new Error('Failed to reschedule event');
        return response.json();
    }
}

export default EventService; 