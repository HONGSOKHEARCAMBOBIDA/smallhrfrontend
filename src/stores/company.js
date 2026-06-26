import { defineStore } from 'pinia'
import { viewcompanycolor } from '../api/services'

export const useCompanyStore = defineStore('company', {
  state: () => ({
    color: '#1a1a2e',
  }),
  actions: {
    async fetchColor() {
      try {
        const res = await viewcompanycolor()
        this.color = res.data.data?.color || '#1a1a2e'
      } catch (e) {
        // keep default on failure
      }
    },
    setColor(color) {
      this.color = color || '#1a1a2e'
    }
  }
})