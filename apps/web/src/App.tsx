import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import SocialProof from './components/SocialProof'
import GetStarted from './components/GetStarted'
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
        <GetStarted />
      </main>
      <Footer />
    </div>
  )
}

export default App
