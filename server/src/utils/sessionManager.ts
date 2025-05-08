// server/src/utils/sessionManager.ts

interface Session {
    terraUserId?: string;
    // We can add other session-related data here later if needed
    // e.g., healthReport?: LLMReadyHealthReport;
    createdAt: Date;
}

const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const sessions = new Map<string, Session>();

/**
 * Creates a new session or updates an existing one, storing the Terra User ID.
 * @param sessionId Our internal session ID (used as reference_id for Terra).
 * @param terraUserId The User ID from Terra.
 */
export function storeTerraUserId(sessionId: string, terraUserId: string): void {
    const existingSession = sessions.get(sessionId);
    if (existingSession) {
        existingSession.terraUserId = terraUserId;
        existingSession.createdAt = new Date(); // Update timestamp
    } else {
        sessions.set(sessionId, {
            terraUserId,
            createdAt: new Date(),
        });
    }
    console.log(`Session Manager: Stored Terra User ID for session ${sessionId}`);
}

/**
 * Retrieves the Terra User ID for a given session ID.
 * @param sessionId Our internal session ID.
 * @returns The Terra User ID, or undefined if not found or expired.
 */
export function getTerraUserId(sessionId: string): string | undefined {
    const session = sessions.get(sessionId);
    if (session && session.terraUserId) {
        // Basic check for session expiry, can be made more robust
        if (new Date().getTime() - session.createdAt.getTime() > MAX_SESSION_AGE_MS) {
            console.log(`Session Manager: Session ${sessionId} has expired.`);
            sessions.delete(sessionId);
            return undefined;
        }
        return session.terraUserId;
    }
    console.log(`Session Manager: No Terra User ID found for session ${sessionId}`);
    return undefined;
}

/**
 * Creates an initial session entry when we generate a sessionId 
 * before redirecting to Terra. This helps to validate the sessionId later.
 * @param sessionId Our internal session ID.
 */
export function initializeSession(sessionId: string): void {
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {
            createdAt: new Date(),
        });
        console.log(`Session Manager: Initialized session ${sessionId}`);
    }
}

// Simple cleanup of old sessions (can be called periodically or on a trigger)
// For a demo app, this might be overkill, but good practice for longer-running apps.
function cleanupExpiredSessions() {
    const now = new Date().getTime();
    for (const [sessionId, session] of sessions.entries()) {
        if (now - session.createdAt.getTime() > MAX_SESSION_AGE_MS) {
            console.log(`Session Manager: Cleaning up expired session ${sessionId}`);
            sessions.delete(sessionId);
        }
    }
}

// Periodically cleanup sessions, e.g., every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

console.log('Session Manager initialized.'); 