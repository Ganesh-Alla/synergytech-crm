"use client"

import { useEffect, useMemo } from "react"
import { RefreshCw, Calendar, User, Mail, Phone, Building2 } from "lucide-react"
import { Main } from "@/components/dashboard/main"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useClientsStore } from "@/store/clientsStore"
import { Badge } from "@/components/ui/badge"

const FollowUpsPage = () => {
  const { clients, loadClients, clientsLoading } = useClientsStore()

  useEffect(() => {
    loadClients().catch(console.error)
  }, [loadClients])

  // Format follow-up date helper
  const formatFollowUpDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Filter and sort clients by follow-up date
  const clientsWithFollowUps = useMemo(() => {
    if (!clients) return []
    
    return clients
      .filter((client) => client.next_follow_up_at !== null)
      .sort((a, b) => {
        if (!a.next_follow_up_at || !b.next_follow_up_at) return 0
        return new Date(a.next_follow_up_at).getTime() - new Date(b.next_follow_up_at).getTime()
      })
  }, [clients])

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Follow Ups</h2>
          <p className='text-muted-foreground'>
            Clients with scheduled follow-up dates.
          </p>
        </div>
        <Button 
          variant='outline' 
          size='icon' 
          onClick={() => {
            loadClients(true).catch(console.error)
          }}
        >
          <RefreshCw size={18} className={clientsLoading ? "animate-spin" : ""} />
        </Button>
      </div>

      {clientsLoading && clients === null ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading follow-ups...
        </div>
      ) : clientsWithFollowUps.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No follow-ups scheduled.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientsWithFollowUps.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-2">
                      {client.company_name || client.contact_name}
                    </CardTitle>
                    {client.company_name && (
                      <p className="text-sm text-muted-foreground">
                        {client.contact_name}
                      </p>
                    )}
                  </div>
                  {client.next_follow_up_at && (
                    <Badge variant="outline" className="ml-2 shrink-0">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatFollowUpDate(client.next_follow_up_at)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href={`mailto:${client.contact_email}`}
                    className="text-primary hover:underline truncate"
                  >
                    {client.contact_email}
                  </a>
                </div>
                
                {client.contact_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a
                      href={`tel:${client.contact_phone}`}
                      className="text-primary hover:underline"
                    >
                      {client.contact_phone}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Code:</span>
                  <span className="font-medium">{client.client_code}</span>
                </div>

                {client.industry && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Badge variant="secondary" className="text-xs">
                      {client.industry}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Main>
  )
}

export default FollowUpsPage