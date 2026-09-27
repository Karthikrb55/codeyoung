import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { GlobeScene } from "@/components/Globe"
import { ArrowRight, Globe2, Clock, Users } from "lucide-react"

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center pt-20 overflow-hidden">
      {/* 3D Background */}
      <GlobeScene />

      {/* Hero Content */}
      <div className="container mx-auto px-4 relative z-10 py-20 flex-1 flex flex-col justify-center">
        <motion.div 
          className="max-w-4xl mx-auto text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-sm text-sm font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Now connecting students globally
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 drop-shadow-sm"
          >
            Your Child's Next Learning <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Adventure Starts Here.
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Book a personalized 1:1 trial class with an expert mentor — at a time that works for your family, anywhere in the world.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Link 
              to="/book"
              className="group relative flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full overflow-hidden shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(99,102,241,0.6)]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center gap-2">
                Book a Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <Link 
              to="/mentor"
              className="group flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-full border border-white/10 backdrop-blur-sm transition-all"
            >
              Explore Mentors
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 max-w-3xl mx-auto"
          >
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-3 transform transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="font-semibold text-white text-lg">10 Expert Mentors</div>
              <div className="text-sm text-muted-foreground text-center">Top 1% educators</div>
            </div>

            <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-3 transform transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Globe2 className="w-6 h-6 text-secondary" />
              </div>
              <div className="font-semibold text-white text-lg">Global Time Zones</div>
              <div className="text-sm text-muted-foreground text-center">Auto-syncs local time</div>
            </div>

            <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-3 transform transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="font-semibold text-white text-lg">45-Minute 1:1 Classes</div>
              <div className="text-sm text-muted-foreground text-center">Personalized learning</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Subtle Gradient Overlay at bottom for seamless scroll if page extends */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  )
}
