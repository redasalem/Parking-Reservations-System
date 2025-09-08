"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, User, Lock, Sparkles } from "lucide-react"

interface LoginFormProps {
  onSubmit: (username: string, password: string) => Promise<void>
  isLoading: boolean
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const [form, setForm] = useState({ username: "", password: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form.username, form.password)
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Label htmlFor="username" className="text-sm font-semibold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Username
        </Label>
        <Input
          id="username"
          type="text"
          value={form.username}
          onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
          placeholder="Enter your username"
          required
          disabled={isLoading}
          className="rounded-2xl border-border/50 bg-input/50 backdrop-blur-sm focus:border-primary focus:ring-2 focus:ring-primary/20 neon-glow-hover transition-all duration-300 h-12 text-base"
        />
      </motion.div>

      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Label htmlFor="password" className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Lock className="w-4 h-4 text-secondary" />
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          placeholder="Enter your password"
          required
          disabled={isLoading}
          className="rounded-2xl border-border/50 bg-input/50 backdrop-blur-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20 neon-glow-hover transition-all duration-300 h-12 text-base"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Button
          type="submit"
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-secondary hover:from-primary/80 hover:via-primary/70 hover:to-secondary/80 text-primary-foreground font-semibold text-base shadow-xl neon-glow-hover transition-all duration-300 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
          disabled={isLoading}
        >
          {isLoading ? (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Signing In...</span>
            </motion.div>
          ) : (
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Sparkles className="h-5 w-5" />
              <span>Sign In</span>
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Demo credentials hint */}
      <motion.div
        className="text-center text-xs text-muted-foreground/80 bg-muted/20 rounded-xl p-3 border border-border/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className="font-medium mb-1">Demo Credentials:</p>
        <p>
          Admin: <span className="text-primary font-mono">admin / admin</span>
        </p>
        <p>
          Employee: <span className="text-secondary font-mono">employee / employee</span>
        </p>
      </motion.div>
    </motion.form>
  )
}
