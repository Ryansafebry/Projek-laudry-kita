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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerificationEmail } = useAuth();
  const { toast } = useToast();
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Jika tidak ada email, arahkan kembali ke registrasi
      toast({
        title: "Error",
        description: "Email tidak ditemukan. Silakan daftar terlebih dahulu.",
        variant: "destructive"
      });
      navigate("/register");
    }
  }, [searchParams, navigate, toast]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Kode OTP harus 6 digit.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await verifyEmail(email, otp);
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
        setOtp("");
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
    if (!email) return;

    setIsResending(true);
    try {
      const success = await resendVerificationEmail(email);
      if (success) {
        toast({
          title: "Berhasil!",
          description: "Email verifikasi telah dikirim ulang. Silakan cek inbox (atau konsol).",
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
            Kami telah mengirimkan kode 6 digit ke <strong>{email}</strong>. Silakan masukkan kode di bawah.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="grid gap-6">
            <div className="grid gap-2 text-center">
              <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || otp.length < 6}
              className="w-full bg-gradient-blue hover:bg-gradient-blue-dark shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? "Memverifikasi..." : "Verifikasi Akun"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-slate-600">
                Tidak menerima kode?
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
                  "Kirim ulang kode"
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-slate-600">
              Salah email? Kembali ke{" "}
              <Link to="/register" className="text-teal-600 hover:text-teal-700 font-medium">
                halaman registrasi
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