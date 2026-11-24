import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with the provided API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { success: false, error: "RESEND_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }
  return NextResponse.json({
    success: true,
    message: "Email service route (/api/send-email) is active and configured."
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status, customerName, customerEmail, orderTotal, orderDate } = body;

    const baseTemplate = (title: string, bodyText: string, actionUrl: string, actionText: string, badgeText: string, badgeColor: string, badgeBgColor: string) => `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; margin: 0; padding: 40px 20px; color: #ffffff; }
  .container { max-width: 600px; margin: 0 auto; background-color: #111111; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.05); }
  .header { background-color: #0A0A0A; padding: 30px 40px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
  .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; text-transform: none; letter-spacing: normal; }
  .content { padding: 40px; color: #d1d5db; font-size: 16px; line-height: 1.6; }
  .title { color: #ffffff; font-size: 22px; font-weight: 600; margin-top: 0; margin-bottom: 20px; }
  .order-details { background-color: #0A0A0A; border-radius: 8px; padding: 20px; margin: 30px 0; border: 1px solid rgba(255, 255, 255, 0.05); }
  .order-details p { margin: 8px 0; font-size: 15px; color: #9ca3af; }
  .order-details strong { color: #ffffff; }
  .status-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
  .btn-wrapper { text-align: center; margin-top: 35px; margin-bottom: 15px; }
  .btn { display: inline-block; background-color: #1E3A8A; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; transition: background-color 0.2s; }
  .footer { background-color: #0A0A0A; padding: 30px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05); }
  .footer p { color: #888888; font-size: 14px; margin: 5px 0; }
  .footer a { color: #10B981; text-decoration: none; font-weight: 500; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Aveon Spaces</h1>
    </div>
    <div class="content">
      <div class="status-badge" style="background-color: ${badgeBgColor}; color: ${badgeColor};">${badgeText}</div>
      <h2 class="title">${title}</h2>
      <p>Hi <strong>${customerName}</strong>,</p>
      ${bodyText}
      
      <div class="order-details">
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Date Placed:</strong> ${orderDate}</p>
        <p><strong>Total Amount:</strong> $${orderTotal}</p>
      </div>

      <div class="btn-wrapper">
        <a href="${actionUrl}" class="btn">${actionText}</a>
      </div>
    </div>
    <div class="footer">
      <p>Need help? Contact us at <a href="mailto:support@aveonspaces.com">support@aveonspaces.com</a></p>
      <p>&copy; ${new Date().getFullYear()} Aveon Spaces. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    let subject = '';
    let htmlContent = '';

    // Generate HTML content based on status
    switch (status) {
      case 'pending':
        subject = `Your Order ${orderId} is Pending`;
        htmlContent = baseTemplate(
          "Action Required: Order Pending",
          `<p>We have safely received your order! It is currently pending payment confirmation.</p><p>Please ensure your 100% advance payment is completed by contacting our finance team at <strong>1234567890</strong>.</p>`,
          "https://aveonspaces.com/track-order",
          "Track Order Status",
          "Pending Payment",
          "#F59E0B",
          "rgba(245, 158, 11, 0.1)"
        );
        break;
      case 'confirmed':
        subject = `Payment Received! Order ${orderId} is Confirmed`;
        htmlContent = baseTemplate(
          "Payment Confirmed!",
          `<p>Great news! We have successfully confirmed your payment.</p><p>Your order is now officially confirmed and will be moved to production shortly. We will keep you updated every step of the way.</p>`,
          "https://aveonspaces.com/track-order",
          "Track Your Order",
          "Payment Confirmed",
          "#10B981",
          "rgba(16, 185, 129, 0.1)"
        );
        break;
      case 'in progress':
        subject = `We are working on your Order ${orderId}`;
        htmlContent = baseTemplate(
          "Order In Progress",
          `<p>Your order is now in progress! Our expert team is currently preparing and assembling your Aveon Spaces items.</p><p>We will notify you as soon as it is ready for dispatch.</p>`,
          "https://aveonspaces.com/track-order",
          "Track Your Order",
          "In Progress",
          "#3B82F6",
          "rgba(59, 130, 246, 0.1)"
        );
        break;
      case 'in transit':
        subject = `Your Order ${orderId} has been Dispatched!`;
        htmlContent = baseTemplate(
          "Order Dispatched",
          `<p>Exciting news! Your order has been dispatched and is currently <strong>In Transit</strong>.</p><p>It is on its way to you right now. Get ready to transform your space!</p>`,
          "https://aveonspaces.com/track-order",
          "Track Your Delivery",
          "In Transit",
          "#8B5CF6",
          "rgba(139, 92, 246, 0.1)"
        );
        break;
      case 'completed':
        subject = `Order ${orderId} Delivered!`;
        htmlContent = baseTemplate(
          "Order Delivered",
          `<p>Your order has been successfully delivered and marked as Completed! We hope you absolutely love your new Aveon Spaces seating.</p><p>Thank you so much for shopping with us.</p>`,
          "https://aveonspaces.com",
          "Shop More Aveon Spaces",
          "Completed",
          "#10B981",
          "rgba(16, 185, 129, 0.1)"
        );
        break;
      case 'cancelled':
        subject = `Order ${orderId} Cancelled`;
        htmlContent = baseTemplate(
          "Order Cancelled",
          `<p>Your order has been cancelled.</p><p>If you believe this is an error or have any questions regarding your refund or cancellation, please contact our support team immediately.</p>`,
          "https://aveonspaces.com",
          "Return to Shop",
          "Cancelled",
          "#EF4444",
          "rgba(239, 68, 68, 0.1)"
        );
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    // Since the onboarding domain requires the "to" address to be verified,
    // we use the user's provided testing email (aurexdigitallabs@gmail.com) by default unless changed.
    // If we can send to customerEmail, we would replace aurexdigitallabs with customerEmail.
    
    // For now, to ensure it doesn't bounce in test mode:
    const targetEmail = 'aurexdigitallabs@gmail.com'; 

    const { data, error } = await resend.emails.send({
      from: 'Aveon Spaces <onboarding@resend.dev>',
      to: [targetEmail], // In production, this should be customerEmail
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Webhook route error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
