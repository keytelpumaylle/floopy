import Input from "@/components/ui/Input";
import Navbar from "@/components/ui/Navbar";
import SectionImages from "@/components/ui/SectionImages";
import Settings from "@/components/ui/Settings";
import Notifications from "@/components/ui/Notifications";

export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Notifications />
      <Navbar />
      <main className="flex-1 flex mx-[13%] gap-6 min-h-0">
        {/* Componente del chat */}
        <section className="w-[40%] flex flex-col gap-2 min-h-0">
          
          <Settings/>
          <Input/>
          
          
        </section>
        {/* Componente de las iamgenes */}
        <section className="w-[60%] min-h-0">
          <SectionImages/>
        </section>

      </main>
      <footer className="text-sm flex-shrink-0 p-4 justify-center text-center">© Todos los Derechos Reservados - Floopy</footer>
    </div>
  );
}
