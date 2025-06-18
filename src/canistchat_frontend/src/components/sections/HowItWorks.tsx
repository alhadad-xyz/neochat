
import React from 'react';
import { ArrowRight, Palette, Settings, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const HowItWorks = () => {
  const steps = [
    {
      icon: Palette,
      title: 'Design Your Agent',
      description: 'Use our intuitive wizard to define your AI agent\'s personality, knowledge base, and conversation style.',
      color: 'blue'
    },
    {
      icon: Settings,
      title: 'Configure & Train',
      description: 'Fine-tune your agent\'s responses, upload training data, and connect to external knowledge sources.',
      color: 'purple'
    },
    {
      icon: Rocket,
      title: 'Deploy On-Chain',
      description: 'Launch your AI agent on ICP canisters and embed it anywhere with our simple integration code.',
      color: 'green'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900 relative overflow-hidden">
      {/* Background glassmorphism elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 left-32 w-48 h-48 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-48 h-48 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create and deploy your AI agent in three simple steps
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="backdrop-blur-md bg-white/60 dark:bg-black/40 border border-white/30 dark:border-white/10 hover:shadow-xl transition-all duration-300 hover:bg-white/70 dark:hover:bg-black/50">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg
                      ${step.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : ''}
                      ${step.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : ''}
                      ${step.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' : ''}
                    `}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">
                      Step {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full backdrop-blur-md bg-white/50 dark:bg-black/50 border border-white/30 dark:border-white/10 flex items-center justify-center shadow-lg">
                      <ArrowRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
