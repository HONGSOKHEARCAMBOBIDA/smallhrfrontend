import { defineStore } from 'pinia'
import { getuserdata } from '../api/services'

export const useUserDataStore = defineStore('userdata', {
  state: () => ({
    userdata: null,
  }),

  getters: {
    name: (state) => state.userdata?.name || '',
  },

  actions: {
    async getuserdata() {
      const res = await getuserdata()
      this.userdata = res.data.data
    },

    clear() {
      this.userdata = null
    }
  }
})