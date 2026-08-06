// ── Entities ──────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string
  fullName: string
  email: string
  roles: string[]
}

// ── Login ─────────────────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string
  password: string
}

// ── Register ──────────────────────────────────────────────────────────────────
export interface RegisterPayload {
  fullName: string
  email: string
  phoneNumber: string
  password: string
}

// ── API Response ──────────────────────────────────────────────────────────────
/** Matches UrbanInfraSystem.Application.DTOs.Auth.AuthResponse */
export interface AuthApiResponse {
  success: boolean
  message?: string
  accessToken?: string
  refreshToken?: string
  accessTokenExpiresAtUtc?: string
  user?: AuthUser
}
