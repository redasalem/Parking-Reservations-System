"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { UserCheck, Users, Clock, CheckCircle } from "lucide-react"
import { apiClient } from "@/lib/api"
import type { User } from "@/types/parking"

interface Subscription {
  id: string
  userId: string
  category: string
  active: boolean
  startDate: string
  endDate: string
  currentCheckins: Array<{
    ticketId: string
    zoneId: string
    checkinAt: string
  }>
}

interface SubscriptionManagementProps {
  user: User
  isLoading: boolean
}

export function SubscriptionManagement({ user, isLoading }: SubscriptionManagementProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getSubscriptions()
      if (response.status === "success" && response.data) {
        setSubscriptions(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subscriptions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (subscription: Subscription) => {
    if (!subscription.active) return "bg-gray-500"
    if (subscription.currentCheckins.length > 0) return "bg-green-500"
    return "bg-blue-500"
  }

  const getStatusText = (subscription: Subscription) => {
    if (!subscription.active) return "Inactive"
    if (subscription.currentCheckins.length > 0) return "Checked In"
    return "Active"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5" />
            <span>Subscription Management</span>
          </CardTitle>
          <CardDescription>View and manage parking subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading subscriptions...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Subscriptions</h3>
              <p className="text-muted-foreground mb-4">No active subscriptions found in the system</p>
              {user.role === "admin" && <Button>Create New Subscription</Button>}
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(subscription)}`} />
                      <span className="font-medium">Subscription {subscription.id}</span>
                      <Badge variant="outline">{subscription.category}</Badge>
                    </div>
                    <Badge variant={subscription.active ? "default" : "secondary"}>{getStatusText(subscription)}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        Valid: {subscription.startDate} to {subscription.endDate}
                      </span>
                    </div>
                    {subscription.currentCheckins.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Currently parked in {subscription.currentCheckins.length} zone(s)</span>
                      </div>
                    )}
                  </div>

                  {subscription.currentCheckins.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Current Check-ins:</p>
                      {subscription.currentCheckins.map((checkin, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          Zone {checkin.zoneId} - Ticket {checkin.ticketId}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
