import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { apiClient } from "@/api/client"
import { Video, Mic, MicOff, VideoOff, PhoneOff, User, Settings, Users, MonitorUp } from "lucide-react"

export default function DemoClass() {
  const { bookingId } = useParams()
  const [booking, setBooking] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)

  useEffect(() => {
    apiClient.get(`/bookings/${bookingId}`)
      .then(res => setBooking(res.data))
      .catch(err => {
        console.error(err)
        setError("Unable to load meeting details.")
      })
  }, [bookingId])

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background p-4 relative">
        <div className="glass-elevated max-w-md w-full p-8 rounded-3xl text-center border-destructive/20 text-destructive">
          <PhoneOff className="w-12 h-12 mx-auto mb-4" />
          <p className="font-medium text-lg">{error}</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="text-white font-medium">Connecting to secure classroom...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#030407] p-4 flex flex-col relative overflow-hidden">
      {/* Top Bar */}
      <div className="glass bg-white/5 rounded-2xl p-4 flex items-center justify-between mb-4 border border-white/10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
            <Video className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-white font-bold">{booking.subject} Masterclass</h2>
            <p className="text-xs text-muted-foreground">ID: {booking.id.split('-')[0]}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            00:00
          </div>
          <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Users className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
        <div className="md:col-span-3 bg-black/60 rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-50" />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="w-32 h-32 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
              <User className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Mentor (Waiting)</h3>
            <p className="text-muted-foreground">The mentor will join shortly</p>
          </motion.div>

          {/* Self View Floating */}
          <div className="absolute bottom-6 right-6 w-48 h-32 bg-zinc-900 rounded-2xl border border-white/20 overflow-hidden shadow-2xl flex items-center justify-center">
            {camOn ? (
              <div className="text-white font-medium text-sm flex flex-col items-center gap-2">
                <User className="w-6 h-6 text-muted-foreground" />
                {booking.child_name}
              </div>
            ) : (
              <div className="bg-zinc-800 w-full h-full flex items-center justify-center">
                <VideoOff className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white font-medium backdrop-blur-md">
              {booking.child_name} (You)
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden md:flex flex-col gap-4">
          <div className="flex-1 glass bg-white/5 rounded-3xl border border-white/10 p-6 flex flex-col">
            <h3 className="font-semibold text-white mb-4">Class Details</h3>
            <div className="space-y-4">
              <div className="bg-black/30 p-4 rounded-2xl">
                <div className="text-xs text-muted-foreground mb-1">Student</div>
                <div className="text-sm font-medium text-white">{booking.child_name}</div>
                <div className="text-xs text-muted-foreground mt-1">Age {booking.child_age}</div>
              </div>
              <div className="bg-black/30 p-4 rounded-2xl">
                <div className="text-xs text-muted-foreground mb-1">Parent</div>
                <div className="text-sm font-medium text-white">{booking.parent_name}</div>
                <div className="text-xs text-muted-foreground mt-1 truncate">{booking.parent_email}</div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-center text-sm text-muted-foreground px-4">
                  This is a simulated classroom environment for the TrialFlow platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="mt-4 glass bg-white/5 rounded-3xl p-4 border border-white/10 flex items-center justify-center gap-4 relative z-10">
        <button 
          onClick={() => setMicOn(!micOn)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
            micOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/50'
          }`}
        >
          {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>
        
        <button 
          onClick={() => setCamOn(!camOn)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
            camOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/50'
          }`}
        >
          {camOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>
        
        <button className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hidden sm:flex">
          <MonitorUp className="w-6 h-6" />
        </button>

        <button className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hidden sm:flex">
          <Settings className="w-6 h-6" />
        </button>
        
        <div className="w-px h-8 bg-white/10 mx-2" />
        
        <button 
          onClick={() => window.close()}
          className="px-8 h-14 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all hover:scale-105"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="hidden sm:inline">Leave Class</span>
        </button>
      </div>
    </div>
  )
}
