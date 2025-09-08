"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Ticket, Car, Clock, DollarSign, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import type { Zone, Gate } from "@/types/parking"

interface TicketManagementProps {
  zones: Zone[]
  gates: Gate[]
  isLoading: boolean
}

export function TicketManagement({ zones, gates, isLoading }: TicketManagementProps) {
  const [activeOperation, setActiveOperation] = useState<"checkin" | "checkout" | null>(null)
  const [checkinForm, setCheckinForm] = useState({
    gateId: "",
    zoneId: "",
    type: "visitor" as "visitor" | "subscriber",
    subscriptionId: "",
  })
  const [checkoutForm, setCheckoutForm] = useState({
    ticketId: "",
    forceConvertToVisitor: false,
  })
  const [operationLoading, setOperationLoading] = useState(false)
  const { toast } = useToast()

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault()
    setOperationLoading(true)

    try {
      const response = await apiClient.checkin(checkinForm)

      if (response.status === "success") {
        toast({
          title: "Check-in successful",
          description: `Ticket ${response.data?.ticket?.id} created successfully`,
        })
        setCheckinForm({ gateId: "", zoneId: "", type: "visitor", subscriptionId: "" })
        setActiveOperation(null)
      } else {
        toast({
          title: "Check-in failed",
          description: response.message || "Unable to process check-in",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process check-in",
        variant: "destructive",
      })
    } finally {
      setOperationLoading(false)
    }
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setOperationLoading(true)

    try {
      const response = await apiClient.checkout(checkoutForm)

      if (response.status === "success") {
        toast({
          title: "Check-out successful",
          description: `Total amount: $${response.data?.amount || 0}`,
        })
        setCheckoutForm({ ticketId: "", forceConvertToVisitor: false })
        setActiveOperation(null)
      } else {
        toast({
          title: "Check-out failed",
          description: response.message || "Unable to process check-out",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process check-out",
        variant: "destructive",
      })
    } finally {
      setOperationLoading(false)
    }
  }

  const availableZones = zones.filter((zone) =>
    checkinForm.gateId ? gates.find((g) => g.id === checkinForm.gateId)?.zoneIds.includes(zone.id) : true,
  )

  if (activeOperation === "checkin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="w-5 h-5" />
            <span>Vehicle Check-in</span>
          </CardTitle>
          <CardDescription>Process new vehicle entry</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckin} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gate">Select Gate</Label>
                <Select
                  value={checkinForm.gateId}
                  onValueChange={(value) => setCheckinForm((prev) => ({ ...prev, gateId: value, zoneId: "" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose gate" />
                  </SelectTrigger>
                  <SelectContent>
                    {gates.map((gate) => (
                      <SelectItem key={gate.id} value={gate.id}>
                        {gate.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="zone">Select Zone</Label>
                <Select
                  value={checkinForm.zoneId}
                  onValueChange={(value) => setCheckinForm((prev) => ({ ...prev, zoneId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableZones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id} disabled={!zone.open}>
                        {zone.name} ({zone.availableForVisitors} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="type">Visitor Type</Label>
              <Select
                value={checkinForm.type}
                onValueChange={(value: "visitor" | "subscriber") =>
                  setCheckinForm((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visitor">Visitor</SelectItem>
                  <SelectItem value="subscriber">Subscriber</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {checkinForm.type === "subscriber" && (
              <div>
                <Label htmlFor="subscription">Subscription ID</Label>
                <Input
                  id="subscription"
                  value={checkinForm.subscriptionId}
                  onChange={(e) => setCheckinForm((prev) => ({ ...prev, subscriptionId: e.target.value }))}
                  placeholder="Enter subscription ID"
                  required
                />
              </div>
            )}

            <div className="flex space-x-2">
              <Button type="submit" disabled={operationLoading} className="flex-1">
                {operationLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Check-in"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setActiveOperation(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (activeOperation === "checkout") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Vehicle Check-out</span>
          </CardTitle>
          <CardDescription>Process vehicle exit and payment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <Label htmlFor="ticketId">Ticket ID</Label>
              <Input
                id="ticketId"
                value={checkoutForm.ticketId}
                onChange={(e) => setCheckoutForm((prev) => ({ ...prev, ticketId: e.target.value }))}
                placeholder="Scan or enter ticket ID"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="forceConvert"
                checked={checkoutForm.forceConvertToVisitor}
                onChange={(e) => setCheckoutForm((prev) => ({ ...prev, forceConvertToVisitor: e.target.checked }))}
              />
              <Label htmlFor="forceConvert">Force convert to visitor rate</Label>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={operationLoading} className="flex-1">
                {operationLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Check-out"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setActiveOperation(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Management</CardTitle>
        <CardDescription>Check-in and check-out operations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Ticket className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Ticket Operations</h3>
          <p className="text-muted-foreground mb-4">Select an operation to process vehicle entry or exit</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => setActiveOperation("checkin")} disabled={isLoading}>
              <Car className="mr-2 h-4 w-4" />
              New Check-in
            </Button>
            <Button variant="outline" onClick={() => setActiveOperation("checkout")} disabled={isLoading}>
              <Clock className="mr-2 h-4 w-4" />
              Process Check-out
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
