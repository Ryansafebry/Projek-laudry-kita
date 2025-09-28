import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bell, 
  Palette, 
  Globe, 
  Shield, 
  Camera, 
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useThemeContext } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const Settings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useThemeContext();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/placeholder-avatar.jpg");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState({
    // Profile Settings
    name: "",
    email: "",
    username: "",
    phone: "",
    address: "",
    bio: "",
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotionalEmails: false,
    
    // Appearance Settings
    language: "id",
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: "30",
  });

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        name: user.fullName || "",
        email: user.email || "",
        username: user.username || "",
        phone: user.phone || "",
        // Keep existing address and bio as they're not part of registration
        address: prev.address || "",
        bio: prev.bio || `Pengguna ${user.fullName} - Laundry Kita`,
      }));
    }
  }, [user]);

  const handleSave = () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Tidak ada pengguna yang sedang login.",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!settings.name.trim() || !settings.email.trim() || !settings.username.trim()) {
      toast({
        title: "Error",
        description: "Nama lengkap, email, dan username harus diisi.",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.email)) {
      toast({
        title: "Error",
        description: "Format email tidak valid.",
        variant: "destructive"
      });
      return;
    }

    // Update user data in localStorage
    try {
      const savedUsers = localStorage.getItem('laundry_users');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const userIndex = users.findIndex((u: any) => u.id === user.id);
        
        if (userIndex !== -1) {
          // Check if username or email is already taken by another user
          const existingUser = users.find((u: any, index: number) => 
            index !== userIndex && (u.username === settings.username || u.email === settings.email)
          );
          
          if (existingUser) {
            toast({
              title: "Error",
              description: "Username atau email sudah digunakan oleh pengguna lain.",
              variant: "destructive"
            });
            return;
          }

          // Update user data
          users[userIndex] = {
            ...users[userIndex],
            fullName: settings.name,
            email: settings.email,
            username: settings.username,
            phone: settings.phone
          };

          // Save updated users array
          localStorage.setItem('laundry_users', JSON.stringify(users));
          
          // Update current user in localStorage
          const updatedUser = users[userIndex];
          localStorage.setItem('laundry_current_user', JSON.stringify(updatedUser));
          
          // Note: In a real app, you would also update the AuthContext state here
          // For now, the user will see changes after refresh
          
          toast({
            title: "Pengaturan Disimpan",
            description: "Profil Anda telah berhasil diperbarui. Silakan refresh halaman untuk melihat perubahan.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan data.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Format File Tidak Didukung",
        description: "Silakan pilih file dengan format JPEG, JPG, atau PNG.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Terlalu Besar",
        description: "Ukuran file maksimal adalah 2MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarUrl(result);
      toast({
        title: "Foto Berhasil Diupload",
        description: "Foto profil Anda telah berhasil diperbarui.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground">Kelola preferensi dan pengaturan akun Anda</p>
        </div>
        <Button onClick={handleSave} className="bg-gradient-blue hover:bg-gradient-blue-dark">
          <Save className="mr-2 h-4 w-4" />
          Simpan Perubahan
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil Pengguna
            </CardTitle>
            <CardDescription>
              Informasi dasar tentang akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-lg bg-gradient-blue text-white">
                  {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpeg,.jpg,.png"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button variant="outline" size="sm" onClick={handleUploadClick}>
                  <Camera className="mr-2 h-4 w-4" />
                  Ubah Foto
                </Button>
                <p className="text-sm text-muted-foreground">
                  JPEG, JPG, atau PNG. Maksimal 2MB.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={settings.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Masukkan username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Masukkan email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Masukkan nomor telepon"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Masukkan alamat lengkap"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={settings.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Ceritakan sedikit tentang diri Anda..."
                rows={3}
              />
            </div>

            {/* User Registration Info */}
            {user && (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Informasi Akun</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">User ID:</span> {user.id}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bergabung:</span> {new Date(parseInt(user.id)).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifikasi
            </CardTitle>
            <CardDescription>
              Atur preferensi notifikasi Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifikasi Email</Label>
                <p className="text-sm text-muted-foreground">
                  Terima notifikasi melalui email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Notifikasi langsung di browser
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Terima SMS untuk update penting
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Update Pesanan</Label>
                <p className="text-sm text-muted-foreground">
                  Notifikasi perubahan status pesanan
                </p>
              </div>
              <Switch
                checked={settings.orderUpdates}
                onCheckedChange={(checked) => handleInputChange('orderUpdates', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Promosi</Label>
                <p className="text-sm text-muted-foreground">
                  Terima info promo dan penawaran khusus
                </p>
              </div>
              <Switch
                checked={settings.promotionalEmails}
                onCheckedChange={(checked) => handleInputChange('promotionalEmails', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Tampilan
            </CardTitle>
            <CardDescription>
              Sesuaikan tampilan aplikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Terang</SelectItem>
                    <SelectItem value="dark">Gelap</SelectItem>
                    <SelectItem value="system">Sistem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Bahasa</Label>
                <Select value={settings.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Bahasa Indonesia</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Keamanan
            </CardTitle>
            <CardDescription>
              Pengaturan keamanan dan privasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autentikasi Dua Faktor</Label>
                <p className="text-sm text-muted-foreground">
                  Tambahan keamanan untuk akun Anda
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleInputChange('twoFactorAuth', checked)}
                />
                {settings.twoFactorAuth && <Badge variant="secondary">Aktif</Badge>}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Timeout Sesi (menit)</Label>
              <Select value={settings.sessionTimeout} onValueChange={(value) => handleInputChange('sessionTimeout', value)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 menit</SelectItem>
                  <SelectItem value="30">30 menit</SelectItem>
                  <SelectItem value="60">1 jam</SelectItem>
                  <SelectItem value="120">2 jam</SelectItem>
                  <SelectItem value="never">Tidak pernah</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <Label>Ubah Password</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Password Saat Ini</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password saat ini"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Masukkan password baru"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
