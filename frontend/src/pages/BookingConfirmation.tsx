import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/api/client"
import { formatInTimeZone } from 'date-fns-tz'
import { CalendarCheck, Video, User, Clock, Globe, GraduationCap, MapPin, CheckCircle2 } from "lucide-react"

export default function BookingConfirmation() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiClient.get(`/bookings/${bookingId}`)
      .then(res => setBooking(res.data))
      .catch(err => {
        console.error(err)
        setError("Unable to load booking details. Please check your email for the confirmation link.")
      })
  }, [bookingId])

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-destructive/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="glass-elevated max-w-md w-full p-8 rounded-3xl text-center border-destructive/20 relative z-10">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-destructive" />
          </div>
          <div className="text-white font-bold text-xl mb-3">Could not load booking</div>
          <p className="text-muted-foreground mb-8 leading-relaxed">{error}</p>
          <Button variant="outline" className="w-full rounded-full h-12" onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="text-muted-foreground font-medium">Preparing your confirmation...</div>
        </div>
      </div>
    )
  }

  // Safe date parsing from previous fix
  const startStr = booking.start_time_utc.endsWith('Z') || booking.start_time_utc.includes('+')
    ? booking.start_time_utc 
    : booking.start_time_utc + 'Z'
  const startUtc = new Date(startStr)
  
  const parentTime = formatInTimeZone(startUtc, booking.parent_timezone, "h:mm a zzz")
  const mentorTime = formatInTimeZone(startUtc, booking.mentor_timezone, "h:mm a zzz")
  const dateStr = formatInTimeZone(startUtc, booking.parent_timezone, "EEEE, MMMM d, yyyy")

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-2xl glass-elevated rounded-[2rem] overflow-hidden relative z-10 border-emerald-500/20"
      >
        <div className="p-8 sm:p-12 text-center border-b border-white/10 bg-gradient-to-b from-emerald-500/10 to-transparent">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2, stiffness: 400, damping: 20 }}
            className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          >
            <CalendarCheck className="h-10 w-10 text-emerald-400" />
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">Trial Class Confirmed</h1>
          <p className="text-emerald-400/80 font-medium text-lg">Your learning adventure is ready to begin.</p>
        </div>

        <div className="p-8 sm:p-12 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass bg-white/5 p-5 rounded-2xl flex items-start gap-4">
              <div className="bg-primary/20 p-2 rounded-xl mt-0.5">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Student</div>
                <div className="font-semibold text-white text-lg">{booking.child_name}</div>
              </div>
            </div>
            
            <div className="glass bg-white/5 p-5 rounded-2xl flex items-start gap-4">
              <div className="bg-secondary/20 p-2 rounded-xl mt-0.5">
                <GraduationCap className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Subject</div>
                <div className="font-semibold text-white text-lg">{booking.subject}</div>
              </div>
            </div>

            <div className="glass bg-white/5 p-5 rounded-2xl flex items-start gap-4">
              <div className="bg-amber-500/20 p-2 rounded-xl mt-0.5">
                <CalendarCheck className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Date</div>
                <div className="font-semibold text-white text-lg">{dateStr}</div>
              </div>
            </div>

            <div className="glass bg-white/5 p-5 rounded-2xl flex items-start gap-4">
              <div className="bg-rose-500/20 p-2 rounded-xl mt-0.5">
                <Clock className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Duration</div>
                <div className="font-semibold text-white text-lg">45 minutes</div>
              </div>
            </div>
          </div>
          
          <div className="glass bg-primary/5 p-6 rounded-2xl border border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="h-6 w-6 text-primary" />
              <h4 className="font-semibold text-white text-lg">Global Time Sync</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
              <div className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-12 bg-white/10"></div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1"><MapPin className="w-5 h-5 text-primary" /></div>
                <div>
                  <span className="text-muted-foreground text-sm block mb-1">Your Local Time</span>
                  <span className="font-bold text-xl text-white block">{parentTime}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1"><MapPin className="w-5 h-5 text-secondary" /></div>
                <div>
                  <span className="text-muted-foreground text-sm block mb-1">Mentor's Time</span>
                  <span className="font-bold text-xl text-white block">{mentorTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/40 p-8 flex flex-col sm:flex-row gap-4">
          <Button 
            className="flex-1 rounded-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1"
            onClick={() => window.open(booking.meeting_url, '_blank')}
          >
            <Video className="h-5 w-5 mr-2" /> Join Live Class
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 rounded-full h-14 border-white/20 hover:bg-white/10 text-white font-medium text-lg"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
