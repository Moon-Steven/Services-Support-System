'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type ClientInfo = {
  id: string
  name: string
  industry: string
  grade: string
}

type ClientContextType = {
  client: ClientInfo | null
  setClient: (client: ClientInfo | null) => void
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function ClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ClientInfo | null>(null)

  return (
    <ClientContext.Provider value={{ client, setClient }}>
      {children}
    </ClientContext.Provider>
  )
}

export function useClient() {
  const context = useContext(ClientContext)
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider')
  }
  return context
}
