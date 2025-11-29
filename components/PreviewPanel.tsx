import React from 'react';
import { formatBytes } from '../utils/imageProcessing';

interface PreviewPanelProps {
  originalUrl: string;
  processedUrl: string | null;
  originalSize: number;
  processedSize: number | null;
  isProcessing: boolean;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  originalUrl,
  processedUrl,
  originalSize,
  processedSize,
  isProcessing
}) => {
  
  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 bg-slate-950/50 rounded-2xl border border-slate-700 overflow-hidden relative flex items-center justify-center p-4">
        {/* Background grid pattern for transparency */}
        <div className="absolute inset-0 z-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* Image Container */}
        <div className="relative z-10 max-w-full max-h-full shadow-2xl">
           <img 
            src={processedUrl || originalUrl} 
            alt="Preview" 
            className={`max-w-full max-h-[60vh] object-contain rounded-md transition-opacity duration-300 ${isProcessing ? 'opacity-50 blur-sm' : 'opacity-100'}`}
          />
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-8">
           <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Original Size</p>
            <p className="text-lg font-mono text-slate-200">{formatBytes(originalSize)}</p>
           </div>
           
           <div className="border-l border-slate-600 pl-8">
             <p className="text-xs text-slate-400 uppercase tracking-wider">New Size</p>
             <p className={`text-lg font-mono font-bold ${processedSize && processedSize < originalSize ? 'text-green-400' : 'text-slate-200'}`}>
                {processedSize ? formatBytes(processedSize) : '...'}
             </p>
           </div>
           
           {processedSize && (
             <div className="border-l border-slate-600 pl-8 hidden sm:block">
               <p className="text-xs text-slate-400 uppercase tracking-wider">Reduction</p>
               <p className="text-lg font-mono text-indigo-400">
                  {Math.round((1 - (processedSize / originalSize)) * 100)}%
               </p>
             </div>
           )}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
            <a 
              href={processedUrl || '#'} 
              download={`optimized_image.${processedUrl?.split('/')[1]?.split(';')[0] || 'jpg'}`}
              className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                !processedUrl || isProcessing
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
              }`}
              onClick={(e) => (!processedUrl || isProcessing) && e.preventDefault()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download
            </a>
        </div>
      </div>
    </div>
  );
};
