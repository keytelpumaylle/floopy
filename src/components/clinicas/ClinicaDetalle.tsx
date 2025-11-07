"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Pill, Stethoscope } from "lucide-react";
import { GetSpecialties, GetMedications } from "@/actions/clinicas";
import { Clinica } from "@/store/useClinicasStore";

interface Specialty {
  id: string;
  storesId: string;
  specialty: string;
}

interface Medication {
  id: string;
  storesId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

interface ClinicaDetalleProps {
  clinica: Clinica;
  onBack: () => void;
}

export default function ClinicaDetalle({ clinica, onBack }: ClinicaDetalleProps) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [specialtiesRes, medicationsRes] = await Promise.all([
          GetSpecialties(clinica.id),
          GetMedications(clinica.id)
        ]);

        if (specialtiesRes.meta?.status && specialtiesRes.specialty) {
          setSpecialties(specialtiesRes.specialty);
        }

        if (medicationsRes.meta?.status && medicationsRes.medication) {
          setMedications(medicationsRes.medication);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clinica.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando detalles...</div>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-160px)] pr-2">
      {/* Botón volver */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition-colors"
      >
        <ArrowLeft size={20} />
        Volver a clínicas
      </button>

      {/* Información de la clínica */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-300 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{clinica.name}</h2>
        <p className="text-gray-700 flex items-center gap-2">
          <MapPin size={18} className="text-purple-600" />
          {clinica.address}
        </p>
      </div>

      {/* Especialidades */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="text-purple-600" size={24} />
          <h3 className="text-xl font-semibold text-gray-900">Especialidades</h3>
        </div>

        {specialties.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {specialties.map((specialty) => (
              <div
                key={specialty.id}
                className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center"
              >
                <p className="text-gray-900 font-medium">{specialty.specialty}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay especialidades registradas</p>
        )}
      </div>

      {/* Medicamentos */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Pill className="text-purple-600" size={24} />
          <h3 className="text-xl font-semibold text-gray-900">Medicamentos Disponibles</h3>
        </div>

        {medications.length > 0 ? (
          <div className="space-y-3">
            {medications.map((medication) => (
              <div
                key={medication.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-green-600">
                      <span className="font-semibold">S/. {medication.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{medication.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay medicamentos disponibles</p>
        )}
      </div>
    </div>
  );
}
