
import React from 'react';
import { Bot, Code, Database, Globe, Lock, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Features = () => {
  const features = [
    {
      icon: Bot,
      title: 'AI Agent Builder',
      description: 'Create custom AI agents with unique personalities, knowledge bases, and conversation styles using our intuitive wizard.',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Database,
      title: 'On-Chain Storage',
      description: 'All agent configurations and conversation logs stored securely on ICP canisters with full encryption.',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: Code,
      title: 'Easy Embedding',
      description: 'Deploy your AI agents anywhere with our JavaScript SDK and customizable web components.',
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: Lock,
      title: 'Internet Identity',
      description: 'Secure authentication and agent ownership through ICP\'s decentralized identity system.',
      gradient: 'from-red-500 to-red-600'
    },
    {
      icon: Globe,
      title: 'Chain Fusion',
      description: 'Connect to external data sources and other blockchains using HTTPS outcalls and EVM RPC integration.',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: TrendingUp,
      title: 'Usage Analytics',
      description: 'Track performance metrics, usage patterns, and optimize your AI agents with detailed analytics.',
      gradient: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background glassmorphism elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Powerful Features for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Decentralized AI
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to create, deploy, and manage intelligent AI agents on the blockchain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="backdrop-blur-md bg-white/50 dark:bg-black/30 border border-white/30 dark:border-white/10 hover:bg-white/60 dark:hover:bg-black/40 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
