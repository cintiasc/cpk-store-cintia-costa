// SMS Service - Simulation Layer
// In production, replace this with actual SMS provider (Twilio, Infobip, SMSDev, etc.)

interface SMSMessage {
  to: string; // Phone number
  message: string;
}

/**
 * Sends an SMS message (simulation mode)
 * In production, this would call a real SMS API
 */
export async function sendSMS(params: SMSMessage): Promise<void> {
  const { to, message } = params;
  
  // Validate phone number format (basic validation)
  if (!to || to.trim().length < 10) {
    console.error('[SMS] Invalid phone number:', to);
    return;
  }

  // SIMULATION: Log the SMS to console instead of actually sending
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 SIMULAÇÃO DE ENVIO DE SMS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📞 Para: ${to}`);
  console.log(`📝 Mensagem:\n${message}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // TODO: Replace with actual SMS provider
  // Example with Twilio:
  // const accountSid = process.env.TWILIO_ACCOUNT_SID;
  // const authToken = process.env.TWILIO_AUTH_TOKEN;
  // const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  // const client = require('twilio')(accountSid, authToken);
  // await client.messages.create({
  //   body: message,
  //   from: twilioPhone,
  //   to: to
  // });
}

/**
 * Sends welcome SMS to newly pre-registered user
 */
export async function sendWelcomeSMS(params: {
  phoneNumber: string;
  firstName?: string;
  email: string;
  role: string;
}): Promise<void> {
  const { phoneNumber, firstName, email, role } = params;
  
  const roleNames: Record<string, string> = {
    client: 'Cliente',
    employee: 'Funcionário',
    admin: 'Administrador',
  };

  const greeting = firstName ? `Olá ${firstName}` : 'Olá';
  const roleName = roleNames[role] || role;

  const message = `${greeting}! 🧁

Você foi cadastrado na Cupcake Store como ${roleName}.

📧 Email: ${email}
🔐 Acesso: Use sua conta Replit para fazer login

Para acessar o sistema:
1. Acesse a Cupcake Store
2. Clique em "Entrar"
3. Faça login com sua conta Replit
4. Se não tem conta Replit, crie uma gratuitamente

Seja bem-vindo(a)!
- Equipe Cupcake Store`;

  await sendSMS({ to: phoneNumber, message });
}

/**
 * Sends order ready notification to customer
 */
export async function sendOrderReadySMS(params: {
  phoneNumber: string;
  customerName?: string;
  orderId: number;
  totalAmount: string;
}): Promise<void> {
  const { phoneNumber, customerName, orderId, totalAmount } = params;
  
  const greeting = customerName ? `Olá ${customerName}` : 'Olá';

  const message = `${greeting}! 🧁

Seu pedido #${orderId} está PRONTO PARA RETIRADA! 🎉

💰 Total: R$ ${totalAmount}

Você pode buscar seu pedido na Cupcake Store.

Obrigado pela preferência!
- Equipe Cupcake Store`;

  await sendSMS({ to: phoneNumber, message });
}
