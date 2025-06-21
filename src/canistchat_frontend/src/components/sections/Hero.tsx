
import React from 'react';
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  handleLogin: () => void;
}

const Hero = ({ handleLogin }: HeroProps) => {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 relative overflow-hidden">
      {/* Glassmorphism background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/10 px-4 py-2 rounded-full shadow-lg">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Powered by Internet Computer Protocol
              </span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
            Deploy{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Agents
            </span>
            <br />
            On-Chain
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Create, customize, and deploy intelligent AI support agents directly on the blockchain. 
            No servers, no middlemen, just pure decentralized AI power.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button onClick={handleLogin} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 shadow-xl backdrop-blur-sm">
              Create Your Agent
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" className="text-lg px-8 py-6 backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/30 dark:border-white/20 hover:bg-white/20 dark:hover:bg-white/10 shadow-lg">
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex flex-col items-center text-center p-6 rounded-xl backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Fully Decentralized</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                No centralized servers or APIs. Your AI agents run entirely on-chain.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-xl backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Powered by ICP's high-performance canisters for instant responses.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-xl backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Easy Integration</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Embed anywhere with our simple SDK and customizable widgets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
