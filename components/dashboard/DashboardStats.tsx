"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Car, Users, Clock } from "lucide-react"
import type { Zone } from "@/types/parking"

interface DashboardStatsProps {
  zones: Zone[]
}

export function DashboardStats({ zones }: DashboardStatsProps) {
  const totalSlots = zones.reduce((sum, zone) => sum + zone.totalSlots, 0)
  const totalOccupied = zones.reduce((sum, zone) => sum + zone.occupied, 0)
  const totalFree = zones.reduce((sum, zone) => sum + zone.free, 0)
  const openZones = zones.filter((z) => z.open).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Zones</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{zones.length}</div>
          <p className="text-xs text-muted-foreground">{openZones} open</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSlots}</div>
          <p className="text-xs text-muted-foreground">Across all zones</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Occupied</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-secondary">{totalOccupied}</div>
          <p className="text-xs text-muted-foreground">Currently parked</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{totalFree}</div>
          <p className="text-xs text-muted-foreground">Free slots</p>
        </CardContent>
      </Card>
    </div>
  )
}
