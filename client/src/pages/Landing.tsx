import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Globe, TrendingUp, Lock } from "lucide-react";
import GlobeMap from "@/components/GlobeMap";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <header className="px-6 py-6 md:px-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-yellow-600 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.5)]">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <span className="font-display font-bold text-2xl tracking-wide text-gradient-gold">
            Rensa Street
          </span>
        </div>
        <a href="/api/login">
          <Button variant="premium">Sign In</Button>
        </a>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 z-10 text-center mt-[-5vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-amber-200/80 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Global Vault Network Now Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-tight">
            Secure, Borderless <br/>
            <span className="text-gradient-gold">Precious Metals</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Buy, sell, and store physical Gold, Silver, Platinum, and Palladium in 10 highly secure, audited vaults around the world.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/api/login">
              <Button size="lg" variant="premium" className="w-full sm:w-auto" data-testid="button-open-vault">
                Open Your Vault
              </Button>
            </a>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto bg-black/40 backdrop-blur-md"
              data-testid="button-explore-locations"
              onClick={() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Locations
            </Button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          id="features"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24"
        >
          {[
            { icon: Globe, title: "Global Jurisdiction", desc: "Allocate assets across Toronto, Zurich, Singapore and 7 other strategic jurisdictions." },
            { icon: Lock, title: "Military Grade Security", desc: "Fully insured, audited physical bullion held in your name off the banking grid." },
            { icon: TrendingUp, title: "Instant Liquidity", desc: "Trade instantly 24/7 with deep liquidity and transparent spot pricing." }
          ].map((feature, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl text-left hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-display font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Global Map Section */}
        <section id="map" className="w-full max-w-6xl mx-auto mt-32 px-4 pb-24" data-testid="section-map">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-4">
              Global <span className="text-gradient-gold">Network</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our secure infrastructure spans the globe, providing physical asset protection in the world's most stable jurisdictions. Click a vault to begin trading.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="h-[400px] md:h-[600px] w-full relative"
            data-testid="container-map"
          >
            <GlobeMap onVaultSelect={() => window.location.href = "/api/login"} />
          </motion.div>
        </section>
      </main>
      
      {/* Abstract background image for texture */}
      {/* landing page abstract dark metallic texture */}
      <img
        src="https://images.unsplash.com/photo-1618044733300-9472054094ee?w=1920&q=80"
        alt="Texture"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.03] mix-blend-overlay pointer-events-none"
      />
    </div>
  );
}
