// server/src/utils/sessionManager.ts

// Simple in-memory store for sessionId -> { terraUserId, timestamp }
// NOTE: This is NOT suitable for production. Data is lost on server restart.
const sessionStore: Record<string, { terraUserId: string | null, timestamp: number }> = {};
// const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // No longer needed

/**
 * Initializes a new session or updates the timestamp of an existing one.
 * @param sessionId The session ID.
 */
export function initializeSession(sessionId: string): void {
    sessionStore[sessionId] = { terraUserId: null, timestamp: Date.now() };
    console.log(`Session Manager: Initialized session ${sessionId}`);
}

/**
 * Stores the Terra User ID associated with a session.
 * Updates the timestamp.
 * @param sessionId The session ID.
 * @param terraUserId The Terra User ID.
 */
export function storeTerraUserId(sessionId: string, terraUserId: string): void {
    if (!sessionStore[sessionId]) {
        initializeSession(sessionId);
    }
    sessionStore[sessionId].terraUserId = terraUserId;
    sessionStore[sessionId].timestamp = Date.now(); // Update timestamp on activity
    console.log(`Session Manager: Stored Terra User ID for session ${sessionId}`);
}

/**
 * Retrieves the Terra User ID for a given session ID.
 * Returns null if the session doesn't exist.
 * Updates the timestamp if accessed.
 * @param sessionId The session ID.
 * @returns The Terra User ID or null.
 */
export function getTerraUserId(sessionId: string): string | null {
    const session = sessionStore[sessionId];
    if (!session) {
        console.warn(`Session Manager: Session ${sessionId} not found.`);
        return null;
    }
    // Removed expiration check
    session.timestamp = Date.now(); // Update timestamp on access
    return session.terraUserId;
}

// Removed deleteSession function

// Removed cleanupExpiredSessions function and setInterval call

console.log('Session Manager initialized.'); // Log initialization 