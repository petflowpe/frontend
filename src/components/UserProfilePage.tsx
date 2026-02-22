import { useEffect, useState } from 'react';
import { User, Save, Camera, Lock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useProfile } from '../hooks/useProfile';
import { LoadingSpinner } from './LoadingSpinner';

export function UserProfilePage() {
  const { profile, loading, fetchProfile, updateProfile } = useProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setEmail(profile.email ?? '');
      setPhone(profile.phone ?? '');
      setPosition(profile.position ?? '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: { name?: string; email?: string; current_password?: string; password?: string; phone?: string; position?: string; avatar?: File } = { name, email, phone, position };
      if (newPassword) { payload.current_password = currentPassword; payload.password = newPassword; }
      if (avatarFile) payload.avatar = avatarFile;
      await updateProfile(payload);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setAvatarFile(null);
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Mi Perfil</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {avatarFile ? <img src={URL.createObjectURL(avatarFile)} alt="Vista previa" className="h-full w-full object-cover" /> : (<><AvatarImage src={profile?.avatar_url} /><AvatarFallback className="text-2xl">{profile?.name?.slice(0, 2).toUpperCase() ?? 'U'}</AvatarFallback></>)}
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer shadow">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setAvatarFile(e.target.files[0])} />
              </label>
            </div>
            <div className="flex-1 w-full space-y-2">
              <p className="text-sm text-muted-foreground">Rol: {profile?.role_display ?? profile?.role ?? '—'}</p>
              {profile?.company && <p className="text-sm text-muted-foreground">Empresa: {profile.company}</p>}
              {profile?.last_login_at && <p className="text-xs text-muted-foreground">Ultimo acceso: {new Date(profile.last_login_at).toLocaleString()}</p>}
            </div>
          </div>
        </Card>
        <Card className="p-6 space-y-4">
          <h2 className="font-medium flex items-center gap-2"><User className="h-4 w-4" /> Datos personales</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="name">Nombre</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="email">Correo</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="phone">Telefono</Label><Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Opcional" /></div>
            <div className="space-y-2"><Label htmlFor="position">Cargo</Label><Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Opcional" /></div>
          </div>
        </Card>
        <Card className="p-6 space-y-4">
          <h2 className="font-medium flex items-center gap-2"><Lock className="h-4 w-4" /> Cambiar contrasena</h2>
          <p className="text-sm text-muted-foreground">Deja en blanco si no quieres cambiar la contrasena.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="current_password">Contrasena actual</Label><Input id="current_password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Solo si cambias" /></div>
            <div className="space-y-2"><Label htmlFor="new_password">Nueva contrasena</Label><Input id="new_password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 caracteres" /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="confirm_password">Confirmar nueva contrasena</Label><Input id="confirm_password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
          </div>
          {newPassword && newPassword !== confirmPassword && <p className="text-sm text-destructive">Las contrasenas no coinciden.</p>}
        </Card>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving || (!!newPassword && newPassword !== confirmPassword)}><Save className="h-4 w-4 mr-2" />{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
        </div>
      </form>
    </div>
  );
}
