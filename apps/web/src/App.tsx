import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import SocialProof from './components/SocialProof'
import Pricing from './components/Pricing'
import Waitlist from './components/Waitlist'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <SocialProof />
        <Pricing />
        <Waitlist />
      </main>
      <Footer />
    </div>
  )
}

export default App
