"use client";

import { ClipboardClock, Plus, ScrollText, Store } from "lucide-react";
import Link from "next/link";
import { useModalStore } from "@/store/useModalStore";
import ModalClinicas from "../modal/Clinicas";

export default function Navbar() {
  const peso = 18;
  const stroke = 1.3;


  // Modal de tiendas
  const { open, isOpen } = useModalStore();

  return (
    <>
      <nav className="flex items-center justify-between py-5 px-4">
        <div className="text-sm flex gap-4 items-center">
          <h2 className="text-xl font-bold mr-4">Floopy</h2>
        </div>
        <div className="text-sm flex gap-4 items-center">
          <Link
            href={"/"}
            className="bg-[#141414] flex items-center gap-2 border-[#525252] border-1 rounded-md py-2 px-3 hover:bg-[#525252]"
          >
            <Plus size={peso} strokeWidth={stroke} /> <span>Nuevo</span>
          </Link>

          <Link
            href={'/diagnostico'}
            className="bg-[#141414] flex items-center gap-2 border-[#525252] border-1 rounded-md py-2 px-3 hover:bg-[#525252]"
          >
            <ClipboardClock size={peso} strokeWidth={stroke} />{" "}
            <span>Diagnostico</span>
          </Link>
          <Link
            href={"/historial"}
            className="bg-[#141414] flex items-center gap-2 border-[#525252] border-1 rounded-md py-2 px-3 hover:bg-[#525252]"
          >
            <ScrollText size={peso} strokeWidth={stroke} />{" "}
            <span>Ver Historial</span>
          </Link>
        </div>
        <div className="flex gap-4 items-center text-sm">
          <button
            onClick={open}
            className="bg-[#141414] flex items-center gap-2 border-[#525252] border-1 rounded-md py-2 px-3 hover:bg-[#525252]"
          >
            <Store size={peso} strokeWidth={stroke} /> <span>Clinicas</span>
          </button>
        </div>
      </nav>

      {isOpen &&(
        <ModalClinicas/>
      )}
    </>
  );
}
