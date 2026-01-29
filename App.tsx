import React from 'react';
import { PhysicsCanvas } from './components/PhysicsCanvas';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-stone-900">
      <div className="absolute top-4 left-4 z-10 bg-black/50 p-4 rounded-lg backdrop-blur-sm border border-white/10 max-w-md">
        <h1 className="text-xl font-bold text-white mb-2">Tennis Ball Physics Analysis</h1>
        <p className="text-sm text-gray-300 mb-2">
          Based on the video analysis, the simulation parameters are tuned for:
        </p>
        <ul className="list-disc list-inside text-xs text-gray-400 space-y-1 mb-4">
          <li>High Restitution (0.78) - Typical for pressurized tennis balls</li>
          <li>Surface Friction (0.98) - Mimicking clay court drag</li>
          <li>Standard Gravity scaled to viewport</li>
        </ul>
        <div className="flex items-center gap-2 text-sm text-yellow-400 font-medium animate-pulse">
          <span>👆 Click anywhere on the court to spawn a ball</span>
        </div>
      </div>
      
      <PhysicsCanvas />
    </div>
  );
};

export default App;