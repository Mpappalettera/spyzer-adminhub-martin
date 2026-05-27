import { request, USE_MOCKS } from './api'
import { campaigns, emailTemplates } from '@/mocks/emails'

export const emailService = {
  async sendCampaign(campaignData) {
    if (USE_MOCKS) {
      const newCampaign = {
        id: campaigns.length + 1,
        ...campaignData,
        destinatarios: '4192',
        estado: 'SENT',
        fechaEnvio: new Date().toISOString(),
      }
      campaigns.unshift(newCampaign)
      return newCampaign
    }
    return request('/campanas', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    })
  },
  async getCampaigns() {
    if (USE_MOCKS) {
      return campaigns
    }
    return request('/campanas')
  },
  async getEmailTemplates() {
    if (USE_MOCKS) {
      return emailTemplates
    }
    return request('/campanas/plantillas')
  },
}

