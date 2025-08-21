import axios from 'axios'

const PNW_API_BASE = process.env.PNW_API_BASE_URL || 'https://api.politicsandwar.com/graphql'

export interface PnWNation {
  id: string
  nation_name: string
  leader_name: string
  alliance_id?: string
  alliance?: {
    id: string
    name: string
    acronym?: string
  }
  score?: number
  num_cities?: number
  color?: string
  continent?: string
  war_policy?: string
  domestic_policy?: string
  last_active?: string
  discord?: string
  discord_id?: string
}

export interface PnWApiResponse {
  data: {
    nation?: PnWNation
    nations?: {
      data: PnWNation[]
    }
  }
  errors?: Array<{
    message: string
    path?: string[]
  }>
}

export class PnWApiClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Verify an API key by fetching the nation it belongs to
   */
  async verifyApiKey(): Promise<PnWNation | null> {
    try {
      const query = `
        {
          nation {
            id
            nation_name
            leader_name
            alliance_id
            alliance {
              id
              name
              acronym
            }
            score
            num_cities
            color
            continent
            war_policy
            domestic_policy
            last_active
            discord
            discord_id
          }
        }
      `

      const response = await this.makeRequest<{ nation: PnWNation }>(query)
      return response.data.nation || null
    } catch (error) {
      console.error('API key verification failed:', error)
      return null
    }
  }

  /**
   * Get a nation by ID
   */
  async getNationById(nationId: number): Promise<PnWNation | null> {
    try {
      const query = `
        {
          nations(id: ${nationId}) {
            data {
              id
              nation_name
              leader_name
              alliance_id
              alliance {
                id
                name
                acronym
              }
              score
              num_cities
              color
              continent
              war_policy
              domestic_policy
              last_active
              discord
              discord_id
            }
          }
        }
      `

      const response = await this.makeRequest<{ nations: { data: PnWNation[] } }>(query)
      const nations = response.data.nations?.data || []
      return nations.length > 0 ? nations[0] : null
    } catch (error) {
      console.error('Failed to fetch nation:', error)
      return null
    }
  }

  /**
   * Search nations by various criteria
   */
  async searchNations(params: {
    alliance_id?: number
    nation_name?: string
    leader_name?: string
    min_score?: number
    max_score?: number
    limit?: number
  }): Promise<PnWNation[]> {
    try {
      const filters: string[] = []
      
      if (params.alliance_id) filters.push(`alliance_id: ${params.alliance_id}`)
      if (params.nation_name) filters.push(`nation_name: ["${params.nation_name}"]`)
      if (params.leader_name) filters.push(`leader_name: ["${params.leader_name}"]`)
      if (params.min_score) filters.push(`min_score: ${params.min_score}`)
      if (params.max_score) filters.push(`max_score: ${params.max_score}`)
      
      const filterString = filters.length > 0 ? `(${filters.join(', ')})` : ''
      const limit = params.limit ? `, first: ${params.limit}` : ''

      const query = `
        {
          nations${filterString}${limit} {
            data {
              id
              nation_name
              leader_name
              alliance_id
              alliance {
                id
                name
                acronym
              }
              score
              num_cities
              color
              continent
              last_active
            }
          }
        }
      `

      const response = await this.makeRequest<{ nations: { data: PnWNation[] } }>(query)
      return response.data.nations?.data || []
    } catch (error) {
      console.error('Failed to search nations:', error)
      return []
    }
  }

  private async makeRequest<T>(query: string): Promise<PnWApiResponse & { data: T }> {
    const url = `${PNW_API_BASE}?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`
    
    const response = await axios.get<PnWApiResponse & { data: T }>(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'AllianceManager/1.0'
      }
    })

    if (response.data.errors && response.data.errors.length > 0) {
      throw new Error(`PnW API Error: ${response.data.errors[0].message}`)
    }

    return response.data
  }
}

/**
 * Create a PnW API client with the given API key
 */
export function createPnWClient(apiKey: string): PnWApiClient {
  return new PnWApiClient(apiKey)
}
