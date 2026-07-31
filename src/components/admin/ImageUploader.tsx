import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, Link as LinkIcon } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  helpText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  placeholder = 'https://...',
  helpText = 'Upload a file from your local computer or enter an image URL.'
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, SVG, WebP, GIF).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      if (file.type === 'image/svg+xml' || file.size < 100 * 1024) {
        // Keep original SVG or small image as-is
        onChange(dataUrl);
      } else {
        // Compress raster images using canvas to prevent large storage payloads
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 800; // Optimal size for web logos & covers

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            const compressed = canvas.toDataURL(mimeType, 0.88);
            onChange(compressed);
          } else {
            onChange(dataUrl);
          }
        };
        img.onerror = () => onChange(dataUrl);
        img.src = dataUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-semibold text-gray-300">{label}</label>
        <div className="flex bg-gray-950 p-0.5 rounded-lg border border-gray-800 text-[10px]">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2 py-0.5 rounded-md font-medium transition flex items-center space-x-1 ${
              activeTab === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload Local File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2 py-0.5 rounded-md font-medium transition flex items-center space-x-1 ${
              activeTab === 'url' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {activeTab === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 ${
            isDragging
              ? 'border-blue-500 bg-blue-950/30'
              : 'border-gray-800 bg-gray-950 hover:border-gray-700 hover:bg-gray-900/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {value ? (
            <div className="flex items-center space-x-3 w-full justify-between px-2">
              <div className="flex items-center space-x-3 min-w-0">
                <img
                  src={value}
                  alt="Preview"
                  className="w-12 h-12 rounded-lg object-contain bg-gray-900 border border-gray-800 flex-shrink-0"
                />
                <div className="text-left truncate">
                  <p className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                    <span>✓ Image Uploaded</span>
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">Click or drag to replace image</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="p-1.5 bg-gray-800 hover:bg-rose-950 hover:text-rose-400 text-gray-400 rounded-lg transition"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="p-2.5 bg-blue-950/50 border border-blue-800/40 rounded-xl text-blue-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-200">
                  Click to select file <span className="text-gray-400 font-normal">or drag & drop</span>
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">PNG, JPG, SVG, WebP up to 10MB</p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex space-x-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
            {value && (
              <img
                src={value}
                alt="URL Preview"
                className="w-10 h-10 rounded-lg object-contain bg-gray-900 border border-gray-800 flex-shrink-0"
              />
            )}
          </div>
        </div>
      )}

      {helpText && <p className="text-[10px] text-gray-500">{helpText}</p>}
    </div>
  );
};
