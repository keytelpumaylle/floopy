"use client";

import { useState } from "react";
import { X, User } from "lucide-react";

interface UserNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  dni: string;
}

export default function UserNameModal({ isOpen, onClose, onSubmit, dni }: UserNameModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Por favor ingresa tu nombre");
      return;
    }

    if (name.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }

    onSubmit(name.trim());
    setName("");
    setError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[#525252] rounded-[20px] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#dbef67]/10 p-2 rounded-full">
              <User className="text-[#dbef67]" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">Registro de Usuario</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="mb-6">
          <p className="text-gray-400 mb-4">
            El DNI <span className="text-[#dbef67] font-semibold">{dni}</span> no está registrado en nuestro sistema.
          </p>
          <p className="text-gray-400 mb-6">
            Para continuar con el análisis, por favor ingresa tu nombre completo:
          </p>

          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              placeholder="Ej: Juan Pérez"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full bg-[#262626] border border-[#525252] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#dbef67] transition-colors"
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#262626] hover:bg-[#333333] text-white font-semibold py-3 rounded-[15px] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-[#dbef67] hover:bg-[#c9d95f] text-black font-semibold py-3 rounded-[15px] transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
