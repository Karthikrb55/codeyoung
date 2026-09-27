import { BrowserRouter, Routes, Route } from "react-router-dom"
import RootLayout from "./layouts/RootLayout"
import Home from "./pages/Home"
import BookingFlow from "./pages/BookingFlow"
import BookingConfirmation from "./pages/BookingConfirmation"
import MentorDashboard from "./pages/MentorDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import DemoClass from "./pages/DemoClass"
import { ErrorBoundary } from "./components/ErrorBoundary"

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="book" element={<BookingFlow />} />
            <Route path="confirmation/:bookingId" element={<BookingConfirmation />} />
            <Route path="mentor" element={<MentorDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="class/:bookingId" element={<DemoClass />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
