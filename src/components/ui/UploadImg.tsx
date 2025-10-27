"use client";

import { useRef } from "react";
import Image from 'next/image';


interface UploadImageProps {
  imageUrl: string | null;
  onImageUpload: (url: string | null) => void;
}

export default function UploadImage({ imageUrl, onImageUpload }: UploadImageProps) {
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
      className="bg-[#262626] rounded shadow flex items-center justify-center cursor-pointer hover:bg-[#333333] transition-colors relative overflow-hidden w-full h-full group"
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
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Eliminar
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cambiar
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-gray-400 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p className="text-sm">Subir imagen</p>
        </div>
      )}
    </div>
  );
}