
import React from 'react';
import '../shared.css';
import { Icons } from '../../../icons';

const SportsHighlights: React.FC = () => {
  return (
    <div className="school-hub-content-pane">
        <div className="text-cyan-400 mb-4 opacity-50">
            <Icons.SportsHighlights size={64}/>
        </div>
        <h2 className="font-orbitron text-4xl font-bold text-white mb-2">Sports Highlights</h2>
        <p className="text-gray-400">Marketing / Sports Game Highlight Access</p>
        <div className="content-container-bordered mt-6 w-full max-w-lg h-64 bg-black/20 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Content for Sports Highlights would be displayed here.</p>
        </div>
    </div>
  );
};

export default SportsHighlights;