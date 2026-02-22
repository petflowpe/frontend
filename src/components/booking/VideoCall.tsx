import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, VideoOff, Mic, MicOff, Phone, Monitor, MessageSquare, Grid, Maximize2, Settings, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface VideoCallProps {
  onEnd?: () => void;
}

export function VideoCall({ onEnd }: VideoCallProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const participants = [
    { id: 1, name: 'Tú', role: 'Cliente', isMuted: !isAudioEnabled, isVideoOff: !isVideoEnabled },
    { id: 2, name: 'María González', role: 'Groomer', isMuted: false, isVideoOff: false },
  ];

  useEffect(() => {
    if (isCallActive) {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    onEnd?.();
  };

  return (
    <div className="min-h-screen bg-slate-900">
      
      {/* Pre-call Screen */}
      <AnimatePresence>
        {!isCallActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-screen p-4"
          >
            <Card className="max-w-2xl w-full p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Video className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="text-3xl font-bold mb-2">Consulta Virtual con tu Groomer</h2>
              <p className="text-slate-600 mb-8">
                Conéctate cara a cara con María González para resolver dudas sobre el servicio
              </p>

              {/* Preview */}
              <div className="relative bg-slate-900 rounded-xl overflow-hidden mb-6 aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  {isVideoEnabled ? (
                    <div className="text-white text-center">
                      <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-16 h-16" />
                      </div>
                      <p className="text-sm opacity-75">Vista previa de tu cámara</p>
                    </div>
                  ) : (
                    <div className="text-white text-center">
                      <VideoOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-sm opacity-75">Cámara desactivada</p>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isVideoEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {isVideoEnabled ? (
                      <Video className="w-5 h-5 text-white" />
                    ) : (
                      <VideoOff className="w-5 h-5 text-white" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isAudioEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {isAudioEnabled ? (
                      <Mic className="w-5 h-5 text-white" />
                    ) : (
                      <MicOff className="w-5 h-5 text-white" />
                    )}
                  </motion.button>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  onClick={() => setIsCallActive(true)}
                >
                  <Video className="w-5 h-5 mr-2" />
                  Iniciar Llamada
                </Button>
              </motion.div>

              <p className="text-xs text-slate-500 mt-4">
                Al iniciar la llamada, aceptas compartir tu cámara y micrófono
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Call Screen */}
      <AnimatePresence>
        {isCallActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-screen"
          >
            
            {/* Main Video (Groomer) */}
            <div className="absolute inset-0 bg-slate-800">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="text-white text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Video className="w-16 h-16" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2">María González</h3>
                  <p className="text-slate-400">Groomer Profesional</p>
                  <Badge className="mt-2 bg-green-500">Conectado</Badge>
                </div>

                {/* Connection Quality Indicator */}
                <div className="absolute top-4 left-4">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-black/50 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <div className="flex gap-1">
                      <div className="w-1 h-3 bg-green-500 rounded" />
                      <div className="w-1 h-4 bg-green-500 rounded" />
                      <div className="w-1 h-5 bg-green-500 rounded" />
                    </div>
                    <span>Excelente conexión</span>
                  </motion.div>
                </div>

                {/* Call Duration */}
                <div className="absolute top-4 right-4">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/50 rounded-lg px-4 py-2 text-white font-mono"
                  >
                    {formatDuration(callDuration)}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Self Video (Picture-in-Picture) */}
            <motion.div
              drag
              dragConstraints={{ left: 0, right: 500, top: 0, bottom: 500 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-24 right-6 w-48 h-36 bg-slate-700 rounded-xl overflow-hidden shadow-2xl cursor-move"
            >
              <div className="w-full h-full flex items-center justify-center text-white">
                {isVideoEnabled ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <User className="w-8 h-8" />
                    </div>
                    <p className="text-xs opacity-75">Tú</p>
                  </div>
                ) : (
                  <VideoOff className="w-8 h-8 opacity-50" />
                )}
              </div>

              {!isAudioEnabled && (
                <div className="absolute top-2 left-2">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <MicOff className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
            >
              <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center gap-3">
                  
                  {/* Video Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      isVideoEnabled
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {isVideoEnabled ? (
                      <Video className="w-6 h-6" />
                    ) : (
                      <VideoOff className="w-6 h-6" />
                    )}
                  </motion.button>

                  {/* Audio Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      isAudioEnabled
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {isAudioEnabled ? (
                      <Mic className="w-6 h-6" />
                    ) : (
                      <MicOff className="w-6 h-6" />
                    )}
                  </motion.button>

                  {/* Screen Share */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      isScreenSharing
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    <Monitor className="w-6 h-6" />
                  </motion.button>

                  {/* Chat */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-all"
                  >
                    <MessageSquare className="w-6 h-6" />
                  </motion.button>

                  {/* Participants */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="w-14 h-14 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-all relative"
                  >
                    <Users className="w-6 h-6" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                  </motion.button>

                  {/* Settings */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-all"
                  >
                    <Settings className="w-6 h-6" />
                  </motion.button>

                  {/* End Call */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 135 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleEndCall}
                    className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all ml-2"
                  >
                    <Phone className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Participants Panel */}
            <AnimatePresence>
              {showParticipants && (
                <motion.div
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 300 }}
                  className="absolute right-6 top-20 bottom-24 w-80"
                >
                  <Card className="h-full p-4 bg-slate-800/90 backdrop-blur-xl border-slate-700">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Participantes ({participants.length})
                    </h3>

                    <div className="space-y-3">
                      {participants.map((participant, index) => (
                        <motion.div
                          key={participant.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg"
                        >
                          <Avatar>
                            <AvatarFallback className="bg-blue-500 text-white">
                              {participant.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-white font-semibold">{participant.name}</div>
                            <div className="text-xs text-slate-400">{participant.role}</div>
                          </div>
                          <div className="flex gap-1">
                            {participant.isMuted && (
                              <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center">
                                <MicOff className="w-3 h-3 text-red-400" />
                              </div>
                            )}
                            {participant.isVideoOff && (
                              <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center">
                                <VideoOff className="w-3 h-3 text-red-400" />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recording Indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2"
            >
              <div className="flex items-center gap-2 bg-red-500 rounded-full px-4 py-2 text-white text-sm">
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-white rounded-full"
                />
                Llamada en curso
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function User({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}
