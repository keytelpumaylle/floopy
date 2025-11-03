"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { FileText, CheckCircle } from "lucide-react";

interface VerificationCodeFormProps {
  onSubmit: (dni: string) => void;
  isLoading?: boolean;
}

export default function VerificationCodeForm({ onSubmit, isLoading = false }: VerificationCodeFormProps) {
  const [code, setCode] = useState<string[]>(Array(8).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Mover al siguiente input si hay valor
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Mover al input anterior con Backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const fullCode = code.join("");
    if (fullCode.length === 8) {
      onSubmit(fullCode);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className=" p-8 md:p-12">
        {/* Icono y título */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-6">
            <FileText size={64} className="text-[#dbef67]" strokeWidth={1.5} />
            <CheckCircle
              size={28}
              className="absolute -top-2 -right-2 text-[#dbef67] bg-[#141414] rounded-full"
              strokeWidth={2}
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Historial Medico de tu Mascota
          </h1>
          <p className="text-gray-400 text-center max-w-md text-sm">
            Ingresa tu DNI para que puedas acceder a toda la informacion medica de
            tu mascota de manera rapida y segura.
          </p>
        </div>

        {/* Inputs de código */}
        <div className="flex justify-center gap-2 md:gap-3 mb-8">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 md:w-14 md:h-16 bg-[#262626] border-2 border-[#525252] rounded-lg text-white text-2xl font-bold text-center focus:outline-none focus:border-[#dbef67] transition-colors duration-200"
            />
          ))}
        </div>

        {/* Botón de confirmación */}
        <button
          onClick={handleSubmit}
          disabled={code.join("").length !== 8 || isLoading}
          className="w-full bg-[#dbef67] hover:bg-[#c9d95f] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-[25px] transition-colors duration-200"
        >
          {isLoading ? "Consultando..." : "Consultar mi Historial"}
        </button>
      </div>
    </div>
  );
}
