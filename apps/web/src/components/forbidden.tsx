"use client"

import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@web/components/ui/button"

export function Forbidden() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        403 - Akses Ditolak
      </h1>
      <p className="mt-4 text-muted-foreground max-w-md mx-auto">
        Maaf, Anda tidak memiliki izin yang diperlukan untuk mengakses halaman ini. 
        Hubungi administrator jika Anda merasa ini adalah sebuah kesalahan.
      </p>
      <div className="mt-8 flex gap-4 justify-center">
        <Button asChild variant="outline">
          <Link href="/dashboard">Kembali ke Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
