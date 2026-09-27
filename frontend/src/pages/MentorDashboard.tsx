import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { apiClient } from "@/api/client"
import { MapPin, Loader2, ShieldCheck, CalendarRange } from "lucide-react"

export default function MentorDashboard() {
  const [mentors, setMentors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get("/mentors")
      .then(res => {
        setMentors(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-12 pb-24 px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Mentor Portal</h1>
            <p className="text-lg text-muted-foreground">Select a mentor profile below to simulate their daily dashboard.</p>
          </div>
          <div className="glass bg-white/5 px-6 py-3 rounded-full flex items-center gap-3 border border-white/10">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="font-medium text-white text-sm">Secure Access Simulator</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {mentors.map((m) => (
              <motion.div 
                key={m.id} 
                variants={cardVariants}
                className="group relative glass-card p-6 rounded-3xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/5"
                style={{
                  perspective: "1000px",
                }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                        <span className="font-bold text-lg text-primary">{m.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{m.name}</h3>
                        <p className="text-sm text-muted-foreground">Senior Educator</p>
                      </div>
                    </div>
                    <div className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                      Max {m.max_daily_classes} Classes/Day
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <MapPin className="w-4 h-4" /> Timezone
                      </div>
                      <div className="font-medium text-white text-sm truncate" title={m.timezone}>
                        {m.timezone.split('/')[1]?.replace('_', ' ') || m.timezone}
                      </div>
                    </div>
                    <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <CalendarRange className="w-4 h-4" /> Capacity
                      </div>
                      <div className="font-medium text-white text-sm">
                        Available Today
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 text-sm text-muted-foreground leading-relaxed">
                    The assignment algorithm enforces a strict limit of <span className="text-white font-medium">{m.max_daily_classes} trial classes</span> per calendar day, precisely calculated in <span className="text-white font-medium">{m.timezone}</span>.
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
