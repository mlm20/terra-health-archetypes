// server/src/utils/sessionManager.ts

// Simple in-memory store for sessionId -> { timestamp }
// NOTE: This is NOT suitable for production. Data is lost on server restart.
const sessionStore: Record<string, { timestamp: number }> = {};

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

console.log('Session Manager initialized.'); // Log initialization 