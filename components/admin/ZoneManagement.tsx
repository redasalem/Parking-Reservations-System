"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { Zone } from "@/types/parking"

interface ZoneManagementProps {
  zones: Zone[]
  onToggleZone: (zoneId: string, isOpen: boolean) => Promise<void>
  isLoading: boolean
}

export function ZoneManagement({ zones, onToggleZone, isLoading }: ZoneManagementProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Zone Management</CardTitle>
        <CardDescription>Open/close zones and update settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {zones.map((zone) => (
            <div key={zone.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">{zone.name}</div>
                <div className="text-sm text-muted-foreground">{zone.open ? "Currently open" : "Currently closed"}</div>
              </div>
              <Button
                variant={zone.open ? "destructive" : "default"}
                size="sm"
                onClick={() => onToggleZone(zone.id, zone.open)}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : zone.open ? "Close" : "Open"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
