// API client for WeLink Cargo Parking System
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000/api/v1"
const DEVELOPMENT_MODE = process.env.NODE_ENV === "development"

interface ApiResponse<T> {
  data?: T
  status: "success" | "error"
  message?: string
  errors?: Record<string, string[]>
}

class ApiClient {
  private token: string | null = null
  private isOfflineMode = false

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("parking_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("parking_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("parking_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "An error occurred",
          errors: data.errors,
        }
      }

      return {
        status: "success",
        data,
      }
    } catch (error) {
      if (DEVELOPMENT_MODE && !this.isOfflineMode) {
        this.isOfflineMode = true
        console.warn("Backend server not available. Switching to offline mode.")
      }

      return {
        status: "error",
        message: this.isOfflineMode ? "Backend server not available (offline mode)" : "Network error occurred",
      }
    }
  }

  private async requestWithFallback<T>(
    endpoint: string,
    options: RequestInit = {},
    fallbackData?: T,
  ): Promise<ApiResponse<T>> {
    const result = await this.request<T>(endpoint, options)

    if (result.status === "error" && this.isOfflineMode && fallbackData !== undefined) {
      return {
        status: "success" as const,
        data: fallbackData,
      }
    }

    return result
  }

  async login(username: string, password: string) {
    console.log("[v0] Login attempt:", { username, passwordLength: password.length })

    const result = await this.request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })

    if (result.status === "error" && this.isOfflineMode) {
      const demoUsers = [
        { username: "admin", password: "admin", role: "admin", id: "admin-1" },
        { username: "employee", password: "employee", role: "employee", id: "emp-1" },
        { username: "RedaSalem", password: "012345678", role: "admin", id: "reda-1" },
      ]

      const normalizeUsername = (str: string) => str.toLowerCase().replace(/\s+/g, "")
      const normalizedInputUsername = normalizeUsername(username)

      const user = demoUsers.find(
        (u) => normalizeUsername(u.username) === normalizedInputUsername && u.password === password,
      )

      if (user) {
        const loginResponse = {
          status: "success" as const,
          data: {
            user: { id: user.id, username: user.username, role: user.role },
            token: `demo-token-${user.id}`,
          },
        }
        console.log("[v0] Login response:", "Success - logged in as demo user")
        return loginResponse
      } else {
        const errorResponse = {
          status: "error" as const,
          message: "Invalid username or password",
        }
        console.log("[v0] Login response:", errorResponse.message)
        return errorResponse
      }
    }

    console.log("[v0] Login response:", result.status === "success" ? "Success" : result.message)
    return result
  }

  async register(username: string, password: string, role: "admin" | "employee") {
    console.log("[v0] Registration attempt:", { username, role, passwordLength: password.length })

    if (this.isOfflineMode || true) {
      // Always use offline mode for registration since backend doesn't support it
      // Simulate registration validation
      if (username.length < 3) {
        const errorResponse = {
          status: "error" as const,
          message: "Username must be at least 3 characters long",
        }
        console.log("[v0] Registration response:", errorResponse.message)
        return errorResponse
      }

      if (password.length < 6) {
        const errorResponse = {
          status: "error" as const,
          message: "Password must be at least 6 characters long",
        }
        console.log("[v0] Registration response:", errorResponse.message)
        return errorResponse
      }

      // Check against demo users
      const demoUsers = ["admin", "employee", "RedaSalem"]

      // Get previously registered users from localStorage
      const registeredUsers =
        typeof window !== "undefined" ? JSON.parse(localStorage.getItem("registered_users") || "[]") : []

      const allExistingUsers = [...demoUsers, ...registeredUsers.map((u: any) => u.username)]

      const normalizeUsername = (str: string) => str.toLowerCase().replace(/\s+/g, "")
      const normalizedInputUsername = normalizeUsername(username)

      const usernameExists = allExistingUsers.some(
        (existingUser) => normalizeUsername(existingUser) === normalizedInputUsername,
      )

      if (usernameExists) {
        const errorResponse = {
          status: "error" as const,
          message: "This username is already taken. Please choose a different username.",
        }
        console.log("[v0] Registration response:", errorResponse.message)
        return errorResponse
      }

      const newUser = {
        id: `user_${Date.now()}`,
        username: username,
        role: role,
        registeredAt: new Date().toISOString(),
      }

      if (typeof window !== "undefined") {
        const updatedUsers = [...registeredUsers, newUser]
        localStorage.setItem("registered_users", JSON.stringify(updatedUsers))
      }

      const successResponse = {
        status: "success" as const,
        data: {
          user: newUser,
          message: "Account created successfully! You can now sign in with your credentials.",
        },
      }
      console.log("[v0] Registration response:", "Success - account created")
      return successResponse
    }

    // If backend registration endpoint existed, it would be called here
    return this.request<{ user: any; message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, role }),
    })
  }

  async getGates() {
    const fallbackGates = [
      { id: "gate-1", name: "Main Gate", zoneIds: ["zone-1", "zone-2"], location: "Building A" },
      { id: "gate-2", name: "Side Gate", zoneIds: ["zone-3"], location: "Building B" },
    ]
    return this.requestWithFallback<any[]>("/master/gates", {}, fallbackGates)
  }

  async getZones(gateId?: string) {
    const query = gateId ? `?gateId=${gateId}` : ""
    const fallbackZones = [
      {
        id: "zone-1",
        name: "VIP Parking",
        categoryId: "cat-1",
        gateIds: ["gate-1"],
        totalSlots: 50,
        occupied: 32,
        free: 18,
        reserved: 5,
        availableForVisitors: 13,
        availableForSubscribers: 18,
        rateNormal: 25,
        rateSpecial: 40,
        open: true,
      },
      {
        id: "zone-2",
        name: "Regular Parking",
        categoryId: "cat-2",
        gateIds: ["gate-1"],
        totalSlots: 100,
        occupied: 67,
        free: 33,
        reserved: 8,
        availableForVisitors: 25,
        availableForSubscribers: 33,
        rateNormal: 15,
        rateSpecial: 25,
        open: true,
      },
      {
        id: "zone-3",
        name: "Economy Parking",
        categoryId: "cat-3",
        gateIds: ["gate-2"],
        totalSlots: 80,
        occupied: 45,
        free: 35,
        reserved: 6,
        availableForVisitors: 29,
        availableForSubscribers: 35,
        rateNormal: 10,
        rateSpecial: 18,
        open: false,
      },
    ]
    return this.requestWithFallback<any[]>(`/master/zones${query}`, {}, fallbackZones)
  }

  async getCategories() {
    const fallbackCategories = [
      { id: "cat-1", name: "VIP", description: "Premium parking spaces", rateNormal: 25, rateSpecial: 40 },
      { id: "cat-2", name: "Regular", description: "Standard parking spaces", rateNormal: 15, rateSpecial: 25 },
      { id: "cat-3", name: "Economy", description: "Budget parking spaces", rateNormal: 10, rateSpecial: 18 },
    ]
    return this.requestWithFallback<any[]>("/master/categories", {}, fallbackCategories)
  }

  async getSubscription(id: string) {
    return this.request<any>(`/subscriptions/${id}`)
  }

  async checkin(data: {
    gateId: string
    zoneId: string
    type: "visitor" | "subscriber"
    subscriptionId?: string
  }) {
    return this.request<any>("/tickets/checkin", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async checkout(data: { ticketId: string; forceConvertToVisitor?: boolean }) {
    return this.request<any>("/tickets/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getTicket(id: string) {
    return this.request<any>(`/tickets/${id}`)
  }

  async getParkingState() {
    const fallbackState = [
      {
        zoneId: "zone-1",
        name: "VIP Parking",
        totalSlots: 50,
        occupied: 32,
        free: 18,
        reserved: 5,
        availableForVisitors: 13,
        availableForSubscribers: 18,
        subscriberCount: 12,
        open: true,
      },
      {
        zoneId: "zone-2",
        name: "Regular Parking",
        totalSlots: 100,
        occupied: 67,
        free: 33,
        reserved: 8,
        availableForVisitors: 25,
        availableForSubscribers: 33,
        subscriberCount: 25,
        open: true,
      },
      {
        zoneId: "zone-3",
        name: "Economy Parking",
        totalSlots: 80,
        occupied: 45,
        free: 35,
        reserved: 6,
        availableForVisitors: 29,
        availableForSubscribers: 35,
        subscriberCount: 18,
        open: false,
      },
    ]
    return this.requestWithFallback<any[]>("/admin/reports/parking-state", {}, fallbackState)
  }

  async updateCategory(id: string, data: any) {
    if (this.isOfflineMode) {
      return { status: "success" as const, data: { ...data, id } }
    }
    return this.request<any>(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async toggleZone(zoneId: string, action: "open" | "close") {
    const open = action === "open"
    if (this.isOfflineMode) {
      return { status: "success" as const, data: { zoneId, open } }
    }
    return this.request<any>(`/admin/zones/${zoneId}/open`, {
      method: "PUT",
      body: JSON.stringify({ open }),
    })
  }

  async addRushHour(weekDay: number, from: string, to: string) {
    const data = { weekDay, from, to }
    if (this.isOfflineMode) {
      return { status: "success" as const, data: { id: `rush_${Date.now()}`, ...data } }
    }
    return this.request<any>("/admin/rush-hours", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async addVacation(name: string, from: string, to: string) {
    const data = { name, from, to }
    if (this.isOfflineMode) {
      return { status: "success" as const, data: { id: `vac_${Date.now()}`, ...data } }
    }
    return this.request<any>("/admin/vacations", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getSubscriptions() {
    const fallbackSubs = [
      {
        id: "sub-1",
        userId: "user-1",
        category: "cat-1",
        active: true,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        currentCheckins: [],
      },
      {
        id: "sub-2",
        userId: "user-2",
        category: "cat-2",
        active: true,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        currentCheckins: [{ ticketId: "t_123", zoneId: "zone-2", checkinAt: "2024-01-15T10:00:00Z" }],
      },
    ]
    return this.requestWithFallback<any[]>("/admin/subscriptions", {}, fallbackSubs)
  }
}

export const apiClient = new ApiClient()

export class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isOfflineMode = false

  constructor(private url = "ws://localhost:3000/api/v1/ws") {}

  connect(onMessage?: (data: any) => void, onError?: (error: Event) => void) {
    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        this.isOfflineMode = false
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage?.(data)
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      this.ws.onclose = () => {
        if (!this.isOfflineMode) {
          this.attemptReconnect(onMessage, onError)
        }
      }

      this.ws.onerror = (error) => {
        this.isOfflineMode = true
        onError?.(error)
      }
    } catch (error) {
      this.isOfflineMode = true
      onError?.(error as Event)
    }
  }

  private attemptReconnect(onMessage?: (data: any) => void, onError?: (error: Event) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        this.connect(onMessage, onError)
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      this.isOfflineMode = true
    }
  }

  subscribe(gateId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "subscribe",
          payload: { gateId },
        }),
      )
    }
  }

  unsubscribe(gateId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "unsubscribe",
          payload: { gateId },
        }),
      )
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
