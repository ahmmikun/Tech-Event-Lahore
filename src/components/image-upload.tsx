"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { UploadCloud, X, Loader2, Sparkles } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

const PRESET_IMAGES = [
  {
    name: "AI & Hackathon",
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Developer Meetup",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Startup Pitch",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Cloud & Tech",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Product & Design",
    url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
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

      const { error } = await supabase.storage
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
        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-[#E5E7EB] group bg-[#F3F4F6] shadow-sm">
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
              className="px-4 py-2 rounded-lg text-xs font-bold text-[#111111] bg-white border border-[#E5E7EB] hover:bg-[#F3F4F6]"
            >
              Change Poster
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-2 rounded-lg text-white bg-red-600 hover:bg-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="aspect-[16/9] w-full rounded-xl border-2 border-dashed border-[#D1D5DB] hover:border-[#2563EB] bg-white hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group shadow-sm"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-[#2563EB]">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-bold">Uploading poster to Supabase Storage...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-[#111111] mb-1">
                Upload Event Poster / Cover Image
              </p>
              <p className="text-xs text-[#6B7280] max-w-xs">
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
        <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#2563EB]" />
          Or choose from tech presets:
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_IMAGES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.url)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                value === preset.url
                  ? "bg-[#111111] text-white border-[#111111]"
                  : "bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#D1D5DB]"
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
