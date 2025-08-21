import { prisma } from './db'
import { hashPassword, verifyPassword, validateEmail, validatePassword } from './auth'
import { PnWAPI } from './pnw-api'
import type { User } from '@prisma/client'

export interface CreateUserData {
  email?: string
  username?: string
  password?: string
  discordId?: string
  discordUsername?: string
}

export interface VerifyPnWData {
  userId: string
  apiKey: string
}

export class UserService {
  // Register with username/password
  static async createUser(data: CreateUserData): Promise<{ user?: User; error?: string }> {
    try {
      // Validate email if provided
      if (data.email && !validateEmail(data.email)) {
        return { error: 'Invalid email format' }
      }

      // Validate password if provided
      if (data.password) {
        const passwordValidation = validatePassword(data.password)
        if (!passwordValidation.valid) {
          return { error: passwordValidation.errors.join(', ') }
        }
      }

      // Check if user already exists
      if (data.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: data.email }
        })
        if (existingUser) {
          return { error: 'User with this email already exists' }
        }
      }

      if (data.username) {
        const existingUser = await prisma.user.findUnique({
          where: { username: data.username }
        })
        if (existingUser) {
          return { error: 'Username already taken' }
        }
      }

      if (data.discordId) {
        const existingUser = await prisma.user.findUnique({
          where: { discordId: data.discordId }
        })
        if (existingUser) {
          return { error: 'Discord account already linked' }
        }
      }

      // Hash password if provided
      let hashedPassword: string | undefined
      if (data.password) {
        hashedPassword = await hashPassword(data.password)
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          username: data.username,
          password: hashedPassword,
          discordId: data.discordId,
          discordUsername: data.discordUsername
        }
      })

      return { user }
    } catch (error) {
      console.error('Error creating user:', error)
      return { error: 'Failed to create user' }
    }
  }

  // Login with username/password
  static async authenticateUser(identifier: string, password: string): Promise<{ user?: User; error?: string }> {
    try {
      // Find user by email or username
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { username: identifier }
          ]
        }
      })

      if (!user || !user.password) {
        return { error: 'Invalid credentials' }
      }

      const isValidPassword = await verifyPassword(password, user.password)
      if (!isValidPassword) {
        return { error: 'Invalid credentials' }
      }

      return { user }
    } catch (error) {
      console.error('Error authenticating user:', error)
      return { error: 'Authentication failed' }
    }
  }

  // Find user by Discord ID
  static async findByDiscordId(discordId: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { discordId }
      })
    } catch (error) {
      console.error('Error finding user by Discord ID:', error)
      return null
    }
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id }
      })
    } catch (error) {
      console.error('Error finding user by ID:', error)
      return null
    }
  }

  // Verify PnW account and link to user
  static async verifyPnWAccount(data: VerifyPnWData): Promise<{ success: boolean; error?: string; nationData?: any }> {
    try {
      const user = await this.findById(data.userId)
      if (!user) {
        return { success: false, error: 'User not found' }
      }

      // Validate API key with PnW
      const pnwApi = new PnWAPI(data.apiKey)
      const validation = await pnwApi.validateApiKey()
      
      if (!validation.valid) {
        return { success: false, error: validation.error || 'Invalid API key' }
      }

      // Get nation data
      const { nation, error } = await pnwApi.getNationByApiKey()
      if (error || !nation) {
        return { success: false, error: error || 'Failed to fetch nation data' }
      }

      // Check if nation is already linked to another user
      const existingUser = await prisma.user.findUnique({
        where: { nationId: parseInt(nation.id) }
      })

      if (existingUser && existingUser.id !== user.id) {
        return { success: false, error: 'This nation is already linked to another account' }
      }

      // Encrypt and store API key, update user with nation data
      await prisma.user.update({
        where: { id: user.id },
        data: {
          nationId: parseInt(nation.id),
          nationName: nation.nation_name,
          leaderName: nation.leader_name,
          apiKey: data.apiKey, // In production, encrypt this
          verified: true,
          updatedAt: new Date()
        }
      })

      return { 
        success: true, 
        nationData: {
          id: nation.id,
          nationName: nation.nation_name,
          leaderName: nation.leader_name,
          alliance: nation.alliance,
          score: nation.score,
          cities: nation.cities,
          color: nation.color
        }
      }
    } catch (error) {
      console.error('Error verifying PnW account:', error)
      return { success: false, error: 'Failed to verify PnW account' }
    }
  }

  // Update user profile
  static async updateUser(id: string, data: Partial<User>): Promise<{ user?: User; error?: string }> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })

      return { user }
    } catch (error) {
      console.error('Error updating user:', error)
      return { error: 'Failed to update user' }
    }
  }
}
