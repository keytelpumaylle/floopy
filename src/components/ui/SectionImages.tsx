"use client"

import UploadImage from "@/components/ui/UploadImg";
import { useState, useEffect } from "react";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export default function SectionImages() {
    const [images, setImages] = useState<(string | null)[]>([null]);
    const setStoreImages = useAnalysisStore((state) => state.setImages);

      const handleImageUpload = (index: number, imageUrl: string | null) => {
        let newImages = [...images];

        if (imageUrl === null) {
          // Si eliminó una imagen, remover ese elemento y reorganizar
          newImages.splice(index, 1);

          // Si después de eliminar quedamos con menos de 4 imágenes y el último no es null, agregar un espacio vacío
          if (newImages.length < 4 && (newImages.length === 0 || newImages[newImages.length - 1] !== null)) {
            newImages.push(null);
          }

          // Si eliminamos todo y no hay espacios, agregar uno vacío
          if (newImages.length === 0) {
            newImages = [null];
          }
        } else {
          // Si agregó una imagen
          newImages[index] = imageUrl;

          // Si agregó una imagen y aún no llegamos a 4 imágenes, agregar un nuevo espacio
          if (images.length < 4 && index === images.length - 1) {
            newImages.push(null);
          }
        }

        setImages(newImages);
      };

      // Sincronizar con el store global
      useEffect(() => {
        const validImages = images.filter((img) => img !== null) as string[];
        setStoreImages(validImages);
      }, [images, setStoreImages]);

      // Crear un array de 4 elementos para mostrar todos los espacios
      const displaySlots = Array(4).fill(null).map((_, index) => {
        if (index < images.length) {
          return { imageUrl: images[index], isActive: true };
        }
        return { imageUrl: null, isActive: false };
      });

  const hasImages = images.some(img => img !== null);

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full h-full">
            {displaySlots.map((slot, index) => (
              slot.isActive ? (
                <UploadImage
                  key={index}
                  imageUrl={slot.imageUrl}
                  onImageUpload={(url: string | null) => handleImageUpload(index, url)}
                  hasImages={hasImages}
                />
              ) : (
                <div key={index} className="bg-gray-50 rounded shadow border-2 border-dashed border-gray-300" />
              )
            ))}
          </div>
  );
}