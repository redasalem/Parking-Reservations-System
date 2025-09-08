"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Car, Users, Clock } from "lucide-react"

interface Zone {
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

interface ZoneCardProps {
  zone: Zone
  onCheckinVisitor?: (zoneId: string) => void
  onCheckinSubscriber?: (zoneId: string) => void
}

export function ZoneCard({ zone, onCheckinVisitor, onCheckinSubscriber }: ZoneCardProps) {
  const getStatusColor = () => {
    if (!zone.open) return "bg-destructive"
    const occupancyRate = zone.occupied / zone.totalSlots
    if (occupancyRate > 0.9) return "bg-destructive"
    if (occupancyRate > 0.7) return "bg-secondary"
    return "bg-primary"
  }

  const getOccupancyPercentage = () => {
    return Math.round((zone.occupied / zone.totalSlots) * 100)
  }

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`absolute top-0 left-0 w-full h-1 ${getStatusColor()}`} />

      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">{zone.name}</CardTitle>
          </div>
          <Badge variant={zone.open ? "default" : "destructive"}>{zone.open ? "Open" : "Closed"}</Badge>
        </div>
        <CardDescription>
          Normal: ${zone.rateNormal}/hr • Special: ${zone.rateSpecial}/hr
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Occupancy Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Car className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{zone.totalSlots}</div>
            <div className="text-xs text-muted-foreground">Total Slots</div>
          </div>
          <div className="text-center p-3 bg-secondary/20 rounded-lg">
            <Users className="w-6 h-6 mx-auto mb-1 text-secondary" />
            <div className="text-2xl font-bold text-secondary">{zone.occupied}</div>
            <div className="text-xs text-muted-foreground">Occupied ({getOccupancyPercentage()}%)</div>
          </div>
        </div>

        {/* Availability Details */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Available for Visitors:</span>
            <span className="font-medium text-primary">{zone.availableForVisitors}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Available for Subscribers:</span>
            <span className="font-medium text-accent">{zone.availableForSubscribers}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Reserved Slots:</span>
            <span className="font-medium">{zone.reserved}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button
            className="w-full"
            disabled={!zone.open || zone.availableForVisitors <= 0}
            onClick={() => onCheckinVisitor?.(zone.id)}
          >
            <Clock className="w-4 h-4 mr-2" />
            Check-in Visitor
            {zone.availableForVisitors <= 0 && " (Full)"}
          </Button>
          <Button
            variant="outline"
            className="w-full bg-transparent"
            disabled={!zone.open || zone.free <= 0}
            onClick={() => onCheckinSubscriber?.(zone.id)}
          >
            <Users className="w-4 h-4 mr-2" />
            Check-in Subscriber
            {zone.free <= 0 && " (Full)"}
          </Button>
        </div>

        {/* Status Indicator */}
        {!zone.open && <div className="text-center text-sm text-destructive font-medium">Zone is currently closed</div>}
      </CardContent>
    </Card>
  )
}
