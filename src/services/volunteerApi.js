/**
 * Volunteer Management API Service
 * Handles all volunteer scheduling and roster management API calls
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Helper function for authenticated API calls
 */
const fetchWithToken = async (url, token, options = {}) => {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return response.json();
};

// ============================================
// VOLUNTEER ROSTER APIs
// ============================================

/**
 * Get all volunteers with optional filters
 */
export const getAllVolunteers = async (token, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.cohort) params.append('cohort', filters.cohort);
    if (filters.activeOnly !== undefined) params.append('activeOnly', filters.activeOnly);

    const url = `${API_URL}/api/volunteers${params.toString() ? `?${params}` : ''}`;
    return fetchWithToken(url, token);
};

/**
 * Get a single volunteer profile
 */
export const getVolunteerById = async (userId, token) => {
    return fetchWithToken(`${API_URL}/api/volunteers/${userId}`, token);
};

/**
 * Update volunteer profile
 */
export const updateVolunteerProfile = async (userId, profileData, token) => {
    return fetchWithToken(`${API_URL}/api/volunteers/${userId}`, token, {
        method: 'PUT',
        body: JSON.stringify(profileData),
    });
};

/**
 * Get all cohorts with volunteer counts
 */
export const getAllCohorts = async (token) => {
    return fetchWithToken(`${API_URL}/api/volunteers/cohorts`, token);
};

/**
 * Get volunteers for a specific cohort
 */
export const getVolunteersByCohort = async (cohortName, token) => {
    return fetchWithToken(`${API_URL}/api/volunteers/cohort/${encodeURIComponent(cohortName)}`, token);
};

/**
 * Assign volunteer to cohort
 */
export const assignVolunteerToCohort = async (userId, cohortName, notes, token) => {
    return fetchWithToken(`${API_URL}/api/volunteers/cohort-assign`, token, {
        method: 'POST',
        body: JSON.stringify({ userId, cohortName, notes }),
    });
};

/**
 * Remove volunteer from cohort
 */
export const removeVolunteerFromCohort = async (userId, cohortName, token) => {
    return fetchWithToken(`${API_URL}/api/volunteers/cohort-assign`, token, {
        method: 'DELETE',
        body: JSON.stringify({ userId, cohortName }),
    });
};

/**
 * Update volunteer status
 */
export const updateVolunteerStatus = async (userId, status, token) => {
    return fetchWithToken(`${API_URL}/api/volunteers/${userId}/status`, token, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
};

/**
 * Auto-assign volunteer to matching open slots based on their availability
 */
export const autoAssignVolunteer = async (userId, token) => {
    return fetchWithToken(`${API_URL}/api/volunteers/${userId}/auto-assign`, token, {
        method: 'POST',
    });
};

// ============================================
// VOLUNTEER SLOTS APIs
// ============================================

/**
 * Get slots by date range
 */
export const getSlotsByDateRange = async (startDate, endDate, cohort, token) => {
    const params = new URLSearchParams({ startDate, endDate });
    if (cohort) params.append('cohort', cohort);

    return fetchWithToken(`${API_URL}/api/volunteer-slots?${params}`, token);
};

/**
 * Get weekly roster for a cohort
 */
export const getWeeklyRoster = async (cohort, weekStartDate, token) => {
    return fetchWithToken(
        `${API_URL}/api/volunteer-slots/weekly/${encodeURIComponent(cohort)}/${weekStartDate}`,
        token
    );
};

/**
 * Get slot fill status summary
 */
export const getSlotFillStatus = async (startDate, endDate, cohort, token) => {
    const params = new URLSearchParams({ startDate, endDate });
    if (cohort) params.append('cohort', cohort);

    return fetchWithToken(`${API_URL}/api/volunteer-slots/fill-status?${params}`, token);
};

/**
 * Get current user's volunteer assignments
 */
export const getMyAssignments = async (startDate, endDate, token) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const url = `${API_URL}/api/volunteer-slots/my-assignments${params.toString() ? `?${params}` : ''}`;
    return fetchWithToken(url, token);
};

/**
 * Get a single slot by ID
 */
export const getSlotById = async (slotId, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-slots/${slotId}`, token);
};

/**
 * Create a new slot
 */
export const createSlot = async (slotData, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-slots`, token, {
        method: 'POST',
        body: JSON.stringify(slotData),
    });
};

/**
 * Update a slot
 */
export const updateSlot = async (slotId, slotData, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-slots/${slotId}`, token, {
        method: 'PUT',
        body: JSON.stringify(slotData),
    });
};

/**
 * Delete a slot
 */
export const deleteSlot = async (slotId, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-slots/${slotId}`, token, {
        method: 'DELETE',
    });
};

/**
 * Generate slots from curriculum
 */
export const generateSlotsFromCurriculum = async (cohortName, volunteersPerSlot, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-slots/generate`, token, {
        method: 'POST',
        body: JSON.stringify({ cohortName, volunteersPerSlot }),
    });
};

/**
 * Assign volunteer to slot
 */
export const assignVolunteerToSlot = async (slotId, userId, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-slots/${slotId}/assign`, token, {
        method: 'POST',
        body: JSON.stringify({ userId }),
    });
};

/**
 * Remove volunteer from slot
 */
export const removeVolunteerFromSlot = async (slotId, userId, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-slots/${slotId}/assign`, token, {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
    });
};

/**
 * Confirm a slot assignment
 */
export const confirmSlot = async (slotId, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-slots/${slotId}/confirm`, token, {
        method: 'POST',
    });
};

// ============================================
// VOLUNTEER ATTENDANCE APIs
// ============================================

/**
 * Log attendance for a slot
 */
export const logAttendance = async (slotId, volunteerUserId, status, notes, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-attendance/${slotId}`, token, {
        method: 'POST',
        body: JSON.stringify({ volunteerUserId, status, notes }),
    });
};

/**
 * Bulk update attendance
 */
export const bulkUpdateAttendance = async (attendanceUpdates, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-attendance/bulk`, token, {
        method: 'POST',
        body: JSON.stringify({ attendanceUpdates }),
    });
};

/**
 * Get attendance for a slot
 */
export const getAttendanceBySlot = async (slotId, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-attendance/slot/${slotId}`, token);
};

/**
 * Get attendance history for a volunteer
 */
export const getVolunteerAttendanceHistory = async (userId, startDate, endDate, token) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const url = `${API_URL}/api/volunteer-attendance/volunteer/${userId}${params.toString() ? `?${params}` : ''}`;
    return fetchWithToken(url, token);
};

/**
 * Get attendance summary
 */
export const getAttendanceSummary = async (startDate, endDate, cohort, token) => {
    const params = new URLSearchParams({ startDate, endDate });
    if (cohort) params.append('cohort', cohort);

    return fetchWithToken(`${API_URL}/api/volunteer-attendance/summary?${params}`, token);
};

/**
 * Get per-volunteer attendance stats
 */
export const getAttendanceStats = async (startDate, endDate, cohort, token) => {
    const params = new URLSearchParams({ startDate, endDate });
    if (cohort) params.append('cohort', cohort);

    return fetchWithToken(`${API_URL}/api/volunteer-attendance/stats?${params}`, token);
};

/**
 * Get slots for a specific date (for attendance logging)
 */
export const getSlotsForDate = async (date, cohort, token) => {
    const params = new URLSearchParams();
    if (cohort) params.append('cohort', cohort);

    const url = `${API_URL}/api/volunteer-attendance/date/${date}${params.toString() ? `?${params}` : ''}`;
    return fetchWithToken(url, token);
};

/**
 * Cancel attendance with reason
 */
export const cancelAttendance = async (slotId, volunteerUserId, reason, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-attendance/${slotId}/cancel`, token, {
        method: 'PUT',
        body: JSON.stringify({ volunteerUserId, reason }),
    });
};

/**
 * Add session feedback
 */
export const addSessionFeedback = async (attendanceId, rating, notes, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-attendance/${attendanceId}/feedback`, token, {
        method: 'PUT',
        body: JSON.stringify({ rating, notes }),
    });
};

// ============================================
// VOLUNTEER SELF-CHECK-IN APIs
// ============================================

/**
 * Get today's assigned slot for the logged-in volunteer
 */
export const getMyTodaySlot = async (token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-attendance/my-slot`, token);
};

/**
 * Self check-in with photo capture
 */
export const selfCheckIn = async (photoData, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-attendance/self-checkin`, token, {
        method: 'POST',
        body: JSON.stringify({ photoData }),
    });
};

/**
 * Get today's volunteer attendance (staff view)
 */
export const getTodaysVolunteerAttendance = async (cohort, token) => {
    const params = new URLSearchParams();
    if (cohort) params.append('cohort', cohort);

    const url = `${API_URL}/api/volunteer-attendance/today${params.toString() ? `?${params}` : ''}`;
    return fetchWithToken(url, token);
};

/**
 * Get feedback for a specific user (admin/staff only)
 */
export const getFeedbackByUserId = async (userId, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-feedback/user/${userId}`, token);
};

// ============================================
// VOLUNTEER SELF-SERVICE APIs
// ============================================

/**
 * Get volunteer slots for a date range (for calendar display)
 */
export const getVolunteerSlots = async (startDate, endDate, token) => {
    const params = new URLSearchParams({ startDate, endDate });
    return fetchWithToken(`${API_URL}/api/volunteer-slots?${params}`, token);
};

/**
 * Get volunteer profile (for self-view)
 */
export const getVolunteerProfile = async (userId, token) => {
    return fetchWithToken(`${API_URL}/api/volunteers/${userId}`, token);
};

/**
 * Sign up for an open slot (volunteer self-service)
 */
export const signUpForSlot = async (slotId, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-slots/${slotId}/self-assign`, token, {
        method: 'POST',
    });
};

/**
 * Cancel/remove self from a slot (volunteer self-service)
 */
export const cancelSlot = async (slotId, token) => {
    return fetchWithToken(`${API_URL}/api/volunteer-slots/${slotId}/self-remove`, token, {
        method: 'DELETE',
    });
};

export default {
    // Roster
    getAllVolunteers,
    getVolunteerById,
    updateVolunteerProfile,
    getAllCohorts,
    getVolunteersByCohort,
    assignVolunteerToCohort,
    removeVolunteerFromCohort,
    updateVolunteerStatus,
    // Feedback
    getFeedbackByUserId,
    // Slots
    getSlotsByDateRange,
    getWeeklyRoster,
    getSlotFillStatus,
    getMyAssignments,
    getSlotById,
    createSlot,
    updateSlot,
    deleteSlot,
    generateSlotsFromCurriculum,
    assignVolunteerToSlot,
    removeVolunteerFromSlot,
    confirmSlot,
    // Attendance
    logAttendance,
    bulkUpdateAttendance,
    getAttendanceBySlot,
    getVolunteerAttendanceHistory,
    getAttendanceSummary,
    getAttendanceStats,
    getSlotsForDate,
    cancelAttendance,
    addSessionFeedback,
    // Self Check-In
    getMyTodaySlot,
    selfCheckIn,
    getTodaysVolunteerAttendance,
};
