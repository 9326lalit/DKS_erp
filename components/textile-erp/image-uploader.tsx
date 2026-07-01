"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  value?: string;
  onChange: (base64Url: string) => void;
  label?: string;
  helperText?: string;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  label = "Upload Image",
  helperText = "PNG, JPG or WEBP up to 2MB",
  className
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    onChange("");
  };

  return (
    <div className={cn("space-y-2 w-full", className)}>
      <span className="text-xs font-semibold text-foreground/80 tracking-wider">
        {label}
      </span>
      
      {value ? (
        // Preview State
        <div className="relative aspect-video rounded-xl overflow-hidden border border-border/40 shadow-sm flex items-center justify-center bg-muted/20 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover select-none"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="rounded-full shadow"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        // Upload Zone State
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 aspect-video select-none",
            dragActive 
              ? "border-primary bg-primary/5 scale-[0.99]" 
              : "border-border/40 hover:border-primary/40 hover:bg-muted/10"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
          />
          
          <div className="p-3 bg-muted rounded-full text-muted-foreground mb-3 hover:text-primary transition-colors">
            <UploadCloud className="h-6 w-6" />
          </div>
          
          <p className="text-xs font-bold text-foreground">
            Drag & drop or click to upload
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {helperText}
          </p>
        </div>
      )}
    </div>
  );
}
export type { ImageUploaderProps };
