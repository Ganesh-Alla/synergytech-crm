"use client"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useUserStore } from "@/store/userStore"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-slate-950/5 dark:from-slate-950 dark:via-slate-950 dark:to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="border-border/70">
        <Link href="/">
          <CardHeader className="border-b border-border/60">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-xl">Sign in to SynergyTech CRM</CardTitle>
                <CardDescription className="mt-1">
                  Choose your role to access the right workspace experience.
                </CardDescription>
              </div>
              <CardAction>
                <Badge variant="outline" className="text-[10px]">
                  Multi-tenant
                </Badge>
              </CardAction>
            </div>
          </CardHeader>
        </Link>
          <CardContent className="pt-6 space-y-6">
            <Tabs defaultValue="executive" className="space-y-4">
              <TabsList className="w-full">
                <TabsTrigger value="executive" className="flex-1 text-xs">
                  Executive
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex-1 text-xs">
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="executive" className="space-y-4">
                <p className="text-[11px] text-muted-foreground">
                  Executives have read-first access to dashboards, tenants, and
                  key accounts without changing day-to-day workflows.
                </p>
                <LoginForm roleLabel="Executive" />
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <p className="text-[11px] text-muted-foreground">
                  Admins can configure tenants, manage users &amp; roles, and
                  enforce security policies across workspaces.
                </p>
                <LoginForm roleLabel="admin" />
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="mt-2 border-t border-border/60 pt-4 justify-between text-xs text-muted-foreground">
            <span>Need a SynergyTech CRM account?</span>
            <Link
              href="/"
              className="font-medium text-primary hover:underline"
            >
              Talk to sales
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

type LoginFormProps = {
  roleLabel: string
}

function LoginForm({ roleLabel }: LoginFormProps) {
  const { signInWithEmail, signinLoading } = useUserStore()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await signInWithEmail(email, password, roleLabel as "executive" | "admin")
      toast.success("Login successful")
      router.push("/app")
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Login failed")
  }
  }
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5 text-sm">
        <label
          htmlFor={`email-${roleLabel.toLowerCase()}`}
          className="block text-xs font-medium text-muted-foreground"
        >
          Work email
        </label>
        <input
          id={`email-${roleLabel.toLowerCase()}`}
          type="email"
          autoComplete="email"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="you@company.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between text-xs">
          <label
            htmlFor={`password-${roleLabel.toLowerCase()}`}
            className="font-medium text-muted-foreground"
          >
            Password
          </label>
          <button
            type="button"
            className="text-[11px] font-medium text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <input
          id={`password-${roleLabel.toLowerCase()}`}
          type="password"
          autoComplete="current-password"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-3 w-3 rounded border border-input bg-background text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <span>Remember this device</span>
        </label>
        <span className="text-[10px]">
          SSO available on Enterprise plans
        </span>
      </div>

      <Button type="submit" className="w-full mt-2" disabled={signinLoading}>
          Continue as {roleLabel}
          {signinLoading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
        </Button>
      </form>
    )
}


