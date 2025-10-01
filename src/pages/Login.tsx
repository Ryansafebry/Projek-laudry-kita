import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shirt } from "lucide-react";
import SupabaseToggle from "@/components/SupabaseToggle";

const Login = () => {
  const navigate = useNavigate();
  const { login, useSupabase } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.emailOrUsername || !formData.password) {
      toast({
        title: "Error",
        description: "Email/Username dan password harus diisi",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    
    try {
      const success = await login(formData.emailOrUsername, formData.password);
      
      if (success) {
        toast({
          title: "Berhasil!",
          description: "Login berhasil. Selamat datang!",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login Gagal",
          description: useSupabase 
            ? "Email atau password salah. Silakan cek kembali."
            : "Username atau password salah, atau email belum diverifikasi.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 p-4">
      <Card className="w-full max-w-sm shadow-2xl border-0 bg-white/90 backdrop-blur-md mb-6">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-blue shadow-lg">
              <Shirt className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-gradient-blue font-bold">Laundry Kita</CardTitle>
          </div>
          <CardDescription className="text-teal-600">
            Silakan masuk untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="emailOrUsername" className="text-black">Email atau Username</Label>
              <Input
                id="emailOrUsername"
                type="text"
                placeholder="Masukan email atau username"
                value={formData.emailOrUsername}
                onChange={(e) => handleInputChange('emailOrUsername', e.target.value)}
                required
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-black">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Masukan password" 
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required 
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember-me" 
                checked={formData.rememberMe}
                onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                className="border-teal-300 data-[state=checked]:bg-teal-500" 
              />
              <Label
                htmlFor="remember-me"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600"
              >
                Ingat saya
              </Label>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-blue hover:bg-gradient-blue-dark shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? "Memproses..." : "Login"}
            </Button>

            <div className="text-center text-sm text-slate-600">
              Belum punya akun?{" "}
              <Link to="/register" className="text-teal-600 hover:text-teal-700 font-medium">
                Daftar di sini
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <SupabaseToggle />

      <footer className="mt-8 text-center text-sm text-teal-600/70">
        © Laundry Kita 2025
      </footer>
    </div>
  );
};

export default Login;