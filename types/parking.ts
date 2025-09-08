export interface User {
  id: string
  username: string
  role: "admin" | "employee" | "guest"
}

export interface Zone {
  id: string
  name: string
  categoryId: string
  gateIds: string[]
  totalSlots: number
  occupied: number
  free: number
  reserved: number
  availableForVisitors: number
  availableForSubscribers: number
  rateNormal: number
  rateSpecial: number
  open: boolean
}

export interface Gate {
  id: string
  name: string
  zoneIds: string[]
  location: string
}
