import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Menu, X, ChevronRight } from "lucide-react"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Mentors", path: "/mentor" },
    { name: "Admin", path: "/admin" },
  ]

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-background/80 backdrop-blur-md border-b border-white/10 shadow-lg" 
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 border border-primary/50 group-hover:bg-primary/30 transition-colors">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Trial<span className="text-primary">Flow</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-1 py-2 transition-colors hover:text-primary ${
                    location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/book"
                className="group relative inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white transition-all rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
              >
                <span>Book a Trial</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </nav>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-muted-foreground hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-20 px-4 md:hidden flex flex-col"
          >
            <div className="flex flex-col gap-4 text-lg font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`p-4 rounded-xl border ${
                    location.pathname === link.path 
                      ? "bg-primary/10 border-primary/30 text-primary" 
                      : "border-white/5 text-muted-foreground hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="mt-auto pb-8 pt-4">
              <Link 
                to="/book"
                className="flex items-center justify-center w-full gap-2 p-4 text-lg font-medium text-white rounded-xl bg-primary shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              >
                <span>Book a Free Trial</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
