import React, { useState } from 'react';
import { ImageFormat, ImageSettings } from '../types';
import { getOptimizationSuggestion } from '../services/geminiService';

interface ControlPanelProps {
  settings: ImageSettings;
  onChange: (newSettings: ImageSettings) => void;
  originalWidth: number;
  originalHeight: number;
  isProcessing: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  settings, 
  onChange, 
  originalWidth, 
  originalHeight,
  isProcessing
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);

  const updateSetting = <K extends keyof ImageSettings>(key: K, value: ImageSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    
    // Handle aspect ratio logic
    if (aspectRatioLocked && (key === 'width' || key === 'height')) {
      const ratio = originalWidth / originalHeight;
      if (key === 'width') {
        newSettings.height = Math.round((value as number) / ratio);
      } else {
        newSettings.width = Math.round((value as number) * ratio);
      }
    }
    
    onChange(newSettings);
  };

  const handleAiOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    try {
      const suggestion = await getOptimizationSuggestion(aiPrompt, originalWidth, originalHeight);
      
      const newSettings = { ...settings };
      if (suggestion.width) newSettings.width = suggestion.width;
      if (suggestion.height) newSettings.height = suggestion.height;
      if (suggestion.quality) newSettings.quality = suggestion.quality;
      if (suggestion.format) newSettings.format = suggestion.format;
      
      // If AI suggests dimensions, we might need to recalc the other if not provided
      if (suggestion.width && !suggestion.height) {
         newSettings.height = Math.round(suggestion.width / (originalWidth / originalHeight));
      } else if (!suggestion.width && suggestion.height) {
         newSettings.width = Math.round(suggestion.height * (originalWidth / originalHeight));
      }

      onChange(newSettings);
      setAiPrompt(''); // clear only on success if desired, or keep to show what was asked
      alert(`AI Suggestion Applied: ${suggestion.explanation || 'Optimized settings applied.'}`);

    } catch (error) {
      console.error(error);
      alert('Failed to get AI suggestions. Check console or try again.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-6 rounded-2xl flex flex-col gap-8 h-full overflow-y-auto">
      
      {/* AI Section */}
      <div className="space-y-3 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436-3.702 2.881-8.201 5.264-13.266 7.037a.75.75 0 11-.532-1.404c4.808-1.684 9.076-3.951 12.597-6.684a.75.75 0 01.372-.75.75.75 0 01-.75-.372c-2.733 3.52-5-7.788 12.596-9.076a.75.75 0 11-1.405-.532C2.116 8.353 4.499 12.853 7.38 16.554a.75.75 0 01.218.423 20.916 20.916 0 001.717-9.393z" clipRule="evenodd" />
          </svg>
          Smart Optimizer (Gemini)
        </div>
        <form onSubmit={handleAiOptimize} className="flex flex-col gap-2">
          <input 
            type="text" 
            placeholder='e.g., "Make it under 50KB for a passport photo"'
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            type="submit"
            disabled={aiLoading || !aiPrompt.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center gap-2"
          >
            {aiLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Thinking...
              </>
            ) : (
              'Ask AI to Set Parameters'
            )}
          </button>
        </form>
      </div>

      <hr className="border-slate-700" />

      {/* Dimensions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-slate-200 font-semibold">Dimensions</h3>
          <button 
            onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
            className={`text-xs px-2 py-1 rounded border ${aspectRatioLocked ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-transparent border-slate-600 text-slate-400'}`}
            title="Lock Aspect Ratio"
          >
            {aspectRatioLocked ? 'Ratio Locked' : 'Ratio Unlocked'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Width (px)</label>
            <input 
              type="number" 
              value={settings.width}
              onChange={(e) => updateSetting('width', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Height (px)</label>
            <input 
              type="number" 
              value={settings.height}
              onChange={(e) => updateSetting('height', Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Scale Buttons */}
        <div className="flex gap-2">
          {[0.25, 0.5, 0.75].map(scale => (
            <button 
              key={scale}
              onClick={() => {
                updateSetting('width', Math.round(originalWidth * scale));
                updateSetting('height', Math.round(originalHeight * scale));
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 py-1.5 rounded transition-colors"
            >
              {scale * 100}%
            </button>
          ))}
          <button 
             onClick={() => {
              updateSetting('width', originalWidth);
              updateSetting('height', originalHeight);
             }}
             className="flex-1 bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 py-1.5 rounded transition-colors"
          >
            Original
          </button>
        </div>
      </div>

      {/* Format & Quality */}
      <div className="space-y-4">
        <h3 className="text-slate-200 font-semibold">Format & Quality</h3>
        
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Export Format</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(ImageFormat).map((fmt) => (
              <button
                key={fmt}
                onClick={() => updateSetting('format', fmt)}
                className={`py-2 text-sm rounded-lg border transition-all ${
                  settings.format === fmt 
                    ? 'bg-indigo-600 border-indigo-500 text-white' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {fmt.split('/')[1].toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs text-slate-400">Quality</label>
            <span className="text-xs text-indigo-400 font-mono">{Math.round(settings.quality * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="1" 
            step="0.01" 
            value={settings.quality}
            onChange={(e) => updateSetting('quality', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

    </div>
  );
};
