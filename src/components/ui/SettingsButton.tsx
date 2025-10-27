"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function SettingsButton() {
  const { focusedSection, toggleSettings } = useSettingsStore();

  const isSettingsOpen = focusedSection === 'settings';

  return (
    <div className="flex-shrink-0 border-[#525252] border-1 rounded-[30px] bg-[#141414]">
      <button
        onClick={toggleSettings}
        className="w-full px-6 py-3 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors rounded-[30px]"
      >
        <span className="text-white text-sm">Datos Importantes</span>
        {isSettingsOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        )}
      </button>
    </div>
  );
}
