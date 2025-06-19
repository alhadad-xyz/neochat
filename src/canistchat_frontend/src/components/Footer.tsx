
import React from 'react';
import { Bot, Github, Twitter, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-16 relative overflow-hidden">
      {/* Background glassmorphism elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-2xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">NeoChat</span>
            </div>
            <p className="text-gray-400 mb-4">
              Deploy AI agents on the Internet Computer Protocol. Decentralized, secure, and powerful.
            </p>
            <div className="flex space-x-4">
              <div className="p-2 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 cursor-pointer transition-all duration-300">
                <Github className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </div>
              <div className="p-2 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 cursor-pointer transition-all duration-300">
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </div>
              <div className="p-2 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 cursor-pointer transition-all duration-300">
                <MessageCircle className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-700 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 NeoChat. All rights reserved. Built on Internet Computer Protocol.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
