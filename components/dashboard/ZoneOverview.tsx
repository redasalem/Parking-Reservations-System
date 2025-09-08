"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Zone } from "@/types/parking"

interface ZoneOverviewProps {
  zones: Zone[]
  getZoneStatusColor: (zone: Zone) => string
}

export function ZoneOverview({ zones, getZoneStatusColor }: ZoneOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Zone Overview</CardTitle>
        <CardDescription>Real-time parking status across all zones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {zones.map((zone) => (
            <div key={zone.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${getZoneStatusColor(zone)}`} />
                <div>
                  <h4 className="font-medium">{zone.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {zone.open ? "Open" : "Closed"} • ${zone.rateNormal}/hr normal, ${zone.rateSpecial}/hr special
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {zone.occupied}/{zone.totalSlots} occupied
                </div>
                <div className="text-xs text-muted-foreground">{zone.availableForVisitors} visitor slots available</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
