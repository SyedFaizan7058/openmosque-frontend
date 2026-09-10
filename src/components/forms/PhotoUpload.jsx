import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import mosqueService from '../../services/mosqueService';

export default function PhotoUpload({ data, onChange }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewUrls, setPreviewUrls] = useState(
    Array.isArray(data.photos) ? data.photos.filter((p) => typeof p === 'string') : []
  );

  const handleFiles = async (files) => {
    setUploadError('');
    const validFiles = Array.from(files).filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File exceeds 10MB limit.');
        return false;
      }
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files (JPG, PNG, WebP) are allowed.');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    for (const file of validFiles) {
      try {
        const publicUrl = await mosqueService.uploadMediaDirect(file, 'mosque');
        if (publicUrl) {
          uploadedUrls.push(publicUrl);
        }
      } catch (err) {
        console.warn('Direct media upload fallback to object URL:', err);
        uploadedUrls.push(URL.createObjectURL(file));
      }
    }

    const updated = [...previewUrls, ...uploadedUrls];
    setPreviewUrls(updated);
    onChange({
      ...data,
      photos: updated,
      imageUrls: updated,
      coverImageUrl: updated[0] || data.coverImageUrl,
    });
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!uploading) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removePhoto = (index) => {
    const updated = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(updated);
    onChange({
      ...data,
      photos: updated,
      imageUrls: updated,
      coverImageUrl: updated[0] || '',
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Photos &amp; Verification
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Upload photos directly to OpenMosque servers to help worshippers identify this mosque.
      </p>

      {uploadError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300">
          {uploadError}
        </div>
      )}

      {/* Upload area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          uploading
            ? 'border-primary-400 bg-primary-50/20 dark:bg-primary-950/20 cursor-wait'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
        }`}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="py-2">
            <Loader2 size={32} className="mx-auto text-primary-500 animate-spin mb-3" />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Uploading binary to storage...
            </p>
            <p className="text-xs text-gray-400 mt-1">Processing image and generating public URL</p>
          </div>
        ) : (
          <>
            <ImageIcon size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag photos here or <span className="text-primary-600 font-medium">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 10MB each</p>
          </>
        )}
        <input
          ref={fileInputRef}
          id="photo-upload-input"
          aria-label="Upload mosque photos"
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Preview */}
      {previewUrls.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span>Uploaded Photos ({previewUrls.length})</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xs">
                <img src={url} alt={`Upload ${index + 1}`} className="w-full h-28 object-cover" />
                <button
                  type="button"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/80"
                >
                  <X size={12} />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white font-bold backdrop-blur-xs">
                    Cover Image
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
