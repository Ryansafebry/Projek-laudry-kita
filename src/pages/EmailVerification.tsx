import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
import { Shirt, Mail, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerificationEmail, bypassEmailVerification } = useAuth();
  const { toast } = useToast();
  
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const codeParam = searchParams.get("code");
    
    if (emailParam) {
      setEmail(emailParam);
    }
    
    // Auto-verify jika ada code di URL
    if (codeParam && emailParam) {
      handleAutoVerify(emailParam, codeParam);
    }
  }, [searchParams]);

  const handleAutoVerify = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const success = await verifyEmail(email, code);
      if (success) {
        setIsVerified(true);
        toast({
          title: "Berhasil!",
          description: "Email berhasil diverifikasi. Anda akan diarahkan ke halaman login.",
        });
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        toast({
          title: "Verifikasi Gagal",
          description: "Kode verifikasi tidak valid atau sudah kedaluwarsa.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat verifikasi email.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || !email) {
      toast({
        title: "Error",
        description: "Kode verifikasi dan email harus diisi",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await verifyEmail(email, verificationCode);
      if (success) {
        setIsVerified(true);
        toast({
          title: "Berhasil!",
          description: "Email berhasil diverifikasi. Anda akan diarahkan ke halaman login.",
        });
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        toast({
          title: "Verifikasi Gagal",
          description: "Kode verifikasi tidak valid atau sudah kedaluwarsa.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat verifikasi email.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email tidak ditemukan. Silakan daftar ulang.",
        variant: "destructive"
      });
      return;
    }

    setIsResending(true);
    try {
      const success = await resendVerificationEmail(email);
      if (success) {
        toast({
          title: "Berhasil!",
          description: "Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.",
        });
      } else {
        toast({
          title: "Gagal",
          description: "Gagal mengirim ulang email verifikasi.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengirim ulang email.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-md">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
              <div className="p-3 rounded-2xl bg-green-500 shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl text-green-600 font-bold">Berhasil!</CardTitle>
            </div>
            <CardDescription className="text-green-600">
              Email Anda telah berhasil diverifikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-600 mb-4">
              Akun Anda telah aktif. Anda akan diarahkan ke halaman login dalam beberapa detik.
            </p>
            <Button 
              onClick={() => navigate("/")}
              className="w-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Login Sekarang
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
              <Mail className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-gradient-blue font-bold">Verifikasi Email</CardTitle>
          </div>
          <CardDescription className="text-teal-600">
            Masukkan kode verifikasi yang telah dikirim ke email Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualVerify} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-black">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="verificationCode" className="text-black">Kode Verifikasi</Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Masukan kode 6 digit"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                required
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 text-center text-lg tracking-widest"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-blue hover:bg-gradient-blue-dark shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? "Memverifikasi..." : "Verifikasi Email"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-slate-600">
                Tidak menerima email?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full border-teal-200 text-teal-600 hover:bg-teal-50"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim ulang...
                  </>
                ) : (
                  "Kirim ulang kode verifikasi"
                )}
              </Button>
              
              {/* Development Mode: Show verification code */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 font-medium mb-2">
                  🔧 Mode Development
                </p>
                <p className="text-xs text-yellow-700 mb-2">
                  Kode verifikasi ditampilkan di Console Browser (F12 → Console)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (email) {
                      setIsLoading(true);
                      try {
                        const success = await bypassEmailVerification(email);
                        if (success) {
                          setIsVerified(true);
                          toast({
                            title: "Berhasil!",
                            description: "Email berhasil diverifikasi (bypass mode). Anda akan diarahkan ke halaman login.",
                          });
                          setTimeout(() => {
                            navigate("/");
                          }, 2000);
                        } else {
                          toast({
                            title: "Gagal",
                            description: "Gagal memverifikasi email.",
                            variant: "destructive"
                          });
                        }
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Terjadi kesalahan saat bypass verifikasi.",
                          variant: "destructive"
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }
                  }}
                  disabled={isLoading}
                  className="w-full text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  🚀 Bypass Verifikasi (Development Only)
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-slate-600">
              Kembali ke{" "}
              <Link to="/" className="text-teal-600 hover:text-teal-700 font-medium">
                halaman login
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

export default EmailVerification;
