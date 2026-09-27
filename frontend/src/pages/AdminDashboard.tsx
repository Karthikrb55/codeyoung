import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { apiClient } from "@/api/client"
import { Users, BookOpen, Clock, Activity, Loader2, Database, ShieldAlert, ArrowUpRight } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get("/admin/stats")
      .then(res => {
        setStats(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const statCards = [
    { title: "Total Bookings", value: stats?.total_bookings || 0, icon: BookOpen, color: "text-primary", bg: "bg-primary/20" },
    { title: "Active Mentors", value: stats?.total_mentors || 0, icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/20" },
    { title: "Upcoming Classes", value: stats?.total_bookings || 0, icon: Clock, color: "text-secondary", bg: "bg-secondary/20" },
    { title: "System Health", value: "99.9%", icon: Activity, color: "text-amber-400", bg: "bg-amber-500/20" },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-12 pb-24 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Operations Control</h1>
            <p className="text-lg text-muted-foreground">Real-time platform metrics and system administration.</p>
          </div>
          <div className="flex gap-4">
            <div className="glass bg-white/5 px-6 py-3 rounded-full flex items-center gap-3 border border-white/10">
              <Database className="w-5 h-5 text-emerald-400" />
              <span className="font-medium text-white text-sm">Database Connected</span>
            </div>
            <div className="glass bg-white/5 px-6 py-3 rounded-full flex items-center gap-3 border border-white/10">
              <span className="relative flex h-3 w-3 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-white text-sm">Live</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, i) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors" />
                  
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center border border-white/10`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-4xl font-bold text-white mb-1">{stat.value}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
              <motion.div variants={itemVariants} className="lg:col-span-2 glass bg-white/5 p-8 rounded-3xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6">Recent Platform Activity</h3>
                <div className="space-y-6">
                  {stats?.recent_bookings?.length > 0 ? (
                    stats.recent_bookings.slice(0, 5).map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-black/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{b.child_name}</p>
                            <p className="text-sm text-muted-foreground">{b.subject} Class</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">Confirmed</p>
                          <p className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent bookings found.
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-6">System Status</h3>
                <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                  <div className="w-24 h-24 rounded-full border-4 border-emerald-500/30 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping"></div>
                    <ShieldAlert className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">All Systems Operational</h4>
                    <p className="text-sm text-muted-foreground">Mentors, booking APIs, and automated assignment algorithms are running perfectly.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
