import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Paperclip,
  MoreVertical,
  Search,
  Smile,
  HelpCircle,
  BookOpen,
  Video,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender: 'user' | 'support';
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
}

const Support = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'chat' | 'contact' | 'faq'>('chat');
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'support',
      message: 'Halo! Selamat datang di Laundry Kita. Saya Sari, customer service kami. Ada yang bisa saya bantu hari ini?',
      timestamp: new Date(Date.now() - 300000),
      type: 'text'
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      message: message.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Simulate typing indicator
    setIsTyping(true);
    
    // Simulate support response
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        'Terima kasih atas pertanyaannya. Saya akan membantu Anda dengan senang hati.',
        'Baik, saya mengerti masalah Anda. Mari kita selesaikan bersama-sama.',
        'Untuk informasi lebih lanjut, saya akan menghubungkan Anda dengan tim teknis kami.',
        'Apakah ada hal lain yang bisa saya bantu?'
      ];
      
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'support',
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, supportMessage]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const faqItems = [
    {
      question: "Bagaimana cara melakukan pemesanan?",
      answer: "Anda bisa melakukan pemesanan melalui menu 'Tambah Order' di dashboard. Isi data pelanggan dan pilih jenis layanan yang diinginkan."
    },
    {
      question: "Berapa lama waktu pengerjaan laundry?",
      answer: "Waktu pengerjaan bervariasi: Cuci Kering Lipat (1-2 hari), Cuci Setrika (2-3 hari), Setrika Saja (1 hari), Bed Cover (2-3 hari)."
    },
    {
      question: "Apakah ada layanan antar jemput?",
      answer: "Ya, kami menyediakan layanan antar jemput gratis untuk area dalam kota dengan minimum order 5kg."
    },
    {
      question: "Bagaimana sistem pembayaran?",
      answer: "Kami menerima pembayaran tunai, transfer bank, e-wallet (GoPay, OVO, DANA), dan kartu kredit/debit."
    },
    {
      question: "Apakah pakaian saya aman?",
      answer: "Tentu! Kami memiliki sistem tracking untuk setiap item dan asuransi untuk keamanan barang pelanggan."
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bantuan & Dukungan</h1>
        <p className="text-muted-foreground">Kami siap membantu Anda 24/7</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'chat' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('chat')}
          className={activeTab === 'chat' ? 'bg-gradient-blue' : ''}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Live Chat
        </Button>
        <Button
          variant={activeTab === 'contact' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('contact')}
          className={activeTab === 'contact' ? 'bg-gradient-blue' : ''}
        >
          <Phone className="mr-2 h-4 w-4" />
          Kontak
        </Button>
        <Button
          variant={activeTab === 'faq' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('faq')}
          className={activeTab === 'faq' ? 'bg-gradient-blue' : ''}
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          FAQ
        </Button>
      </div>

      {/* Live Chat Tab */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/support-avatar.jpg" />
                  <AvatarFallback className="bg-gradient-blue text-white">CS</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-sm">Customer Service</CardTitle>
                  <CardDescription className="text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Online - Biasanya membalas dalam beberapa menit
                    </div>
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Messages Area */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="h-6 w-6">
                        {msg.sender === 'support' ? (
                          <>
                            <AvatarImage src="/support-avatar.jpg" />
                            <AvatarFallback className="bg-gradient-blue text-white text-xs">CS</AvatarFallback>
                          </>
                        ) : (
                          <>
                            <AvatarImage src="/user-avatar.jpg" />
                            <AvatarFallback className="bg-gray-500 text-white text-xs">U</AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div className={`rounded-lg px-3 py-2 ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-blue text-white' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'user' ? 'text-blue-100' : 'text-muted-foreground'
                        }`}>
                          {msg.timestamp.toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gradient-blue text-white text-xs">CS</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pesan Anda..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className="bg-gradient-blue hover:bg-gradient-blue-dark"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <BookOpen className="mr-2 h-4 w-4" />
                Panduan Pengguna
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Video className="mr-2 h-4 w-4" />
                Video Tutorial
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Laporan Masalah
              </Button>
              
              <Separator />
              
              <div className="space-y-2">
                <Label className="text-xs font-medium">Status Layanan</Label>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Sistem</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Normal</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Pembayaran</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Normal</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Notifikasi</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Normal</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kontak</CardTitle>
              <CardDescription>Hubungi kami melalui berbagai channel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Telepon</p>
                  <p className="text-sm text-muted-foreground">(021) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">+62 816-5322-05</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">support@laundrykita.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Jam Operasional</p>
                  <p className="text-sm text-muted-foreground">24 Jam Setiap Hari</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kirim Pesan</CardTitle>
              <CardDescription>Kirimkan pertanyaan atau saran Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subjek</Label>
                <Input id="subject" placeholder="Masukkan subjek pesan" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Anda</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Pesan</Label>
                <Textarea 
                  id="message" 
                  placeholder="Tulis pesan Anda di sini..."
                  rows={4}
                />
              </div>
              
              <Button className="w-full bg-gradient-blue hover:bg-gradient-blue-dark">
                <Send className="mr-2 h-4 w-4" />
                Kirim Pesan
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari pertanyaan..." className="max-w-md" />
          </div>
          
          <div className="grid gap-4">
            {faqItems.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
