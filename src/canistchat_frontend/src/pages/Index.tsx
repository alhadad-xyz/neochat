
import React, { useState } from 'react';
import Header from '../components/sections/Header';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import HowItWorks from '../components/sections/HowItWorks';
import Pricing from '../components/sections/Pricing';
import Footer from '../components/sections/Footer';

interface IndexProps {
  handleLogin: () => void;
}

const Index = ({ handleLogin }: IndexProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} handleLogin={handleLogin} />
      <Hero handleLogin={handleLogin} />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
