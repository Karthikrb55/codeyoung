import { Outlet } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/Navbar"

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary/30 selection:text-primary-foreground">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}
