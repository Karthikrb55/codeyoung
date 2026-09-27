import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, addDays } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/api/client"
import { CalendarX, Loader2, User, Mail, GraduationCap, MapPin, CalendarDays, Clock, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react"

const parentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  childName: z.string().min(2, "Child's name is required"),
  childAge: z.coerce.number().min(4, "Must be at least 4").max(18, "Must be under 18"),
  subject: z.string().min(1, "Please select a subject"),
})

export default function BookingFlow() {
  const [step, setStep] = useState(1)
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [slots, setSlots] = useState<{start: string, end: string, displayTime: string}[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  
  const { toast } = useToast()
  const navigate = useNavigate()

  const form = useForm({
    resolver: zodResolver(parentSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      childName: "",
      childAge: "",
      subject: "Coding"
    }
  })

  const loadSlots = async () => {
    setLoadingSlots(true)
    setSelectedSlot(null)
    try {
      const subject = form.getValues("subject")
      const res = await apiClient.get(`/availability?date=${selectedDate}&timezone=${timezone}&subject=${subject}`)
      setSlots(res.data.slots)
    } catch {
      toast({ title: "Error loading slots", description: "Could not fetch availability", variant: "destructive" })
    } finally {
      setLoadingSlots(false)
    }
  }

  useEffect(() => {
    if (step === 3) {
      loadSlots()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedDate, timezone])

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await form.trigger()
      if (isValid) setStep(2)
    } else if (step === 2) {
      if (timezone) setStep(3)
    }
  }

  const handleBook = async () => {
    if (!selectedSlot) return
    setIsBooking(true)
    try {
      const data = form.getValues()
      const req = {
        parent: {
          name: data.name,
          email: data.email,
          childName: data.childName,
          childAge: data.childAge,
          timezone: timezone
        },
        subject: data.subject,
        startTime: selectedSlot
      }
      const res = await apiClient.post("/bookings", req)
      navigate(`/confirmation/${res.data.id}`)
    } catch (err: any) {
      let errorDesc = "Something went wrong"
      const detail = err.response?.data?.detail
      
      if (!err.response) {
        errorDesc = "Unable to connect to the booking service. Please try again."
      } else if (err.response.status === 409) {
        errorDesc = "This time slot is no longer available. Please choose another time."
      } else if (typeof detail === 'string') {
        errorDesc = detail
      } else if (Array.isArray(detail)) {
        errorDesc = detail[0]?.msg || "Validation error"
      }
      
      toast({
        title: "Booking Failed",
        description: errorDesc,
        variant: "destructive"
      })
      if (err.response?.status === 409) {
        loadSlots()
      }
    } finally {
      setIsBooking(false)
    }
  }

  const dates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i))

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-3xl z-10">
        {/* Stepper */}
        <div className="mb-12 relative flex justify-between">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-white/5 -z-10"></div>
          <motion.div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-primary to-secondary -z-10"
            initial={{ width: "0%" }}
            animate={{ width: `${((step - 1) / 2) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          ></motion.div>
          
          {[
            { num: 1, label: "Details" },
            { num: 2, label: "Timezone" },
            { num: 3, label: "Select Time" }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-3 bg-background px-4">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 shadow-xl ${
                  step > s.num ? "bg-primary text-white shadow-primary/20" : 
                  step === s.num ? "bg-card border-2 border-primary text-white shadow-primary/20" : 
                  "bg-card border-2 border-white/10 text-muted-foreground"
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
              </div>
              <span className={`text-sm font-medium tracking-wide ${step >= s.num ? "text-white" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Wizard Card */}
        <div className="glass-elevated rounded-3xl overflow-hidden relative">
          <div className="p-8 sm:p-12">
            
            <div className="mb-8 space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                {step === 1 && "Tell us about your child"}
                {step === 2 && "Confirm your timezone"}
                {step === 3 && "Choose a trial time"}
              </h2>
              <p className="text-muted-foreground text-lg">
                {step === 1 && "We'll use this to match you with the perfect mentor."}
                {step === 2 && "This ensures we show class times correctly for your location."}
                {step === 3 && (
                  <span className="flex items-center gap-2 mt-1 text-primary">
                    <MapPin className="w-4 h-4" /> {timezone}
                  </span>
                )}
              </p>
            </div>

            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-muted-foreground"><User className="w-4 h-4"/> Parent Name</Label>
                        <Input {...form.register("name")} placeholder="Jane Doe" className="h-12 bg-black/20 border-white/10 focus-visible:ring-primary text-lg" />
                        {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                      </div>
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4"/> Email</Label>
                        <Input {...form.register("email")} type="email" placeholder="jane@example.com" className="h-12 bg-black/20 border-white/10 focus-visible:ring-primary text-lg" />
                        {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-muted-foreground"><User className="w-4 h-4"/> Child's Name</Label>
                        <Input {...form.register("childName")} placeholder="Jimmy" className="h-12 bg-black/20 border-white/10 focus-visible:ring-primary text-lg" />
                        {form.formState.errors.childName && <p className="text-sm text-destructive">{form.formState.errors.childName.message}</p>}
                      </div>
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="w-4 h-4"/> Child's Age</Label>
                        <Input {...form.register("childAge")} type="number" min={4} max={18} className="h-12 bg-black/20 border-white/10 focus-visible:ring-primary text-lg" />
                        {form.formState.errors.childAge && <p className="text-sm text-destructive">{form.formState.errors.childAge.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-muted-foreground"><GraduationCap className="w-4 h-4"/> Subject</Label>
                      <Select onValueChange={(v: string) => form.setValue("subject", v)} defaultValue={form.getValues("subject")}>
                        <SelectTrigger className="h-12 bg-black/20 border-white/10 focus:ring-primary text-lg"><SelectValue placeholder="Select a subject" /></SelectTrigger>
                        <SelectContent className="bg-popover border-white/10 text-white">
                          <SelectItem value="Coding">Coding</SelectItem>
                          <SelectItem value="Math">Math</SelectItem>
                          <SelectItem value="AI">AI</SelectItem>
                          <SelectItem value="Web Development">Web Development</SelectItem>
                          <SelectItem value="Scratch">Scratch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-8">
                    <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 flex items-start gap-4 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]">
                      <div className="bg-primary/20 p-2 rounded-full mt-1 shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white">Auto-detected Timezone</p>
                        <p className="text-muted-foreground mt-1 leading-relaxed">We've detected your timezone based on your device. All available slots will automatically convert to this local time.</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-muted-foreground text-base">Your Location</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger className="h-14 bg-black/20 border-white/10 focus:ring-primary text-lg"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover border-white/10 text-white">
                          <SelectItem value="America/New_York">Eastern Time (America/New_York)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (America/Chicago)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (America/Denver)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</SelectItem>
                          <SelectItem value="Europe/London">UK Time (Europe/London)</SelectItem>
                          <SelectItem value="Asia/Kolkata">India Standard Time (Asia/Kolkata)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="space-y-8">
                    {/* Date Selector */}
                    <div className="flex space-x-3 overflow-x-auto pb-4 snap-x scrollbar-thin">
                      {dates.map(d => {
                        const dateStr = format(d, "yyyy-MM-dd")
                        const isSelected = selectedDate === dateStr
                        return (
                          <button 
                            key={dateStr}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`flex flex-col items-center justify-center py-4 px-6 min-w-[100px] snap-center rounded-2xl transition-all duration-300 ${
                              isSelected 
                                ? 'bg-primary border border-primary/50 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105' 
                                : 'bg-black/20 border border-white/5 hover:border-white/20 hover:bg-black/40'
                            }`}
                          >
                            <span className={`text-xs font-semibold uppercase tracking-widest ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                              {format(d, "EEE")}
                            </span>
                            <span className={`text-xl font-bold mt-1 ${isSelected ? 'text-white' : 'text-white/90'}`}>
                              {format(d, "MMM d")}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {loadingSlots ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse border border-white/5" />
                        ))}
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="py-16 text-center border-2 border-dashed border-white/10 rounded-2xl bg-black/20 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                          <CalendarX className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No slots available</h3>
                        <p className="text-muted-foreground mb-8 max-w-sm">Our mentors are fully booked on this date. Please check another day for availability.</p>
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="rounded-full border-white/20 hover:bg-white/10"
                          onClick={() => {
                            const nextDay = addDays(new Date(selectedDate + "T12:00:00"), 1)
                            setSelectedDate(format(nextDay, "yyyy-MM-dd"))
                          }}
                        >
                          Check Next Day
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                        {slots.map((s) => {
                          const isSelected = selectedSlot === s.start
                          return (
                            <button 
                              key={s.start}
                              disabled={isBooking}
                              onClick={() => setSelectedSlot(s.start)}
                              className={`relative overflow-hidden flex items-center justify-center h-16 text-lg font-medium rounded-xl transition-all duration-300 ${
                                isSelected 
                                  ? 'bg-primary/20 border-2 border-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.2)] scale-105' 
                                  : 'bg-black/20 border border-white/10 text-white/80 hover:border-white/30 hover:bg-black/40'
                              }`}
                            >
                              <Clock className={`w-5 h-5 mr-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                              {s.displayTime}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="border-t border-white/10 bg-black/40 p-6 sm:p-8 flex items-center justify-between">
            {step > 1 ? (
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-full px-6 h-12"
                onClick={() => setStep(s => s - 1)} 
                disabled={isBooking}
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Back
              </Button>
            ) : <div />}
            
            {step < 3 ? (
              <Button 
                className="rounded-full h-12 px-8 bg-white text-black hover:bg-white/90 font-semibold"
                onClick={handleNext}
              >
                Continue <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            ) : (
              <Button 
                className="rounded-full h-14 px-10 bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-105"
                disabled={!selectedSlot || isBooking} 
                onClick={handleBook}
              >
                {isBooking ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
