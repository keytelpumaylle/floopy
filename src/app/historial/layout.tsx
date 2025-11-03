import Navbar from "@/components/ui/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnistico - Floppy",
  description: "La tienda de ropa mas grande del mundo",
};

const HistorialLayout = ({ children }: { children: React.ReactNode }) => {
    return (
      <section className="h-screen">
        <Navbar/>
        {children}
      </section>
    );
  };
  
  export default HistorialLayout;