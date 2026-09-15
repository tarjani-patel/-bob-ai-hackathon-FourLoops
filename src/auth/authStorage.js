import { PRESEEDED_ACCOUNTS, ROLES, ROLE_DEFINITIONS } from "./roleConfig.js";

const USERS_STORAGE_KEY = "trialguard_registered_users_v1";
const SESSION_STORAGE_KEY = "trialguard_auth_session_v1";

/**
 * Retrieves all registered user accounts from localStorage.
 * Initializes with pre-seeded accounts if empty.
 */
export function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(PRESEEDED_ACCOUNTS));
      return [...PRESEEDED_ACCOUNTS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(PRESEEDED_ACCOUNTS));
    return [...PRESEEDED_ACCOUNTS];
  } catch (e) {
    console.error("Failed to read user accounts from localStorage", e);
    return [...PRESEEDED_ACCOUNTS];
  }
}

/**
 * Finds an account by email address (case-insensitive).
 */
export function findUserByEmail(email) {
  if (!email) return null;
  const users = getStoredUsers();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
}

/**
 * Registers a new clinical user account and saves to localStorage.
 */
export function registerUser({ name, email, password, role, assignedSite, organization }) {
  if (!name || !email || !password || !role) {
    throw new Error("Missing required registration fields.");
  }

  const existing = findUserByEmail(email);
  if (existing) {
    throw new Error("An account with this institutional email already exists. Please sign in.");
  }

  if (role === ROLES.INVESTIGATOR && !assignedSite) {
    throw new Error("Site Investigators must be assigned to an active clinical site.");
  }

  const users = getStoredUsers();
  const roleMeta = ROLE_DEFINITIONS[role] || {};

  const newUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password,
    role: role,
    roleTitle: roleMeta.label || role,
    roleDescription: roleMeta.description || "",
    assignedSite: role === ROLES.INVESTIGATOR ? assignedSite : null,
    organization: organization?.trim() || (role === ROLES.INVESTIGATOR ? `${assignedSite} Clinical Operations` : "Trial Research Operations"),
    allowedRoutes: roleMeta.allowedRoutes || ["/dashboard"],
    permissions: roleMeta.permissions || [],
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to persist new user to localStorage", e);
  }

  return newUser;
}

/**
 * Authenticates a user by email and password.
 */
export function authenticateUser(email, password) {
  if (!email || !password) {
    throw new Error("Please enter both email and password.");
  }

  const user = findUserByEmail(email);
  if (!user) {
    throw new Error("Account not found for this email address. Please register an account.");
  }

  if (user.password !== password) {
    throw new Error("Invalid password. Please check your credentials.");
  }

  const roleMeta = ROLE_DEFINITIONS[user.role] || {};

  // Build clean authenticated session
  const session = {
    userId: user.id,
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleTitle: roleMeta.label || user.role,
    roleDescription: roleMeta.description || "",
    assignedSite: user.assignedSite || null,
    organization: user.organization || "Clinical Operations",
    allowedRoutes: roleMeta.allowedRoutes || ["/dashboard"],
    permissions: roleMeta.permissions || [],
    lastLoginAt: new Date().toISOString()
  };

  saveSession(session);
  return session;
}

/**
 * Loads the currently authenticated session from localStorage.
 */
export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to read session from localStorage", e);
  }
  return null;
}

/**
 * Persists current session into localStorage.
 */
export function saveSession(session) {
  try {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.error("Failed to save session to localStorage", e);
  }
}

/**
 * Clears current session from localStorage.
 */
export function clearSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear session from localStorage", e);
  }
}
