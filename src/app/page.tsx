"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-slate-950/5 dark:from-slate-950 dark:via-slate-950 dark:to-black">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        {/* Top nav */}
        <header className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              ST
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">
                SynergyTech CRM
              </span>
              <span className="text-xs text-muted-foreground">
                Multi-tenant CRM for serious teams
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/app">
              <Button size="sm" className="hidden sm:inline-flex">
                Dashboard
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="grid flex-1 gap-10 py-10 md:grid-cols-[ minmax(0,1.1fr)_minmax(0,0.9fr) ] md:py-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-medium text-emerald-500">
                ●
              </span>
              Built for multi-tenant, role-based teams
            </div>

            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                CRM that keeps{" "}
                <span className="bg-linear-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                  every interaction
                </span>{" "}
                accountable.
              </h1>
              <p className="max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
                SynergyTech CRM gives your team shared access to clients and
                leads, strict role-based permissions, and a complete audit
                trail—so nothing falls through the cracks and compliance is
                built-in.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg">Start 14-day trial</Button>
              <Button variant="outline" size="lg">
                Talk to sales
              </Button>
              <span className="text-xs text-muted-foreground">
                No credit card required · Cancel anytime
              </span>
            </div>

            <dl className="grid max-w-xl gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Shared access
                </dt>
                <dd className="mt-1 font-medium">One workspace, many teams</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Permissions
                </dt>
                <dd className="mt-1 font-medium">Granular roles &amp; rules</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Compliance
                </dt>
                <dd className="mt-1 font-medium">Full audit history</dd>
              </div>
            </dl>
          </div>

          {/* Right side - product highlights */}
          <div className="flex items-stretch">
            <Card className="relative w-full border-muted-foreground/10 bg-background/80 shadow-lg backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold">
                    Team activity overview
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Every call, email, and meeting in one shared timeline.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Live feed
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="rounded-md border border-border/60 bg-muted/60 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Shared client access</span>
                    <span className="text-[10px] text-muted-foreground">
                      Multi-tenant
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    Sales, success, and support see one unified record of every
                    interaction with a client or lead.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2 rounded-md border border-border/60 bg-background/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold">
                        Role-based permissions
                      </span>
                      <Badge className="text-[10px]">Admin</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Control who can view, edit, or export sensitive client
                      data across tenants.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px]">
                        Owner
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        Manager
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        Contributor
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        Read-only
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-md border border-border/60 bg-background/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold">
                        Automatic follow-ups
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        Reminders
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Schedule follow-up rules that trigger tasks and emails
                      based on interaction outcomes.
                    </p>
                    <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                      <li>· No response after 3 days → reminder</li>
                      <li>· Closed-won deal → handoff to success</li>
                      <li>· Missed meeting → auto-reschedule email</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2 rounded-md border border-dashed border-emerald-500/40 bg-emerald-500/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">
                      Audit-ready history
                    </span>
                    <span className="text-[10px] text-emerald-500">
                      Immutable log
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Every field change, user action, and permission update is
                    captured with who, what, and when—perfect for regulated
                    teams.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Feature grid */}
        <section className="mt-4 space-y-6 border-t border-border/60 pt-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                Built for how modern teams actually work.
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                SynergyTech CRM is designed for organizations that need shared
                visibility, strict controls, and a trustworthy system of record
                across multiple clients and business units.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              <span>Enterprise-ready · SOC2-friendly workflows</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Shared access to clients &amp; leads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Centralize all client and lead data in one secure, multi-tenant
                  workspace that every team can rely on.
                </p>
                <ul className="space-y-1 text-xs">
                  <li>· Unified profiles across sales, success, and support</li>
                  <li>· Real-time activity timelines</li>
                  <li>· Smart search and saved views</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Strict role-based permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Define exactly who can access, edit, or export data with
                  fine-grained roles that match your org chart.
                </p>
                <ul className="space-y-1 text-xs">
                  <li>· Tenant-level isolation</li>
                  <li>· Role &amp; team-based rules</li>
                  <li>· Approval flows for sensitive actions</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Full interaction tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Capture every call, email, meeting, and note in a single,
                  searchable history for each relationship.
                </p>
                <ul className="space-y-1 text-xs">
                  <li>· Email sync &amp; calendar integration</li>
                  <li>· Call outcomes &amp; meeting notes</li>
                  <li>· Custom interaction types</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Automatic follow-up reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Stay ahead of every relationship with rules-based reminders
                  that surface what needs attention today.
                </p>
                <ul className="space-y-1 text-xs">
                  <li>· Outcome-based follow-up sequences</li>
                  <li>· Task queues by owner or team</li>
                  <li>· Notifications in email &amp; chat</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Full audit history
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Every change to records, permissions, and configuration is
                  logged for complete traceability.
                </p>
                <ul className="space-y-1 text-xs">
                  <li>· Field-level change tracking</li>
                  <li>· User &amp; timestamp metadata</li>
                  <li>· Exportable audit reports</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Admin control over users &amp; roles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Give admins the tools they need to safely manage tenants,
                  teams, users, and permissions at scale.
                </p>
                <ul className="space-y-1 text-xs">
                  <li>· Centralized user &amp; role management</li>
                  <li>· SSO &amp; SCIM-friendly design</li>
                  <li>· Policy-based access templates</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-10 rounded-2xl border border-border/70 bg-linear-to-r from-primary/10 via-primary/5 to-emerald-500/5 px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                Ready to make your CRM a system of record everyone trusts?
              </h3>
              <p className="max-w-xl text-sm text-muted-foreground">
                See how SynergyTech CRM can give your team shared visibility,
                predictable follow-ups, and the auditability your leadership and
                compliance teams expect.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" className="px-4">
                Book a live demo
              </Button>
              <Button variant="outline" size="sm" className="px-4">
                Explore pricing
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
