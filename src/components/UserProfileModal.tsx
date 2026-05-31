import { useEffect, useMemo, useState } from 'react';
import { Camera, Lock, Save, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useProfile } from '../hooks/useProfile';

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated?: (profile: { name?: string; email?: string; avatar_url?: string }) => void;
}

export function UserProfileModal({ open, onOpenChange, onProfileUpdated }: UserProfileModalProps) {
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

  useEffect(() => {
    if (open) fetchProfile();
  }, [open, fetchProfile]);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? '');
    setEmail(profile.email ?? '');
    setPhone(profile.phone ?? '');
    setPosition(profile.position ?? '');
  }, [profile]);

  const avatarPreview = useMemo(() => {
    if (!avatarFile) return null;
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const resetPasswords = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Nombre y correo son obligatorios.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }
    if (newPassword && !currentPassword) {
      toast.error('Ingrese su contraseña actual para cambiarla.');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        position: position.trim(),
        ...(newPassword ? { current_password: currentPassword, password: newPassword } : {}),
        ...(avatarFile ? { avatar: avatarFile } : {}),
      });
      setAvatarFile(null);
      resetPasswords();
      onProfileUpdated?.({
        name: updated.name,
        email: updated.email,
        avatar_url: updated.avatar_url,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-[min(760px,96vw)] flex-col gap-0 overflow-hidden border-border/80 bg-card p-0 shadow-2xl sm:rounded-2xl">
        <div className="border-border/60 border-b px-6 pb-4 pt-6 pr-14">
          <div className="flex items-start gap-3">
            <div className="bg-primary/15 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
              <UserRound className="size-6" />
            </div>
            <div className="min-w-0 space-y-2">
              <DialogTitle className="text-left text-2xl font-bold tracking-tight">Mi Perfil</DialogTitle>
              <DialogDescription className="text-left text-sm leading-relaxed">
                Actualice su foto, datos personales y contraseña de acceso.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <p className="text-muted-foreground py-10 text-center text-sm">Cargando perfil…</p>
          ) : (
            <div className="space-y-5">
              <section className="rounded-xl border border-border/60 bg-muted/15 p-4">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative mx-auto sm:mx-0">
                    <Avatar className="size-24 border border-border shadow-sm">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Vista previa" className="h-full w-full object-cover" />
                      ) : (
                        <>
                          <AvatarImage src={profile?.avatar_url} />
                          <AvatarFallback className="text-2xl">
                            {(profile?.name ?? 'U').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <label className="bg-primary text-primary-foreground absolute bottom-0 right-0 cursor-pointer rounded-full p-2 shadow transition hover:opacity-90">
                      <Camera className="size-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1 text-center sm:text-left">
                    <p className="font-semibold">{profile?.name ?? 'Usuario'}</p>
                    <p className="text-muted-foreground text-sm">{profile?.email}</p>
                    <p className="text-muted-foreground text-xs">
                      Rol: {profile?.role_display ?? profile?.role ?? 'Sin rol'}
                    </p>
                    {profile?.company ? <p className="text-muted-foreground text-xs">Empresa: {profile.company}</p> : null}
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-border/60 p-4">
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <UserRound className="size-4" />
                  Datos personales
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Nombre</Label>
                    <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Correo</Label>
                    <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">Teléfono</Label>
                    <Input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Opcional" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-position">Cargo</Label>
                    <Input id="profile-position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Opcional" />
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-border/60 p-4">
                <h3 className="mb-2 flex items-center gap-2 font-semibold">
                  <Lock className="size-4" />
                  Cambiar contraseña
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">Deje estos campos en blanco si no desea cambiarla.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-current-password">Contraseña actual</Label>
                    <Input
                      id="profile-current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-new-password">Nueva contraseña</Label>
                    <Input
                      id="profile-new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mín. 8 caracteres"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="profile-confirm-password">Confirmar nueva contraseña</Label>
                    <Input
                      id="profile-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                {newPassword && newPassword !== confirmPassword ? (
                  <p className="text-destructive mt-2 text-sm">Las contraseñas no coinciden.</p>
                ) : null}
              </section>
            </div>
          )}
        </div>

        <div className="border-border/60 border-t bg-background/95 px-6 py-4">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving || loading}>
              <Save className="mr-2 size-4" />
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
