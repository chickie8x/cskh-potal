import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    refreshToken: null,
    user: null,
    userAddress: null,
  }),
  actions: {
    setAccessToken(token) {
      this.accessToken = token
      this.user = jwtDecode(token)
    },
    setRefreshToken(token) {
      this.refreshToken = token
    },
    setUser(user) {
      this.user = user
    },
    setUserAddress(userAddress) {
      this.userAddress = userAddress
    },
    clear() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      this.userAddress = null
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'auth',
        storage: localStorage,
      },
    ],
  },
})
