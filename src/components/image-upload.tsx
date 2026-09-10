"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { UploadCloud, Image as ImageIcon, X, Loader2, Sparkles } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

const PRESET_IMAGES = [
  {
    name: "Tech Summit",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Music / Concert",
    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Food Festival",
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Art & Culture",
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Startup Pitch",
    url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
  },
];

export function ImageUpload({ value, onChange, className = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `posters/${fileName}`;

      const { data, error } = await supabase.storage
        .from("event-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("event-images").getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Event poster uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload image. You can also pick a preset image below.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Box or Image Preview */}
      {value ? (
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border-2 border-orange-500/50 group bg-slate-900 shadow-xl">
          <Image
            src={value}
            alt="Event Poster Preview"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900/90 border border-slate-700 hover:border-orange-500"
            >
              Change Poster
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-2 rounded-xl text-white bg-red-600/90 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="aspect-[16/9] w-full rounded-2xl border-2 border-dashed border-slate-700 hover:border-orange-500 bg-slate-900/60 hover:bg-slate-900/90 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group shadow-inner"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-orange-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-bold">Uploading poster to Supabase Storage...</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white mb-1">
                Upload Event Poster / Cover Image
              </p>
              <p className="text-xs text-slate-400 max-w-xs">
                Drag and drop or browse files. 16:9 ratio recommended (JPG, PNG, WebP up to 5MB)
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Preset images picker */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-orange-400" />
          Or choose from high-res presets:
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_IMAGES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.url)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                value === preset.url
                  ? "bg-orange-600 text-white border-orange-500 font-bold"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
