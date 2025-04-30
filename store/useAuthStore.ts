import { create } from "zustand"
import { jwtDecode } from "jwt-decode"

type User = {
  id: string
  name?: string
  email: string
  username: string
  profilePhoto?: string | null
}

type Token = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  refreshTokenExpiresAt: string
}

type AuthState = {
  user: User | null
  token: Token | null
  loading: boolean
  setAuthTokens: (accessToken: string, refreshToken: string) => Promise<void>
  clearAuth: () => void
}

type DecodedAccessToken = {
  id: string
  email: string
  username: string
  iat: number
  exp: number
}

type DecodedRefreshToken = {
  id: string
  iat: number
  exp: number
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,

  setAuthTokens: async (accessToken, refreshToken) => {
    try {
      set({ loading: true })

      const decodedAccess: DecodedAccessToken = jwtDecode(accessToken)
      const decodedRefresh: DecodedRefreshToken = jwtDecode(refreshToken)

      const accessTokenExpiresAt = new Date(decodedAccess.exp * 1000).toISOString()
      const refreshTokenExpiresAt = new Date(decodedRefresh.exp * 1000).toISOString()

      const token: Token = {
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
      }

      const res = await fetch("https://sage-link-server.onrender.com/api/users/userprofile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId: decodedAccess.id }),
      })

      if (!res.ok) {
        throw new Error("Failed to fetch user profile")
      }

      const data = await res.json()
      const userFromApi = data.user

      const user: User = {
        id: userFromApi.id,
        name: userFromApi.name,
        username: userFromApi.username,
        email: userFromApi.email,
        profilePhoto: userFromApi.profilePhoto,
      }

      set({ user, token, loading: false })
    } catch (error) {
      console.error("Auth error:", error)
      set({ user: null, token: null, loading: false })
    }
  },

  clearAuth: () => {
    set({ user: null, token: null, loading: false })
  },
}))
