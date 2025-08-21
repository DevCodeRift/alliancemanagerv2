import axios from 'axios'

const PNW_API_BASE = 'https://api.politicsandwar.com/graphql'

export interface PnWNation {
  id: string
  nation_name: string
  leader_name: string
  alliance_id: string
  alliance?: {
    id: string
    name: string
  }
  last_active: string
  score: number
  cities: number
  color: string
}

export class PnWAPI {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async validateApiKey(): Promise<{ valid: boolean; error?: string }> {
    try {
      const query = `
        query {
          nation {
            id
            nation_name
            leader_name
          }
        }
      `
      
      const response = await axios.get(PNW_API_BASE, {
        params: {
          api_key: this.apiKey,
          query: query
        }
      })

      if (response.data.errors) {
        return {
          valid: false,
          error: response.data.errors[0]?.message || 'Invalid API key'
        }
      }

      if (response.data.data?.nation) {
        return { valid: true }
      }

      return {
        valid: false,
        error: 'Unable to fetch nation data'
      }
    } catch (error) {
      return {
        valid: false,
        error: 'Failed to connect to PnW API'
      }
    }
  }

  async getNationByApiKey(): Promise<{ nation?: PnWNation; error?: string }> {
    try {
      const query = `
        query {
          nation {
            id
            nation_name
            leader_name
            alliance_id
            alliance {
              id
              name
            }
            last_active
            score
            num_cities
            color
          }
        }
      `
      
      const response = await axios.get(PNW_API_BASE, {
        params: {
          api_key: this.apiKey,
          query: query
        }
      })

      if (response.data.errors) {
        return {
          error: response.data.errors[0]?.message || 'API error'
        }
      }

      const nationData = response.data.data?.nation
      if (!nationData) {
        return {
          error: 'Nation not found'
        }
      }

      return {
        nation: {
          id: nationData.id,
          nation_name: nationData.nation_name,
          leader_name: nationData.leader_name,
          alliance_id: nationData.alliance_id,
          alliance: nationData.alliance,
          last_active: nationData.last_active,
          score: nationData.score,
          cities: nationData.num_cities,
          color: nationData.color
        }
      }
    } catch (error) {
      return {
        error: 'Failed to fetch nation data'
      }
    }
  }

  async getNationById(nationId: number): Promise<{ nation?: PnWNation; error?: string }> {
    try {
      const query = `
        query {
          nations(id: ${nationId}) {
            data {
              id
              nation_name
              leader_name
              alliance_id
              alliance {
                id
                name
              }
              last_active
              score
              num_cities
              color
            }
          }
        }
      `
      
      const response = await axios.get(PNW_API_BASE, {
        params: {
          api_key: this.apiKey,
          query: query
        }
      })

      if (response.data.errors) {
        return {
          error: response.data.errors[0]?.message || 'API error'
        }
      }

      const nations = response.data.data?.nations?.data
      if (!nations || nations.length === 0) {
        return {
          error: 'Nation not found'
        }
      }

      const nationData = nations[0]
      return {
        nation: {
          id: nationData.id,
          nation_name: nationData.nation_name,
          leader_name: nationData.leader_name,
          alliance_id: nationData.alliance_id,
          alliance: nationData.alliance,
          last_active: nationData.last_active,
          score: nationData.score,
          cities: nationData.num_cities,
          color: nationData.color
        }
      }
    } catch (error) {
      return {
        error: 'Failed to fetch nation data'
      }
    }
  }
}
