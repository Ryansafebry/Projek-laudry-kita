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
import { Camera, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { showSuccess } from "@/utils/toast";

const Settings = () => {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);

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

  const handleSave = () => {
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="password">Kata Sandi</TabsTrigger>
        </TabsList>
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
                  <label htmlFor="name">Nama Lengkap</label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="username">Username</label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email">Email</label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone">Nomor Telepon</label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="bio">Bio</label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Ceritakan sedikit tentang diri Anda." />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} className="bg-gradient-blue hover:bg-gradient-blue-dark">
                <Save className="mr-2 h-4 w-4" />
                Simpan Perubahan
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
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
                <label htmlFor="current">Kata Sandi Saat Ini</label>
                <Input id="current" type="password" />
              </div>
              <div className="space-y-2">
                <label htmlFor="new">Kata Sandi Baru</label>
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
      </Tabs>
    </div>
  );
};

export default Settings;