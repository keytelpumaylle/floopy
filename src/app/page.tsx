import Input from "@/components/ui/Input";
import Navbar from "@/components/ui/Navbar";
import SectionImages from "@/components/ui/SectionImages";

export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <main className="flex-1 flex mx-[13%] gap-6 min-h-0">
        {/* Componente del chat */}
        <section className="w-[40%] flex flex-col gap-2 min-h-0">
          
          <Input/>
          {/*
          <Settings/>
          <SettingsButton/>
          */}
          
          
        </section>
        {/* Componente de las iamgenes */}
        <section className="w-[60%] min-h-0">
          <SectionImages/>
        </section>

      </main>
      <footer className="flex-shrink-0">Footer</footer>
    </div>
  );
}
