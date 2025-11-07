import Input from "@/components/ui/Input";
import Navbar from "@/components/ui/Navbar";
import SectionImages from "@/components/ui/SectionImages";
import Settings from "@/components/ui/Settings";
import Notifications from "@/components/ui/Notifications";

export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F9F8FD] relative">
      {/* Círculos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-5 md:left-10 w-48 h-48 md:w-72 md:h-72 lg:w-96 lg:h-96 bg-purple-400 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute top-40 md:top-60 right-10 md:right-20 w-40 h-40 md:w-60 md:h-60 lg:w-80 lg:h-80 bg-purple-500 rounded-full blur-3xl opacity-15"></div>
        <div className="absolute bottom-32 left-1/4 w-36 h-36 md:w-56 md:h-56 lg:w-72 lg:h-72 bg-purple-300 rounded-full blur-3xl opacity-25"></div>
        <div className="absolute bottom-20 right-1/3 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-purple-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 md:w-72 md:h-72 lg:w-96 lg:h-96 bg-gradient-to-br from-purple-400 to-blue-300 rounded-full blur-3xl opacity-15"></div>
      </div>

      <Notifications />
      <Navbar />
      <main className="flex-1 flex flex-col lg:flex-row mx-4 md:mx-8 lg:mx-[13%] gap-4 md:gap-6 min-h-0 relative z-10">
        {/* Componente del chat */}
        <section className="w-full lg:w-[40%] flex flex-col gap-2 min-h-0">

          <Settings/>
          <Input/>


        </section>
        {/* Componente de las iamgenes */}
        <section className="w-full lg:w-[60%] min-h-0">
          <SectionImages/>
        </section>

      </main>
      <footer className="text-xs sm:text-sm flex-shrink-0 p-2 sm:p-4 justify-center text-center relative z-10">© Todos los Derechos Reservados - Floopy</footer>
    </div>
  );
}
