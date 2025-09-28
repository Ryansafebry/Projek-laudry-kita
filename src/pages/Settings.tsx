import { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useThemeContext } from "@/context/ThemeContext";
import { showSuccess } from "@/utils/toast";

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useThemeContext();

  // Profile State
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // Notification State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promoEmails, setPromoEmails] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setUsername(user.username);
      setEmail(user.email);
      setPhone(user.phone || "");
      setBio(user.bio || "");
      setProfilePic(user.profilePic || null);
    }
  }, [user]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = () => {
    if (user) {
      const updatedUser = {
        ...user,
        fullName,
        username,
        email,
        phone,
        bio,
        profilePic: profilePic || user.profilePic,
      };
      updateUser(updatedUser);
      showSuccess("Profil berhasil diperbarui!");
    }
  };

  if (!user) {
    return <div>Memuat data pengguna...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Pengaturan</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="password">Kata Sandi</TabsTrigger>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          <TabsTrigger value="display">Tampilan</TabsTrigger>
          <TabsTrigger value="security">Keamanan</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>
                Buat perubahan pada profil Anda di sini. Klik simpan setelah
                selesai.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profilePic || "https://github.com/shadcn.png"} alt={username} />
                    <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-pic-upload"
                    className="absolute bottom-0 right-0 bg-gradient-blue text-white rounded-full p-1.5 cursor-pointer hover:bg-gradient-blue-dark transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      id="profile-pic-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{fullName}</h3>
                  <p className="text-sm text-gray-500">@{username}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Ceritakan sedikit tentang diri Anda." />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleProfileSave} className="bg-gradient-blue hover:bg-gradient-blue-dark">
                <Save className="mr-2 h-4 w-4" />
                Simpan Perubahan
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Kata Sandi</CardTitle>
              <CardDescription>
                Ubah kata sandi Anda di sini. Setelah menyimpan, Anda akan
                keluar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Kata Sandi Saat Ini</Label>
                <Input id="current" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">Kata Sandi Baru</Label>
                <Input id="new" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-gradient-blue hover:bg-gradient-blue-dark">
                <Save className="mr-2 h-4 w-4" />
                Simpan Kata Sandi
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifikasi</CardTitle>
              <CardDescription>Atur preferensi notifikasi Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="email-notifs">Notifikasi Email</Label>
                  <p className="text-sm text-muted-foreground">Terima notifikasi melalui email.</p>
                </div>
                <Switch id="email-notifs" checked={emailNotifs} onCheckedChange={setEmailNotifs} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="push-notifs">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Notifikasi langsung di browser.</p>
                </div>
                <Switch id="push-notifs" checked={pushNotifs} onCheckedChange={setPushNotifs} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="sms-notifs">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Terima SMS untuk update penting.</p>
                </div>
                <Switch id="sms-notifs" checked={smsNotifs} onCheckedChange={setSmsNotifs} />
              </div>
              <Separator />
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="order-updates">Update Pesanan</Label>
                  <p className="text-sm text-muted-foreground">Notifikasi perubahan status pesanan.</p>
                </div>
                <Switch id="order-updates" checked={orderUpdates} onCheckedChange={setOrderUpdates} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="promo-emails">Email Promosi</Label>
                  <p className="text-sm text-muted-foreground">Terima info promo dan penawaran khusus.</p>
                </div>
                <Switch id="promo-emails" checked={promoEmails} onCheckedChange={setPromoEmails} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-gradient-blue hover:bg-gradient-blue-dark">
                <Save className="mr-2 h-4 w-4" />
                Simpan Preferensi
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Display Tab */}
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Tampilan</CardTitle>
              <CardDescription>Sesuaikan tampilan aplikasi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tema</Label>
                <RadioGroup value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Terang</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark">Gelap</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system">Sistem</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Bahasa</Label>
                <Select defaultValue="id">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Pilih bahasa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Bahasa Indonesia</SelectItem>
                    <SelectItem value="en" disabled>English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Keamanan</CardTitle>
              <CardDescription>Pengaturan keamanan dan privasi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informasi Akun</h3>
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">User ID:</span>
                    <span className="font-mono text-xs">{user.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bergabung:</span>
                    <span>
                      {new Date(user.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="2fa">Autentikasi Dua Faktor</Label>
                  <p className="text-sm text-muted-foreground">Tambahan keamanan untuk akun Anda.</p>
                </div>
                <Switch id="2fa" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Timeout Sesi (menit)</Label>
                <Input id="session-timeout" type="number" defaultValue={30} className="w-[180px]" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-gradient-blue hover:bg-gradient-blue-dark">
                <Save className="mr-2 h-4 w-4" />
                Simpan Pengaturan
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;