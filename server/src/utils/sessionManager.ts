// server/src/utils/sessionManager.ts

// Simple in-memory store for sessionId -> { timestamp, terraUserId? }
// NOTE: This is NOT suitable for production. Data is lost on server restart.
const sessionStore: Record<string, { timestamp: number; terraUserId?: string }> = {};

/**
 * Initializes a new session or updates the timestamp of an existing one.
 * @param sessionId The session ID.
 */
export function initializeSession(sessionId: string): void {
    sessionStore[sessionId] = { timestamp: Date.now() };
    console.log(`Session Manager: Initialized session ${sessionId}`);
}

/**
 * Checks if a session exists.
 * @param sessionId The session ID.
 * @returns True if the session exists, false otherwise.
 */
export function sessionExists(sessionId: string): boolean {
    const session = sessionStore[sessionId];
    if (!session) {
        console.warn(`Session Manager: Session ${sessionId} not found.`);
        return false;
    }
    session.timestamp = Date.now(); // Update timestamp on access
    return true;
}

/**
 * Sets Terra user ID for a session.
 * @param sessionId The session ID.
 * @param terraUserId The Terra user ID.
 */
export function setTerraUserId(sessionId: string, terraUserId: string): void {
    if (!sessionStore[sessionId]) {
        sessionStore[sessionId] = { timestamp: Date.now() };
    }
    sessionStore[sessionId].terraUserId = terraUserId;
    sessionStore[sessionId].timestamp = Date.now();
    console.log(`Session Manager: Set Terra user ID ${terraUserId} for session ${sessionId}`);
}

/**
 * Gets Terra user ID for a session.
 * @param sessionId The session ID.
 * @returns The Terra user ID if it exists, null otherwise.
 */
export function getTerraUserId(sessionId: string): string | null {
    const session = sessionStore[sessionId];
    if (!session || !session.terraUserId) {
        return null;
    }
    session.timestamp = Date.now(); // Update timestamp on access
    return session.terraUserId;
}

/**
 * Clears Terra user ID for a session.
 * @param sessionId The session ID.
 */
export function clearTerraUserId(sessionId: string): void {
    const session = sessionStore[sessionId];
    if (session) {
        delete session.terraUserId;
        session.timestamp = Date.now();
        console.log(`Session Manager: Cleared Terra user ID for session ${sessionId}`);
    }
}

/**
 * Gets session information including Terra user ID.
 * @param sessionId The session ID.
 * @returns Session information if it exists, null otherwise.
 */
export function getSession(sessionId: string): { timestamp: number; terraUserId?: string } | null {
    const session = sessionStore[sessionId];
    if (!session) {
        return null;
    }
    session.timestamp = Date.now(); // Update timestamp on access
    return session;
}

console.log('Session Manager initialized.'); // Log initialization 