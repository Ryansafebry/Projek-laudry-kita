import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shirt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    agreeToTerms: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.fullName || !formData.email || !formData.username || !formData.password) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error", 
        description: "Password dan konfirmasi password tidak cocok",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password minimal 6 karakter",
        variant: "destructive"
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Error",
        description: "Anda harus menyetujui syarat dan ketentuan",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await register({
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        phone: formData.phone
      });

      if (success) {
        toast({
          title: "Berhasil!",
          description: "Akun berhasil dibuat. Silakan login dengan akun baru Anda.",
        });

        // Redirect ke login setelah 2 detik
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        toast({
          title: "Registrasi Gagal",
          description: "Username atau email sudah digunakan. Silakan gunakan yang lain.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mendaftar. Silakan coba lagi.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-blue shadow-lg">
              <Shirt className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-gradient-blue font-bold">Laundry Kita</CardTitle>
          </div>
          <CardDescription className="text-teal-600">
            Buat akun baru untuk memulai
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName" className="text-black">Nama Lengkap</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Masukan nama lengkap"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-black">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukan email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-black">No. Telepon</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Masukan nomor telepon"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username" className="text-black">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukan username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-black">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Masukan password (min. 6 karakter)" 
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required 
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-black">Konfirmasi Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="Ulangi password" 
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required 
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="agree-terms" 
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                className="border-teal-300 data-[state=checked]:bg-teal-500" 
              />
              <Label
                htmlFor="agree-terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600"
              >
                Saya setuju dengan syarat dan ketentuan
              </Label>
            </div>

            <Button type="submit" className="w-full bg-gradient-blue hover:bg-gradient-blue-dark shadow-lg hover:shadow-xl transition-all duration-200">
              Daftar Akun
            </Button>

            <div className="text-center text-sm text-slate-600">
              Sudah punya akun?{" "}
              <Link to="/" className="text-teal-600 hover:text-teal-700 font-medium">
                Login di sini
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-teal-600/70">
        © Laundry Kita 2025
      </footer>
    </div>
  );
};

export default Register;
