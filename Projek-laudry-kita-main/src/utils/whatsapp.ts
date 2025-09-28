/**
 * WhatsApp utility functions for sending notifications to customers
 */

export interface WhatsAppMessage {
  phone: string;
  message: string;
}

/**
 * Format phone number for WhatsApp API
 * Removes special characters and ensures proper format
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  let cleanPhone = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 62 (Indonesia country code)
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1);
  }
  
  // If doesn't start with 62, add it
  if (!cleanPhone.startsWith('62')) {
    cleanPhone = '62' + cleanPhone;
  }
  
  return cleanPhone;
};

/**
 * Generate WhatsApp message templates for different order statuses
 */
export const getWhatsAppMessage = (status: string, customerName: string, orderId: string): string => {
  const messages = {
    'Diproses': `Halo ${customerName}! 👋\n\nPesanan Anda dengan ID: *${orderId}* sedang dalam proses. Tim kami sedang mengerjakan laundry Anda dengan teliti.\n\nTerima kasih atas kepercayaan Anda! 🙏\n\n_Laundry Kita - Melayani dengan Sepenuh Hati_`,
    
    'Selesai': `Halo ${customerName}! 🎉\n\nKabar baik! Pesanan Anda dengan ID: *${orderId}* telah selesai dikerjakan.\n\nLaundry Anda sudah bersih dan wangi, siap untuk diambil! 👕✨\n\nTerima kasih telah mempercayakan laundry Anda kepada kami.\n\n_Laundry Kita - Melayani dengan Sepenuh Hati_`,
    
    'Diambil': `Halo ${customerName}! 📦\n\nPesanan Anda dengan ID: *${orderId}* siap diambil!\n\nSilakan datang ke toko kami untuk mengambil laundry Anda. Jangan lupa membawa struk sebagai bukti pengambilan.\n\nTerima kasih! 🙏\n\n_Laundry Kita - Melayani dengan Sepenuh Hati_`
  };
  
  return messages[status as keyof typeof messages] || `Update pesanan ${orderId}: Status berubah menjadi ${status}`;
};

/**
 * Send WhatsApp message using different methods
 */
export const sendWhatsAppMessage = (phone: string, message: string, method: 'web' | 'api' | 'desktop' = 'web'): void => {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  
  switch (method) {
    case 'web':
      // Open WhatsApp Web with pre-filled message
      const whatsappWebUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
      window.open(whatsappWebUrl, '_blank');
      break;
      
    case 'api':
      // For future integration with WhatsApp Business API
      // This would require a backend service and WhatsApp Business account
      console.log('WhatsApp Business API integration needed for automatic sending');
      // Fallback to web method
      const fallbackUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
      window.open(fallbackUrl, '_blank');
      break;
      
    case 'desktop':
      // Try to open WhatsApp Desktop app
      const desktopUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
      window.location.href = desktopUrl;
      
      // Fallback to web if desktop app not available
      setTimeout(() => {
        const webUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
        window.open(webUrl, '_blank');
      }, 1000);
      break;
  }
};

/**
 * Simulate automatic WhatsApp message sending
 * In a real application, this would integrate with WhatsApp Business API
 */
export const sendAutomaticWhatsApp = async (
  customerName: string,
  customerPhone: string,
  orderId: string,
  status: string
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      const message = getWhatsAppMessage(status, customerName, orderId);
      
      // Simulate successful sending (90% success rate)
      const success = Math.random() > 0.1;
      
      if (success) {
        // Log the message that would be sent
        console.log(`📱 WhatsApp Message Sent to ${customerPhone}:`);
        console.log(message);
        
        resolve({
          success: true,
          message: `Pesan WhatsApp berhasil dikirim ke ${customerName} (${customerPhone})`
        });
      } else {
        resolve({
          success: false,
          message: `Gagal mengirim pesan WhatsApp ke ${customerName}. Silakan coba lagi.`
        });
      }
    }, 1500); // Simulate 1.5 second delay
  });
};

/**
 * Send order status notification via WhatsApp
 */
export const sendOrderNotification = (
  customerName: string,
  customerPhone: string,
  orderId: string,
  status: string,
  method: 'auto' | 'web' | 'desktop' = 'auto'
): void => {
  const message = getWhatsAppMessage(status, customerName, orderId);
  
  if (method === 'auto') {
    // For demo purposes, just log the message
    console.log(`🤖 Auto-sending WhatsApp to ${customerName} (${customerPhone}):`);
    console.log(message);
  } else {
    sendWhatsAppMessage(customerPhone, message, method === 'web' ? 'web' : 'desktop');
  }
};
