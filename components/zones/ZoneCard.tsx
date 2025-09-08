"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Zone } from "@/types/parking"

interface ZoneCardProps {
  zone: Zone
  getZoneStatusColor: (zone: Zone) => string
}

export function ZoneCard({ zone, getZoneStatusColor }: ZoneCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 ${getZoneStatusColor(zone)}`} />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{zone.name}</CardTitle>
          <Badge variant={zone.open ? "default" : "destructive"}>{zone.open ? "Open" : "Closed"}</Badge>
        </div>
        <CardDescription>
          Normal: ${zone.rateNormal}/hr • Special: ${zone.rateSpecial}/hr
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-muted-foreground">Total Slots</div>
            <div className="text-2xl font-bold">{zone.totalSlots}</div>
          </div>
          <div>
            <div className="font-medium text-muted-foreground">Occupied</div>
            <div className="text-2xl font-bold text-secondary">{zone.occupied}</div>
          </div>
          <div>
            <div className="font-medium text-muted-foreground">Available (Visitors)</div>
            <div className="text-2xl font-bold text-primary">{zone.availableForVisitors}</div>
          </div>
          <div>
            <div className="font-medium text-muted-foreground">Reserved</div>
            <div className="text-2xl font-bold text-accent">{zone.reserved}</div>
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full" disabled={!zone.open || zone.availableForVisitors <= 0}>
            Check-in Visitor
          </Button>
          <Button variant="outline" className="w-full bg-transparent" disabled={!zone.open || zone.free <= 0}>
            Check-in Subscriber
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
