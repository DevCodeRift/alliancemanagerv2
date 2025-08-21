import { prisma } from './db'
import { hashPassword, verifyPassword, encrypt, decrypt, validateEmail, validatePassword } from './auth'
import { createPnWClient } from './pnw-api'
import type { User } from '@prisma/client'

export interface CreateUserData {
  email?: string
  username?: string
  password?: string
  discordId?: string
  discordUsername?: string
}

export interface LoginCredentials {
  email?: string
  username?: string
  password: string
}

export interface PnWVerificationData {
  apiKey: string
}

export class UserService {
  /**
   * Create a new user with username/password
   */
  async createUser(data: CreateUserData): Promise<User> {
    // Validate input
    if (data.email && !validateEmail(data.email)) {
      throw new Error('Invalid email format')
    }

    if (data.password) {
      const passwordValidation = validatePassword(data.password)
      if (!passwordValidation.valid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`)
      }
    }

    // Check for existing user
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      })
      if (existingUser) {
        throw new Error('User with this email already exists')
      }
    }

    if (data.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: data.username }
      })
      if (existingUser) {
        throw new Error('User with this username already exists')
      }
    }

    if (data.discordId) {
      const existingUser = await prisma.user.findUnique({
        where: { discordId: data.discordId }
      })
      if (existingUser) {
        throw new Error('User with this Discord account already exists')
      }
    }

    // Hash password if provided
    let hashedPassword: string | undefined
    if (data.password) {
      hashedPassword = await hashPassword(data.password)
    }

    // Create user
    return prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        discordId: data.discordId,
        discordUsername: data.discordUsername,
        lastActive: new Date()
      }
    })
  }

  /**
   * Login with username/password
   */
  async loginWithPassword(credentials: LoginCredentials): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          credentials.email ? { email: credentials.email } : {},
          credentials.username ? { username: credentials.username } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      }
    })

    if (!user || !user.password) {
      return null
    }

    const isValid = await verifyPassword(credentials.password, user.password)
    if (!isValid) {
      return null
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    })

    return user
  }

  /**
   * Find or create user from Discord OAuth
   */
  async findOrCreateDiscordUser(discordData: {
    discordId: string
    discordUsername: string
    email?: string
  }): Promise<User> {
    // Check if user exists with this Discord ID
    let user = await prisma.user.findUnique({
      where: { discordId: discordData.discordId }
    })

    if (user) {
      // Update Discord username if changed
      if (user.discordUsername !== discordData.discordUsername) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            discordUsername: discordData.discordUsername,
            lastActive: new Date()
          }
        })
      } else {
        // Just update last active
        user = await prisma.user.update({
          where: { id: user.id },
          data: { lastActive: new Date() }
        })
      }
      return user
    }

    // Create new user
    return this.createUser({
      discordId: discordData.discordId,
      discordUsername: discordData.discordUsername,
      email: discordData.email
    })
  }

  /**
   * Verify PnW account and link to user
   */
  async verifyPnWAccount(userId: string, data: PnWVerificationData): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Test the API key
    const pnwClient = createPnWClient(data.apiKey)
    const nationData = await pnwClient.verifyApiKey()

    if (!nationData) {
      throw new Error('Invalid PnW API key or API error')
    }

    const nationId = parseInt(nationData.id)

    // Check if this nation is already linked to another user
    const existingUser = await prisma.user.findUnique({
      where: { nationId }
    })

    if (existingUser && existingUser.id !== userId) {
      throw new Error('This PnW nation is already linked to another account')
    }

    // Encrypt the API key for storage
    const encryptedApiKey = encrypt(data.apiKey)

    // Update user with PnW data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        nationId,
        nationName: nationData.nation_name,
        leaderName: nationData.leader_name,
        apiKey: encryptedApiKey,
        verified: true
      }
    })

    // Cache nation data
    await this.cacheNationData(nationData)

    return updatedUser
  }

  /**
   * Get user by ID with decrypted API key
   */
  async getUserWithApiKey(userId: string): Promise<(User & { decryptedApiKey?: string }) | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) return null

    let decryptedApiKey: string | undefined
    if (user.apiKey) {
      try {
        decryptedApiKey = decrypt(user.apiKey)
      } catch (error) {
        console.error('Failed to decrypt API key:', error)
      }
    }

    return {
      ...user,
      decryptedApiKey
    }
  }

  /**
   * Update user's PnW data from API
   */
  async refreshUserPnWData(userId: string): Promise<User | null> {
    const user = await this.getUserWithApiKey(userId)

    if (!user || !user.decryptedApiKey) {
      return null
    }

    const pnwClient = createPnWClient(user.decryptedApiKey)
    const nationData = await pnwClient.verifyApiKey()

    if (!nationData) {
      return null
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        nationName: nationData.nation_name,
        leaderName: nationData.leader_name
      }
    })

    // Update cached nation data
    await this.cacheNationData(nationData)

    return updatedUser
  }

  /**
   * Cache nation data for faster lookups
   */
  private async cacheNationData(nationData: any): Promise<void> {
    const nationId = parseInt(nationData.id)

    await prisma.nation.upsert({
      where: { id: nationId },
      create: {
        id: nationId,
        nationName: nationData.nation_name,
        leaderName: nationData.leader_name,
        allianceId: nationData.alliance_id ? parseInt(nationData.alliance_id) : null,
        allianceName: nationData.alliance?.name || null,
        score: nationData.score || null,
        cities: nationData.num_cities || null,
        color: nationData.color || null,
        continent: nationData.continent || null,
        warPolicy: nationData.war_policy || null,
        domesticPolicy: nationData.domestic_policy || null,
        lastActive: nationData.last_active ? new Date(nationData.last_active) : null
      },
      update: {
        nationName: nationData.nation_name,
        leaderName: nationData.leader_name,
        allianceId: nationData.alliance_id ? parseInt(nationData.alliance_id) : null,
        allianceName: nationData.alliance?.name || null,
        score: nationData.score || null,
        cities: nationData.num_cities || null,
        color: nationData.color || null,
        continent: nationData.continent || null,
        warPolicy: nationData.war_policy || null,
        domesticPolicy: nationData.domestic_policy || null,
        lastActive: nationData.last_active ? new Date(nationData.last_active) : null
      }
    })
  }

  /**
   * Get user by nation ID
   */
  async getUserByNationId(nationId: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { nationId }
    })
  }

  /**
   * Search users by various criteria
   */
  async searchUsers(params: {
    nationName?: string
    leaderName?: string
    allianceId?: number
    verified?: boolean
    limit?: number
  }): Promise<User[]> {
    const where: any = {}

    if (params.nationName) {
      where.nationName = {
        contains: params.nationName,
        mode: 'insensitive'
      }
    }

    if (params.leaderName) {
      where.leaderName = {
        contains: params.leaderName,
        mode: 'insensitive'
      }
    }

    if (params.verified !== undefined) {
      where.verified = params.verified
    }

    return prisma.user.findMany({
      where,
      take: params.limit || 50,
      orderBy: { lastActive: 'desc' }
    })
  }
}

export const userService = new UserService()
