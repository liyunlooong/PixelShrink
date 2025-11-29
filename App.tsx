import React, { useState, useEffect, useCallback } from 'react';
import { Dropzone } from './components/Dropzone';
import { ControlPanel } from './components/ControlPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { readFileAsDataURL, loadImage, resizeImage } from './utils/imageProcessing';
import { ImageDetails, ImageSettings, ImageFormat } from './types';

const App: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalDetails, setOriginalDetails] = useState<ImageDetails | null>(null);
  
  // This URL is used for previewing the original image
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string>('');
  
  // Processed result
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);

  const [settings, setSettings] = useState<ImageSettings>({
    width: 0,
    height: 0,
    maintainAspectRatio: true,
    quality: 0.8,
    format: ImageFormat.JPEG
  });

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [processedUrl]);

  const handleFileSelect = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataURL(file);
      const img = await loadImage(dataUrl);

      setOriginalFile(file);
      setOriginalImage(img);
      setOriginalPreviewUrl(dataUrl);
      
      setOriginalDetails({
        name: file.name,
        size: file.size,
        width: img.width,
        height: img.height,
        src: dataUrl,
        type: file.type
      });

      // Reset settings to defaults based on new image
      setSettings({
        width: img.width,
        height: img.height,
        maintainAspectRatio: true,
        quality: 0.8,
        // Default to file type if supported, else JPEG
        format: Object.values(ImageFormat).includes(file.type as ImageFormat) 
          ? (file.type as ImageFormat) 
          : ImageFormat.JPEG
      });
      
    } catch (error) {
      console.error("Error loading image", error);
      alert("Failed to load image.");
    }
  };

  const processImage = useCallback(async () => {
    if (!originalImage || !settings.width || !settings.height) return;

    setIsProcessing(true);
    try {
      // Small delay to allow UI to show loading state
      await new Promise(r => setTimeout(r, 50));
      
      const blob = await resizeImage(originalImage, settings);
      setProcessedBlob(blob);
      
      const newUrl = URL.createObjectURL(blob);
      setProcessedUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return newUrl;
      });
      
    } catch (error) {
      console.error("Error processing image", error);
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage, settings]);

  // Debounce the processing trigger when settings change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (originalImage) {
        processImage();
      }
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [settings, originalImage, processImage]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              PixelShrink <span className="text-indigo-500 font-light">AI</span>
            </h1>
          </div>
          
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Gemini
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!originalFile ? (
          <div className="max-w-2xl mx-auto mt-12 animate-fade-in-up">
            <div className="text-center mb-8 space-y-2">
              <h2 className="text-4xl font-extrabold text-white">Resize images intelligently.</h2>
              <p className="text-slate-400 text-lg">
                Drag, drop, and let our AI optimize your photos for any platform.
              </p>
            </div>
            <Dropzone onFileSelect={handleFileSelect} />
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <div className="text-indigo-400 font-semibold mb-2">Smart Resizing</div>
                <p className="text-sm text-slate-400">Ask the AI to optimize for specific use cases like "Passport" or "Instagram".</p>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                 <div className="text-indigo-400 font-semibold mb-2">Private & Fast</div>
                <p className="text-sm text-slate-400">Processing happens in your browser. Your photos never leave your device.</p>
              </div>
               <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                 <div className="text-indigo-400 font-semibold mb-2">Multi-Format</div>
                <p className="text-sm text-slate-400">Convert freely between JPEG, PNG, and WebP formats.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px]">
            {/* Left Column: Controls */}
            <div className="w-full lg:w-1/3 min-w-[320px] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setOriginalFile(null)} 
                  className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                  </svg>
                  New Upload
                </button>
                <span className="text-xs text-slate-500 font-mono">{originalDetails?.name}</span>
              </div>
              
              <div className="flex-1 min-h-0">
                <ControlPanel 
                  settings={settings}
                  onChange={setSettings}
                  originalWidth={originalDetails?.width || 0}
                  originalHeight={originalDetails?.height || 0}
                  isProcessing={isProcessing}
                />
              </div>
            </div>

            {/* Right Column: Preview */}
            <div className="w-full lg:w-2/3 h-full">
              <PreviewPanel 
                originalUrl={originalPreviewUrl}
                processedUrl={processedUrl}
                originalSize={originalDetails?.size || 0}
                processedSize={processedBlob?.size || null}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
