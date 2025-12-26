'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadImage } from '@/lib/api';

export default function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (PNG, JPG, or WEBP)');
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        const result = await uploadImage(file);
        router.push(`/assets/${result.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        setIsUploading(false);
      }
    },
    [router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative group cursor-pointer
          border-[3px] border-dashed rounded-[2.5rem] 
          p-16 md:p-24 text-center transition-all duration-300
          ${
            isDragging
              ? 'border-blue-600 bg-blue-50/50 scale-[0.99] shadow-inner'
              : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-xl hover:shadow-slate-200/50'
          }
          ${isUploading ? 'opacity-70 cursor-wait' : ''}
        `}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileInput}
          disabled={isUploading}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          {isUploading ? (
            <div className="space-y-8 py-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-black text-slate-900 tracking-tight uppercase">Analyzing Signals</p>
                <p className="text-slate-500 font-medium tracking-wide">Deconstructing visual vectors...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="relative w-24 h-24 mx-auto mb-2 transition-transform duration-500 group-hover:scale-110">
                <div className="absolute inset-0 bg-slate-900 rounded-3xl rotate-6 group-hover:rotate-12 transition-transform" />
                <div className="absolute inset-0 bg-blue-600 rounded-3xl -rotate-6 group-hover:-rotate-12 transition-transform opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">
                  Drag and drop <span className="text-blue-600">asset</span>
                </p>
                <p className="text-slate-500 font-bold tracking-widest text-sm uppercase">
                  or click to browse filesystem
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">RAW IMAGE</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">GEN-AI WORK</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">MAX 10MB</p>
                </div>
              </div>
            </div>
          )}
        </label>
      </div>
      {error && (
        <div className="mt-8 p-6 bg-red-50 border-2 border-red-100 rounded-[1.5rem] flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-900 font-bold tracking-tight">{error}</p>
        </div>
      )}
    </div>
  );
}


