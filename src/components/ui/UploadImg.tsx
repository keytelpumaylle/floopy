"use client";

import { useRef } from "react";
import Image from 'next/image';
import { ImageUp } from "lucide-react";


interface UploadImageProps {
  imageUrl: string | null;
  onImageUpload: (url: string | null) => void;
  hasImages?: boolean;
}

export default function UploadImage({ imageUrl, onImageUpload, hasImages = false }: UploadImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageUpload(null);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-gray-100 rounded shadow flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative overflow-hidden w-full h-full group border border-gray-300"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            height={1500}
            width={1500}
            alt="Uploaded image"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Botón para remover/cambiar imagen */}
          <div className="absolute inset-0 bg-[#12121225] bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center z-10">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button
                onClick={handleRemove}
                className="bg-red-500 hover:bg-red-600 text-white px-2 md:px-3 lg:px-4 py-1.5 md:py-2 rounded-lg transition-colors text-xs md:text-sm"
              >
                Eliminar
              </button>
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-2 md:px-3 lg:px-4 py-1.5 md:py-2 rounded-lg transition-colors text-xs md:text-sm"
              >
                Cambiar
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-gray-900 flex flex-col items-center gap-2 md:gap-3 px-2">
          <ImageUp className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16" strokeWidth={1.5}/>
          <p className="text-xs md:text-sm lg:text-base font-semibold text-center">{hasImages ? "Agregar imagen" : "Agregue 1 imagen al menos"}</p>
        </div>
      )}
    </div>
  );
}