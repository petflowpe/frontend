import { useState } from 'react';
import { ArrowLeft, Edit, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Pet, User, Appointment } from '../../types';
import { DigitalCarnet } from './DigitalCarnet';
import { PetTimeline } from './PetTimeline';

interface PetDetailViewProps {
  pet: Pet;
  owner: User;
  appointments: Appointment[];
  onBack: () => void;
  onEdit: (pet: Pet) => void;
}

export function PetDetailView({ pet, owner, appointments, onBack, onEdit }: PetDetailViewProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header de Navegación */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2 pl-0 hover:pl-2 transition-all">
          <ArrowLeft className="w-4 h-4" />
          Volver a Mis Mascotas
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(pet)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Columna Izquierda: Carnet y Datos Rápidos (Sticky en Desktop) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="lg:sticky lg:top-6 space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
               <h3 className="text-center font-semibold text-slate-500 mb-4 uppercase tracking-wider text-xs">
                 Documento de Identidad Digital
               </h3>
               <DigitalCarnet pet={pet} owner={owner} />
            </div>

            {/* Stats Rápidos */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border text-center shadow-sm">
                <span className="block text-2xl font-bold text-slate-700">{pet.age}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Años</span>
              </div>
              <div className="bg-white p-3 rounded-xl border text-center shadow-sm">
                <span className="block text-2xl font-bold text-slate-700">{pet.weight}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Kg</span>
              </div>
              <div className="bg-white p-3 rounded-xl border text-center shadow-sm">
                 <span className="block text-xl font-bold text-slate-700 truncate px-1">
                   {pet.gender === 'Macho' ? '♂' : '♀'}
                 </span>
                 <span className="text-[10px] text-slate-400 uppercase font-bold">Sexo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tabs (Línea de Vida, Vacunas, Archivos) */}
        <div className="lg:col-span-7">
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
              <TabsTrigger 
                value="timeline" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1"
              >
                Línea de Vida
              </TabsTrigger>
              <TabsTrigger 
                value="info" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1"
              >
                Info. Médica
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="mt-6">
              <PetTimeline pet={pet} appointments={appointments} />
            </TabsContent>
            
            <TabsContent value="info" className="mt-6">
              <div className="bg-white border rounded-xl p-6 space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Vacunas Registradas</h4>
                  {pet.vaccines.length > 0 ? (
                    <ul className="space-y-3">
                      {pet.vaccines.map(v => (
                        <li key={v.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm">
                          <span className="font-medium text-slate-700">{v.name}</span>
                          <span className="text-slate-500">{v.date}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 text-sm">No hay vacunas registradas</p>
                  )}
                </div>

                <div className="border-t pt-6">
                   <h4 className="font-semibold mb-3">Alergias y Condiciones</h4>
                   {pet.allergies && pet.allergies.length > 0 ? (
                     <div className="flex flex-wrap gap-2">
                       {pet.allergies.map((a, i) => (
                         <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-100">
                           {a}
                         </span>
                       ))}
                     </div>
                   ) : (
                     <p className="text-slate-500 text-sm">Sin alergias conocidas</p>
                   )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
