"use client"

import { useState, useMemo } from "react"
import type React from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Car, MapPin, BarChart3, Ticket, UserCheck, Settings, Loader2, Zap } from "lucide-react"
import { AuthPage } from "@/components/auth/AuthPage"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { ZoneOverview } from "@/components/dashboard/ZoneOverview"
import { ZoneCard } from "@/components/zones/ZoneCard"
import { ZoneManagement } from "@/components/admin/ZoneManagement"
import { TicketManagement } from "@/components/tickets/TicketManagement"
import { SubscriptionManagement } from "@/components/subscriptions/SubscriptionManagement"
import { apiClient } from "@/lib/api"
import type { User, Zone, Gate } from "@/types/parking"

export default function ParkingSystem() {
  const [user, setUser] = useState<User | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [gates, setGates] = useState<Gate[]>([])
  const [selectedGate, setSelectedGate] = useState<string>("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rushHourForm, setRushHourForm] = useState({ weekDay: "", from: "", to: "" })
  const [vacationForm, setVacationForm] = useState({ name: "", from: "", to: "" })
  const [rateForm, setRateForm] = useState({ normalRate: "", specialRate: "" })
  const { toast } = useToast()

  const handleLogin = async (username: string, password: string) => {
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter both username and password",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    console.log("Login attempt:", { username, passwordLength: password.length })

    try {
      const response = await apiClient.login(username, password)
      console.log("Login response:", response)

      if (response.status === "success" && response.data) {
        apiClient.setToken(response.data.token)
        setUser(response.data.user)
        toast({
          title: "Login successful",
          description: "Welcome to WeLink Cargo Parking System",
        })
        await loadInitialData()
      } else {
        toast({
          title: "Login failed",
          description: response.message || "Invalid credentials",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.log("Login error:", error)
      toast({
        title: "Login failed",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (
    username: string,
    password: string,
    confirmPassword: string,
    role: "admin" | "employee",
  ) => {
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (username.length < 3) {
      toast({
        title: "Validation Error",
        description: "Username must be at least 3 characters long",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Validation Error",
        description:"Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    console.log("Registration attempt:", { username, role, passwordLength: password.length })

    try {
      const response = await apiClient.register(username, password, role)
      console.log("Registration response:", response)

      if (response.status === "success") {
        toast({
          title: "Registration successful",
          description: response.data?.message || "Account created successfully. Please sign in.",
        })
      } else {
        toast({
          title: "Registration failed",
          description: response.message || "Unable to create account",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.log("Registration error:", error)
      toast({
        title: "Registration failed",
        description: "Unable to connect to server",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadInitialData = async () => {
    try {
      const [gatesResponse, zonesResponse] = await Promise.all([apiClient.getGates(), apiClient.getZones()])

      if (gatesResponse.status === "success" && gatesResponse.data) {
        setGates(gatesResponse.data)
        if (gatesResponse.data.length > 0) {
          setSelectedGate(gatesResponse.data[0].id)
        }
      }

      if (zonesResponse.status === "success" && zonesResponse.data) {
        setZones(zonesResponse.data)
      }
    } catch (error) {
      console.error("Failed to load initial data:", error)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setZones([])
    setGates([])
    apiClient.setToken("")
    if (ws) {
      ws.close()
      setWs(null)
    }
  }

  const handleToggleZone = async (zoneId: string, isOpen: boolean) => {
    setIsLoading(true)
    try {
      const action = isOpen ? "close" : "open"
      const response = await apiClient.toggleZone(zoneId, action)

      if (response.status === "success") {
        setZones((prev) => prev.map((zone) => (zone.id === zoneId ? { ...zone, open: !isOpen } : zone)))
        toast({
          title: `Zone ${action}ed`,
          description: `Zone has been ${action}ed successfully`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update zone status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddRushHour = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!rushHourForm.weekDay || !rushHourForm.from || !rushHourForm.to) {
      toast({
        title: "Validation Error",
        description: "Please fill in all rush hour fields",
        variant: "destructive",
      })
      return
    }

    const weekDay = Number.parseInt(rushHourForm.weekDay)
    if (weekDay < 0 || weekDay > 6) {
      toast({
        title: "Validation Error",
        description: "Weekday must be between 0 (Sunday) and 6 (Saturday)",
        variant: "destructive",
      })
      return
    }

    if (rushHourForm.from >= rushHourForm.to) {
      toast({
        title: "Validation Error",
        description: "Start time must be before end time",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    console.log("Adding rush hour:", rushHourForm)

    try {
      const response = await apiClient.addRushHour(weekDay, rushHourForm.from, rushHourForm.to)
      console.log("Rush hour response:", response)

      if (response.status === "success") {
        toast({
          title: "Rush hour added",
          description: "Rush hour period has been configured successfully",
        })
        setRushHourForm({ weekDay: "", from: "", to: "" })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add rush hour",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.log("Rush hour error:", error)
      toast({
        title: "Error",
        description: "Failed to add rush hour",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddVacation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!vacationForm.name.trim() || !vacationForm.from || !vacationForm.to) {
      toast({
        title: "Validation Error",
        description: "Please fill in all vacation period fields",
        variant: "destructive",
      })
      return
    }

    if (vacationForm.from >= vacationForm.to) {
      toast({
        title: "Validation Error",
        description: "Start date must be before end date",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    console.log("Adding vacation:", vacationForm)

    try {
      const response = await apiClient.addVacation(vacationForm.name, vacationForm.from, vacationForm.to)
      console.log("Vacation response:", response)

      if (response.status === "success") {
        toast({
          title: "Vacation period added",
          description: "Vacation period has been configured successfully",
        })
        setVacationForm({ name: "", from: "", to: "" })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add vacation period",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.log("Vacation error:", error)
      toast({
        title: "Error",
        description: "Failed to add vacation period",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestAccess = () => {
    const guestUser: User = {
      id: "guest-1",
      username: "Guest",
      role: "employee",
    }
    setUser(guestUser)

    // Set demo zones for guest experience
    const demoZones: Zone[] = [
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

    const demoGates: Gate[] = [
      { id: "gate-1", name: "Main Gate", zoneIds: ["zone-1", "zone-2"], location: "Building A" },
      { id: "gate-2", name: "Side Gate", zoneIds: ["zone-3"], location: "Building B" },
    ]

    setZones(demoZones)
    setGates(demoGates)
    setSelectedGate("gate-1")

    toast({
      title: "Guest Access",
      description: "Welcome! You're now using the demo version of the parking system.",
    })
  }

  const getZoneStatusColor = (zone: Zone) => {
    if (!zone.open) return "bg-muted"
    const occupancyRate = zone.occupied / zone.totalSlots
    if (occupancyRate > 0.8) return "bg-destructive"
    if (occupancyRate > 0.6) return "bg-chart-5"
    return "bg-accent"
  }

  const filteredZones = useMemo(() => {
    if (!selectedGate) return zones
    const selectedGateObj = gates.find((g) => g.id === selectedGate)
    return selectedGateObj ? zones.filter((zone) => selectedGateObj.zoneIds.includes(zone.id)) : zones
  }, [zones, gates, selectedGate])

  if (!user) {
    return (
      <AuthPage
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGuestAccess={handleGuestAccess}
        isLoading={isLoading}
      />
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gaming background with animated particles */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background">
        <div className="absolute inset-0 opacity-20">
          {/* Animated neon grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      </div>

      {/* Header with gaming aesthetics */}
      <motion.header
        className="border-b border-border bg-card/80 backdrop-blur-xl relative z-10 gaming-card"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center neon-glow-hover shadow-xl">
              <Car className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                WeLink Cargo
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Parking Management System
              </p>
            </div>
          </motion.div>
          <div className="flex items-center space-x-4">
            <Badge
              variant="secondary"
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-secondary/20 to-accent/20 border border-secondary/30 neon-glow-hover"
            >
              {user.role === "admin" ? "Administrator" : user.username === "Guest" ? "Guest" : "Employee"}
            </Badge>
            <span className="text-sm font-medium text-foreground">{user.username}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="rounded-2xl border-primary/30 hover:border-primary hover:bg-primary/10 neon-glow-hover transition-all duration-300 bg-transparent cursor-pointer"
            >
              Logout
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content with animations */}
      <main className="container mx-auto px-4 py-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-card/80 backdrop-blur-xl rounded-2xl p-2 border border-border gaming-card">
              <TabsTrigger
                value="dashboard"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground neon-glow-hover transition-all duration-300 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="font-medium md:block  hidden">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger
                value="zones"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground neon-glow-hover transition-all duration-300 cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span className="font-medium md:block  hidden">Zones</span>
              </TabsTrigger>
              <TabsTrigger
                value="tickets"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-accent-foreground neon-glow-hover transition-all duration-300 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span className="font-medium md:block  hidden">Tickets</span>
              </TabsTrigger>
              <TabsTrigger
                value="subscriptions"
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-chart-5 data-[state=active]:text-background neon-glow-hover transition-all duration-300 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span className="font-medium md:block  hidden">Subscriptions</span>
              </TabsTrigger>
              {user.role === "admin" && (
                <TabsTrigger
                  value="admin"
                  className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground neon-glow-hover transition-all duration-300 cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-medium md:block  hidden">Admin</span>
                </TabsTrigger>
              )}
            </TabsList>

            <AnimatePresence mode="wait">
              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <DashboardStats zones={zones} />
                  <ZoneOverview zones={zones} getZoneStatusColor={getZoneStatusColor} />
                </motion.div>
              </TabsContent>

              {/* Zones Tab */}
              <TabsContent value="zones" className="space-y-6">
                <motion.div
                  key="zones"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <Card className="gaming-card rounded-2xl border-border/50">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-foreground">Gate Selection</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Select a gate to view associated zones
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {gates.map((gate) => (
                          <Button
                            key={gate.id}
                            variant={selectedGate === gate.id ? "default" : "outline"}
                            onClick={() => setSelectedGate(gate.id)}
                            className="flex items-center space-x-2 rounded-2xl neon-glow-hover transition-all duration-300 cursor-pointer"
                          >
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium">{gate.name}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredZones.map((zone, index) => (
                      <motion.div
                        key={zone.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <ZoneCard zone={zone} getZoneStatusColor={getZoneStatusColor} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>

              {/* Tickets Tab */}
              <TabsContent value="tickets" className="space-y-6">
                <motion.div
                  key="tickets"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TicketManagement zones={filteredZones} gates={gates} isLoading={isLoading} />
                </motion.div>
              </TabsContent>

              {/* Subscriptions Tab */}
              <TabsContent value="subscriptions" className="space-y-6">
                <motion.div
                  key="subscriptions"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SubscriptionManagement user={user} isLoading={isLoading} />
                </motion.div>
              </TabsContent>

              {/* Admin Tab */}
              {user.role === "admin" && (
                <TabsContent value="admin" className="space-y-6">
                  <motion.div
                    key="admin"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ZoneManagement zones={zones} onToggleZone={handleToggleZone} isLoading={isLoading} />

                      <Card className="gaming-card rounded-2xl border-border/50">
                        <CardHeader>
                          <CardTitle className="text-xl font-bold text-foreground">Rate Management</CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Update parking rates and special pricing
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="normal-rate" className="text-sm font-medium text-foreground">
                                  Normal Rate ($/hr)
                                </Label>
                                <Input
                                  id="normal-rate"
                                  type="number"
                                  step="0.01"
                                  value={rateForm.normalRate}
                                  onChange={(e) => setRateForm((prev) => ({ ...prev, normalRate: e.target.value }))}
                                  placeholder="5.00"
                                  className="rounded-xl border-border/50 bg-input/50 focus:border-primary neon-glow-hover transition-all duration-300"
                                />
                              </div>
                              <div>
                                <Label htmlFor="special-rate" className="text-sm font-medium text-foreground">
                                  Special Rate ($/hr)
                                </Label>
                                <Input
                                  id="special-rate"
                                  type="number"
                                  step="0.01"
                                  value={rateForm.specialRate}
                                  onChange={(e) => setRateForm((prev) => ({ ...prev, specialRate: e.target.value }))}
                                  placeholder="8.00"
                                  className="rounded-xl border-border/50 bg-input/50 focus:border-primary neon-glow-hover transition-all duration-300"
                                />
                              </div>
                            </div>
                            <Button
                              className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 neon-glow-hover transition-all duration-300 cursor-pointer"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                "Update Rates"
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="gaming-card rounded-2xl border-border/50">
                        <CardHeader>
                          <CardTitle className="text-xl font-bold text-foreground">Rush Hours</CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Configure rush hour periods
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleAddRushHour} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="weekday" className="text-sm font-medium text-foreground">
                                  Weekday (0-6)
                                </Label>
                                <Input
                                  id="weekday"
                                  type="number"
                                  min="0"
                                  max="6"
                                  value={rushHourForm.weekDay}
                                  onChange={(e) => setRushHourForm((prev) => ({ ...prev, weekDay: e.target.value }))}
                                  placeholder="1"
                                  required
                                  className="rounded-xl border-border/50 bg-input/50 focus:border-secondary neon-glow-hover transition-all duration-300"
                                />
                              </div>
                              <div>
                                <Label htmlFor="from-time" className="text-sm font-medium text-foreground">
                                  From
                                </Label>
                                <Input
                                  id="from-time"
                                  type="time"
                                  value={rushHourForm.from}
                                  onChange={(e) => setRushHourForm((prev) => ({ ...prev, from: e.target.value }))}
                                  required
                                  className="rounded-xl border-border/50 bg-input/50 focus:border-secondary neon-glow-hover transition-all duration-300"
                                />
                              </div>
                              <div>
                                <Label htmlFor="to-time" className="text-sm font-medium text-foreground">
                                  To
                                </Label>
                                <Input
                                  id="to-time"
                                  type="time"
                                  value={rushHourForm.to}
                                  onChange={(e) => setRushHourForm((prev) => ({ ...prev, to: e.target.value }))}
                                  required
                                  className="rounded-xl border-border/50 bg-input/50 focus:border-secondary neon-glow-hover transition-all duration-300"
                                />
                              </div>
                            </div>
                            <Button
                              type="submit"
                              className="w-full rounded-xl bg-gradient-to-r from-secondary to-accent hover:from-secondary/80 hover:to-accent/80 neon-glow-hover transition-all duration-300 cursor-pointer"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Adding...
                                </>
                              ) : (
                                "Add Rush Hour"
                              )}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>

                      <Card className="gaming-card rounded-2xl border-border/50">
                        <CardHeader>
                          <CardTitle className="text-xl font-bold text-foreground">Vacation Periods</CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Set special pricing for vacation periods
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleAddVacation} className="space-y-4">
                            <div>
                              <Label htmlFor="vacation-name" className="text-sm font-medium text-foreground">
                                Vacation Name
                              </Label>
                              <Input
                                id="vacation-name"
                                value={vacationForm.name}
                                onChange={(e) => setVacationForm((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="Holiday Period"
                                required
                                className="rounded-xl border-border/50 bg-input/50 focus:border-accent neon-glow-hover transition-all duration-300"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="from-date" className="text-sm font-medium text-foreground">
                                  From Date
                                </Label>
                                <Input
                                  id="from-date"
                                  type="date"
                                  value={vacationForm.from}
                                  onChange={(e) => setVacationForm((prev) => ({ ...prev, from: e.target.value }))}
                                  required
                                  className="rounded-xl border-border/50 bg-input/50 focus:border-accent neon-glow-hover transition-all duration-300"
                                />
                              </div>
                              <div>
                                <Label htmlFor="to-date" className="text-sm font-medium text-foreground">
                                  To Date
                                </Label>
                                <Input
                                  id="to-date"
                                  type="date"
                                  value={vacationForm.to}
                                  onChange={(e) => setVacationForm((prev) => ({ ...prev, to: e.target.value }))}
                                  required
                                  className="rounded-xl border-border/50 bg-input/50 focus:border-accent neon-glow-hover transition-all duration-300"
                                />
                              </div>
                            </div>
                            <Button
                              type="submit"
                              className="w-full rounded-xl bg-gradient-to-r from-accent to-chart-5 hover:from-accent/80 hover:to-chart-5/80 neon-glow-hover transition-all duration-300 cursor-pointer"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Adding...
                                </>
                              ) : (
                                "Add Vacation Period"
                              )}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                </TabsContent>
              )}
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}
