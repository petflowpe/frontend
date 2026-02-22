import { useState } from 'react';
import { motion } from 'motion/react';
import { QrCode, PawPrint, ShieldCheck, Share2, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Pet, User } from '../../types';

interface DigitalCarnetProps {
  pet: Pet;
  owner: User;
}

export function DigitalCarnet({ pet, owner }: DigitalCarnetProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full max-w-md aspect-[1.586/1] perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <motion.div 
          className="w-full h-full relative preserve-3d transition-all duration-500"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* FRENTE DEL CARNET */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            {/* Fondo con gradiente y patrón */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                    <PawPrint className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-none tracking-wide">SMARTPET</h3>
                    <p className="text-[10px] opacity-80 uppercase tracking-widest">Identificación Digital</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-white rounded-lg p-1">
                  <div className="w-full h-full border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <QrCode className="w-full h-full text-slate-800" />
                  </div>
                </div>
              </div>

              {/* Contenido Central */}
              <div className="flex gap-4 items-center mt-2">
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg bg-white/10 relative">
                  {pet.photo ? (
                    <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PawPrint className="w-10 h-10 text-white/50" />
                    </div>
                  )}
                  {/* Holograma simulado */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50" />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div>
                    <p className="text-[10px] uppercase opacity-70">Nombre</p>
                    <h2 className="text-2xl font-bold tracking-tight">{pet.name}</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] uppercase opacity-70">Raza</p>
                      <p className="font-medium text-sm truncate">{pet.breed}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase opacity-70">Especie</p>
                      <p className="font-medium text-sm">{pet.species}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-4 flex justify-between items-end border-t border-white/20">
                <div>
                  <p className="text-[10px] uppercase opacity-70">ID Mascota</p>
                  <p className="font-mono text-sm tracking-widest">{pet.id.toUpperCase().slice(0, 8)}</p>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 backdrop-blur rounded text-xs font-medium border border-green-400/30">
                  <ShieldCheck className="w-3 h-3 text-green-300" />
                  <span>Verificado</span>
                </div>
              </div>
            </div>
          </div>

          {/* REVERSO DEL CARNET */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-50"
            style={{ transform: 'rotateY(180deg)' }}
          >
            {/* Banda magnética simulada */}
            <div className="w-full h-10 bg-slate-800 mt-6" />

            <div className="p-6">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-white p-1 rounded border shadow-sm">
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <QrCode className="w-16 h-16 text-slate-800" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Este documento certifica que <strong className="text-slate-800">{pet.name}</strong> está registrado en la base de datos de SmartPet Cloud.
                  </p>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-slate-400 font-bold">Propietario</p>
                    <p className="text-sm font-medium text-slate-700">{owner.firstName} {owner.lastName}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                 <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold">Fecha Nacimiento</p>
                    <p className="text-slate-700">
                      {/* Simulamos fecha basada en edad si no existe birthDate */}
                       {new Date().getFullYear() - pet.age} (Estimado)
                    </p>
                 </div>
                 <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold">Sexo</p>
                    <p className="text-slate-700">{pet.gender}</p>
                 </div>
                 <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold">Peso</p>
                    <p className="text-slate-700">{pet.weight} kg</p>
                 </div>
                 <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold">Color</p>
                    <p className="text-slate-700">{pet.color}</p>
                 </div>
              </div>
              
              <div className="absolute bottom-4 left-6 right-6 text-[10px] text-center text-slate-400">
                Si encuentra esta mascota, escanee el código QR o contacte a SmartPet.
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={() => setIsFlipped(!isFlipped)}>
          Voltear Tarjeta
        </Button>
        <Button variant="secondary" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Compartir
        </Button>
        <Button variant="secondary" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Guardar Imagen
        </Button>
      </div>
    </div>
  );
}
