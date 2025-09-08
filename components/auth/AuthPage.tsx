"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Car, Users, Zap, Shield } from "lucide-react"
import { LoginForm } from "./LoginForm"
import { RegisterForm } from "./RegisterForm"

interface AuthPageProps {
  onLogin: (username: string, password: string) => Promise<void>
  onRegister: (username: string, password: string, confirmPassword: string, role: "admin" | "employee") => Promise<void>
  onGuestAccess: () => void
  isLoading: boolean
}

export function AuthPage({ onLogin, onRegister, onGuestAccess, isLoading }: AuthPageProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

  const handleRegisterSuccess = async (
    username: string,
    password: string,
    confirmPassword: string,
    role: "admin" | "employee",
  ) => {
    await onRegister(username, password, confirmPassword, role)
    // Switch to login tab after successful registration
    setAuthMode("login")
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
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
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Floating car icons with enhanced neon glow and animations
        <motion.div
          className="absolute top-10 left-10 text-6xl text-primary neon-glow"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          🚗
        </motion.div>
        <motion.div
          className="absolute top-32 right-20 text-4xl text-secondary neon-glow"
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 3, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 }}
        >
          🚙
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-32 text-5xl text-accent neon-glow"
          animate={{
            y: [0, -25, 0],
            rotate: [0, 8, -8, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 2 }}
        >
          🚕
        </motion.div>
        <motion.div
          className="absolute bottom-32 right-10 text-4xl text-chart-5 neon-glow"
          animate={{
            y: [0, 18, 0],
            rotate: [0, -6, 6, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
        >
          🚐
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-10 text-primary"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          🅿️
        </motion.div> */}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="gaming-card rounded-3xl border-border/50 backdrop-blur-xl bg-card/90 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <motion.div
              className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-primary via-secondary to-accent rounded-3xl flex items-center justify-center neon-glow shadow-2xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Car className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <CardTitle className="text-3xl font-bold text-foreground mb-2 neon-glow">WeLink Cargo</CardTitle>
              <CardDescription className="text-muted-foreground flex items-center justify-center gap-2 mt-4">
                <Zap className="w-4 h-4 text-primary" />
                Parking Reservation System
                <Shield className="w-4 h-4 text-secondary" />
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs
              value={authMode}
              onValueChange={(value) => setAuthMode(value as "login" | "register")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 backdrop-blur-sm rounded-2xl p-1 border border-border/30">
                <TabsTrigger
                  value="login"
                  className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg neon-glow-hover transition-all duration-300 font-medium"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-xl data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-lg neon-glow-hover transition-all duration-300 font-medium"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="login" className="space-y-4 mt-6">
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LoginForm onSubmit={onLogin} isLoading={isLoading} />
                  </motion.div>
                </TabsContent>

                <TabsContent value="register" className="space-y-4 mt-6">
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RegisterForm onSubmit={handleRegisterSuccess} isLoading={isLoading} />
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>

            <motion.div
              className="pt-6 border-t border-border/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                variant="outline"
                className="w-full bg-gradient-to-r from-accent/10 to-chart-5/10 border-accent/30 hover:border-accent hover:bg-accent/20 rounded-2xl neon-glow-hover transition-all duration-300 font-medium"
                onClick={onGuestAccess}
                disabled={isLoading}
              >
                <Users className="w-5 h-5 mr-2 text-accent" />
                Continue as Guest
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3 opacity-80">
                Access the system without registration for demo purposes
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
