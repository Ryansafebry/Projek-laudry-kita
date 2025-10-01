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
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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
    
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Password tidak cocok", variant: "destructive" });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: "Error", description: "Password minimal 6 karakter", variant: "destructive" });
      return;
    }
    if (!formData.agreeToTerms) {
      toast({ title: "Error", description: "Anda harus menyetujui syarat dan ketentuan", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        phone: formData.phone
      });

      if (result.success) {
        toast({
          title: "Registrasi Berhasil!",
          description: "Silakan cek email Anda untuk link verifikasi.",
        });
        setIsSubmitted(true);
      } else {
        toast({
          title: "Registrasi Gagal",
          description: "Email atau username mungkin sudah terdaftar.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mendaftar.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Verifikasi Email Anda</CardTitle>
            <CardDescription>
              Kami telah mengirimkan link verifikasi ke <strong>{formData.email}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Silakan klik link di email tersebut untuk mengaktifkan akun Anda. Jika tidak ada, periksa folder spam.</p>
            <Button asChild className="mt-4">
              <Link to="/">Kembali ke Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Label htmlFor="fullName" className="text-slate-800">Nama Lengkap</Label>
              <Input id="fullName" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-800">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-slate-800">Username</Label>
              <Input id="username" value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-slate-800">No. Telepon</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-slate-800">Password</Label>
              <Input id="password" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-slate-800">Konfirmasi Password</Label>
              <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} required />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="agree-terms" checked={formData.agreeToTerms} onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)} />
              <Label htmlFor="agree-terms" className="text-sm text-slate-700">Saya setuju dengan syarat dan ketentuan</Label>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-gradient-blue hover:bg-gradient-blue-dark">
              {isLoading ? "Mendaftarkan..." : "Daftar Akun"}
            </Button>
            <div className="text-center text-sm">
              Sudah punya akun? <Link to="/" className="text-teal-600 hover:underline">Login</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;