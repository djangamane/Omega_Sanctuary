
import React from 'react';

export const LoadingState: React.FC = () => (
  <div className="text-center p-8 space-y-4">
    <div className="w-16 h-16 border-4 border-dashed border-amber-300 rounded-full animate-spin mx-auto"></div>
    <h2 className="text-2xl font-serif text-amber-200">OMEGA is interpreting the reflections...</h2>
    <p className="text-indigo-200">Please wait while the spiritual sermon is being generated.</p>
  </div>
);
