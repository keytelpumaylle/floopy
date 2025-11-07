"use client";

import { Plus, ScrollText, Store } from "lucide-react";
import Link from "next/link";
import { useModalStore } from "@/store/useModalStore";
import ModalClinicas from "../modal/Clinicas";
import Logo from "@/img/logo.png"
import Image from "next/image";

export default function Navbar() {
  const peso = 18;
  const stroke = 1.3;

  // Modal de tiendas
  const { open, isOpen } = useModalStore();

  return (
    <>
      <nav className="flex items-center justify-between py-3 md:py-5 px-3 md:px-4 bg-[#F9F8FD]">
        <div className="text-sm flex gap-2 md:gap-4 items-center">
          <Image src={Logo} height={40} width={40} className="md:h-[50px] md:w-[50px]" alt="Logo de floopy"/>
          <h2 className="text-lg md:text-xl font-bold text-black hidden sm:block">Floopy</h2>
        </div>
        <div className="text-sm flex gap-2 md:gap-4 items-center">
          <Link
            href={"/"}
            className="bg-white text-gray-900 flex items-center gap-1 md:gap-2 border-gray-300 border-1 rounded-md py-2 px-2 md:px-3 hover:border-purple-600 hover:text-purple-600 transition-colors"
          >
            <Plus size={peso} strokeWidth={stroke} /> <span className="hidden md:inline">Nuevo</span>
          </Link>

          <Link
            href={"/historial"}
            className="bg-white text-gray-900 flex items-center gap-1 md:gap-2 border-gray-300 border-1 rounded-md py-2 px-2 md:px-3 hover:border-purple-600 hover:text-purple-600 transition-colors"
          >
            <ScrollText size={peso} strokeWidth={stroke} />{" "}
            <span className="hidden md:inline">Ver Historial</span>
          </Link>
        </div>
        <div className="flex gap-2 md:gap-4 items-center text-sm">
          <button
            onClick={open}
            className="bg-white text-gray-900 flex items-center gap-1 md:gap-2 border-gray-300 border-1 rounded-md py-2 px-2 md:px-3 hover:border-purple-600 hover:text-purple-600 transition-colors"
          >
            <Store size={peso} strokeWidth={stroke} /> <span className="hidden md:inline">Clinicas</span>
          </button>
        </div>
      </nav>

      {isOpen &&(
        <ModalClinicas/>
      )}
    </>
  );
}
