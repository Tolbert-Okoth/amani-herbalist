const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

/**
 * Configure your email transporter
 * NOTE: You must provide EMAIL_USER and EMAIL_PASS in your .env file
 */
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Generates a PDF buffer in memory (no need to save to disk)
 * Maroon and Gold branding for Fohow Eden Life
 */
const generateInvoicePDF = async (order, cartItems) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    
    doc.on('data', buffers.push.bind(buffers));
    doc.on('error', (err) => reject(err));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // --- BRANDING & HEADER ---
    try {
      doc.image('./public/logo.png', 50, 45, { width: 50 }); 
    } catch (err) {
      console.log("No logo found for PDF");
    }

    doc.fillColor('#811816').fontSize(24).text('FOHOW EDEN LIFE', { align: 'center' });

    doc.fillColor('#d2a356').fontSize(10).text('Ancient Wisdom for Modern Kenyan Living', { align: 'center' });
    doc.moveDown();
    
    doc.fillColor('#1c1a16').fontSize(16).text('Wholesale Order Invoice', { align: 'center' });
    doc.moveDown(2);

    // --- ORDER DETAILS ---
    doc.fontSize(12).fillColor('#3a3630');
    doc.text(`Order Number: ${order.order_number || '#' + order.id}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Customer Name: ${order.customer_name}`);
    doc.text(`Phone: ${order.customer_phone}`);
    if (order.franchise_id) {
        doc.text(`Franchise ID Applied: ${order.franchise_id}`);
    }
    if (order.mpesa_receipt) {
        doc.text(`Payment Ref (Transaction Code): ${order.mpesa_receipt}`);
    }
    doc.moveDown(2);

    // --- TABLE HEADER ---
    const tableTop = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Item', 50, tableTop);
    doc.text('Qty', 300, tableTop);
    doc.text('Price (KES)', 400, tableTop);
    
    // Draw a line under header
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#ede8df').stroke();
    
    doc.font('Helvetica');
    let yPosition = tableTop + 25;

    // --- CART ITEMS ---
    cartItems.forEach(item => {
      // PDFkit handles text wrapping
      doc.text(item.name || 'Unknown Product', 50, yPosition, { width: 240 });
      doc.text(item.quantity.toString(), 300, yPosition);
      doc.text(Number(item.price_kes || item.price).toLocaleString(), 400, yPosition);
      yPosition += 20;
    });

    // Draw a line under items
    doc.moveTo(50, yPosition).lineTo(550, yPosition).strokeColor('#ede8df').stroke();
    yPosition += 15;

    // --- TOTALS ---
    doc.font('Helvetica-Bold');
    doc.text('Subtotal:', 300, yPosition);
    doc.text(Number(order.subtotal).toLocaleString(), 400, yPosition);
    
    if (order.discount_amount > 0) {
      doc.text('Discount:', 300, yPosition + 20);
      doc.text('-' + Number(order.discount_amount).toLocaleString(), 400, yPosition + 20);
      yPosition += 20;
    }

    // VAT computation removed by user request

    doc.fillColor('#811816').fontSize(14);
    doc.text('Total (KES):', 300, yPosition + 35);
    doc.text(Number(order.total_amount).toLocaleString(), 400, yPosition + 35);


    // --- FOOTER ---
    doc.fillColor('#a0998e').fontSize(10).font('Helvetica');
    doc.text('Thank you for partnering with Fohow Eden Life.', 50, 700, { align: 'center' });
    doc.text('Cargen House, Nairobi | www.fohowedenlife.co.ke', { align: 'center' });

    doc.end();
  });
};

/**
 * Sends the confirmation email with the PDF attached
 */
const sendOrderConfirmationEmail = async (customerEmail, order, cartItems) => {
  if (!customerEmail) {
    console.error('No customer email provided, skipping confirmation email.');
    return;
  }

  try {
    const pdfBuffer = await generateInvoicePDF(order, cartItems);

    const mailOptions = {
      from: `"Fohow Eden Life" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Order Confirmation ${order.order_number || '#' + order.id} - Fohow Eden Life`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1c1a16; max-w: 600px; margin: 0 auto; border: 1px solid #ede8df; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #811816; padding: 20px; text-align: center;">
                <h1 style="color: #f7f4ef; margin: 0;">FOHOW EDEN LIFE</h1>
                <p style="color: #d2a356; margin: 5px 0 0 0; font-size: 12px; letter-spacing: 2px;">WHOLESALE PORTAL</p>
            </div>
            <div style="padding: 30px;">
                <h2 style="font-family: Georgia, serif;">Hello ${order.customer_name},</h2>
                <p>Thank you for your B2B wholesale order. We have successfully received your request and our dispatch team is preparing it for fulfillment.</p>
                <div style="background-color: #faf9f6; padding: 20px; border-radius: 8px; border-left: 4px solid #d2a356; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Order Number:</strong> ${order.order_number || '#' + order.id}</p>
                  <p style="margin: 5px 0 0 0;"><strong>Total Amount:</strong> KES ${Number(order.total_amount).toLocaleString()}</p>
                  ${order.mpesa_receipt ? `<p style="margin: 5px 0 0 0; color: #4a7c59;"><strong>Payment Ref:</strong> ${order.mpesa_receipt}</p>` : ''}
                </div>
                <p>Please find your official PDF invoice attached to this email for your clinical records.</p>
                <br>
                <p style="font-size: 12px; color: #8a8070;">If you have any questions, please contact our support team via our official WhatsApp line.</p>
            </div>
            <div style="background-color: #fcfbf9; padding: 15px; text-align: center; border-top: 1px solid #ede8df;">
              <p style="margin: 0; font-size: 11px; color: #a0998e;">Cargen House, Nairobi | © 2026 Fohow Eden Life</p>
            </div>
        </div>
      `,
      attachments: [
        {
          filename: `Fohow_Invoice_${order.order_number || order.id}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${customerEmail}`);
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
  }
};

/**
 * Sends the "Order Received - Pending Payment" email with manual Paybill instructions
 */
const sendOrderPendingEmail = async (customerEmail, order, cartItems) => {
  if (!customerEmail) {
    console.error('No customer email provided, skipping pending email.');
    return;
  }

  try {
    const mailOptions = {
      from: `"Fohow Eden Life" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Order Received - Pending Payment ${order.order_number || '#' + order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1c1a16; max-w: 600px; margin: 0 auto; border: 1px solid #ede8df; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #811816; padding: 20px; text-align: center;">
                <h1 style="color: #f7f4ef; margin: 0;">FOHOW EDEN LIFE</h1>
                <p style="color: #d2a356; margin: 5px 0 0 0; font-size: 12px; letter-spacing: 2px;">WHOLESALE PORTAL</p>
            </div>
            <div style="padding: 30px;">
                <h2 style="font-family: Georgia, serif;">Hello ${order.customer_name},</h2>
                <p>We have successfully received your order request. Your order is currently <strong>Pending Payment</strong>.</p>
                <div style="background-color: #faf9f6; padding: 20px; border-radius: 8px; border-left: 4px solid #d2a356; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Order Number:</strong> ${order.order_number || '#' + order.id}</p>
                  <p style="margin: 5px 0 0 0;"><strong>Total Amount:</strong> KES ${Number(order.total_amount).toLocaleString()}</p>
                </div>
                <div style="background-color: #fcf5f5; padding: 20px; border-radius: 8px; border: 1px solid #811816; margin: 20px 0;">
                  <h3 style="color: #811816; margin-top: 0;">How to Pay (Lipa na M-Pesa Paybill)</h3>
                  <p style="margin: 5px 0;"><strong>Paybill Number:</strong> 222111</p>
                  <p style="margin: 5px 0;"><strong>Account Number:</strong> 79814</p>
                  <p style="margin: 5px 0;"><strong>Account Name:</strong> FOHOW EDEN LIFE</p>
                  <p style="margin: 15px 0 0 0; font-size: 14px; color: #8a8070;">Once you complete the payment, our administrative team will verify it and send your final official invoice.</p>
                </div>
                <br>
                <p style="font-size: 12px; color: #8a8070;">If you have any questions, please contact our support team via our official WhatsApp line.</p>
            </div>
            <div style="background-color: #fcfbf9; padding: 15px; text-align: center; border-top: 1px solid #ede8df;">
              <p style="margin: 0; font-size: 11px; color: #a0998e;">Cargen House, Nairobi | © 2026 Fohow Eden Life</p>
            </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Pending Order email sent to ${customerEmail}`);
  } catch (error) {
    console.error('❌ Error sending pending order email:', error);
  }
};

/**
 * Sends an alert to the Admin (Stalin & Timothy) when a new consultation is requested
 */
const notifyAdminOfNewConsultation = async (details) => {
  try {
    const adminEmail = process.env.ADMIN_EMAILS || process.env.EMAIL_USER; // Send to company email or multiple admins
    const mailOptions = {
      from: `"Amani Herbalists System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `🚨 New Consultation Request: ${details.fname} ${details.lname}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1c1a16; max-w: 600px; margin: 0 auto; border: 1px solid #ede8df; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #811816; padding: 20px; text-align: center;">
                <h1 style="color: #f7f4ef; margin: 0;">NEW CONSULTATION</h1>
            </div>
            <div style="padding: 30px;">
                <p>A new B2B consultation request has been submitted through the portal.</p>
                <div style="background-color: #fcf5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #811816;">
                    <p style="margin: 0;"><strong>Name:</strong> ${details.fname} ${details.lname}</p>
                    <p style="margin: 5px 0;"><strong>Business/Clinic:</strong> ${details.business || 'Not Provided'}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${details.email}</p>
                    <p style="margin: 5px 0;"><strong>Phone:</strong> ${details.phone}</p>
                    <p style="margin: 5px 0;"><strong>Format:</strong> ${details.type === 'physical' ? 'Physical Visit' : 'Virtual Call'}</p>
                    <p style="margin: 10px 0 0 0;"><strong>Concern:</strong> ${details.concern}</p>
                </div>
                <p>Please log into the <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/consultations" style="color: #811816; font-weight: bold;">Admin Dashboard</a> to confirm a time.</p>
            </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Admin notification email sent for ${details.fname}`);
  } catch (error) {
    console.error('❌ Error sending admin consultation email:', error);
  }
};

/**
 * Sends the final confirmation email to the client with the confirmed time
 */
const sendClientConsultationConfirmation = async (clientEmail, details) => {
  try {
    const mailOptions = {
      from: `"Fohow Eden Life" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `Confirmed: Your TCM Consultation with Fohow Eden Life`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1c1a16; max-w: 600px; margin: 0 auto; border: 1px solid #ede8df; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #811816; padding: 20px; text-align: center;">
                <h1 style="color: #f7f4ef; margin: 0;">CONSULTATION CONFIRMED</h1>
            </div>
            <div style="padding: 30px;">
                <h2 style="font-family: Georgia, serif;">Hello ${details.fname},</h2>
                <p>Your wholesale strategy session with Fohow Eden Life has been officially scheduled. We look forward to discussing how our TCM solutions can grow your clinic.</p>
                
                <div style="background-color: #faf9f6; padding: 25px; border-radius: 8px; border: 1px solid #ede8df; margin: 25px 0;">
                    <p style="margin: 0; font-size: 14px; color: #8a8070; text-transform: uppercase; letter-spacing: 1.5px;">Scheduled For:</p>
                    <p style="margin: 10px 0 0 0; font-size: 20px; font-family: Georgia, serif; color: #811816;">
                        <strong>${details.confirmed_time}</strong>
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 13px; color: #1c1a16;">📍 Location: Cargen House, Nairobi (or Virtual as selected)</p>
                </div>
                
                <p>If you need to reschedule or have any immediate questions, please reply to this email or contact us via our official WhatsApp line.</p>
                <br>
                <p style="font-style: italic; color: #5a5648;">"Ancient wisdom for modern wellness."</p>
            </div>
            <div style="background-color: #fcfbf9; padding: 15px; text-align: center; border-top: 1px solid #ede8df;">
              <p style="margin: 0; font-size: 11px; color: #a0998e;">Cargen House, Nairobi | © 2026 Fohow Eden Life</p>
            </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Client consultation confirmation sent to ${clientEmail}`);
  } catch (error) {
    console.error('❌ Error sending client confirmation email:', error);
  }
};

/**
 * Sends the final confirmation email to the client for an event RSVP
 */
const sendClientRSVPConfirmation = async (clientEmail, details) => {
  try {
    const mailOptions = {
      from: `"Fohow Eden Life" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `Confirmed: Your RSVP for ${details.event_title}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1c1a16; max-w: 600px; margin: 0 auto; border: 1px solid #ede8df; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #811816; padding: 20px; text-align: center;">
                <h1 style="color: #f7f4ef; margin: 0;">EVENT RSVP CONFIRMED</h1>
            </div>
            <div style="padding: 30px;">
                <h2 style="font-family: Georgia, serif;">Hello ${details.attendee_name},</h2>
                <p>Your RSVP for <strong>${details.event_title}</strong> has been confirmed. We are excited to have you join us!</p>
                
                <div style="background-color: #faf9f6; padding: 25px; border-radius: 8px; border: 1px solid #ede8df; margin: 25px 0;">
                    <p style="margin: 0; font-size: 14px; color: #8a8070; text-transform: uppercase; letter-spacing: 1.5px;">Confirmation Details:</p>
                    <p style="margin: 10px 0 0 0; font-size: 16px; font-family: Georgia, serif; color: #811816;">
                        <strong>Guests:</strong> ${details.attendee_count}
                    </p>
                    <p style="margin: 10px 0 0 0; font-size: 16px; font-family: Georgia, serif; color: #811816;">
                        <strong>Additional Instructions:</strong> ${details.confirmed_time}
                    </p>
                </div>
                
                <p>If you need to cancel or change the number of guests, please reply to this email or contact our support team.</p>
                <br>
                <p style="font-style: italic; color: #5a5648;">"Ancient wisdom for modern wellness."</p>
            </div>
            <div style="background-color: #fcfbf9; padding: 15px; text-align: center; border-top: 1px solid #ede8df;">
              <p style="margin: 0; font-size: 11px; color: #a0998e;">Cargen House, Nairobi | © 2026 Fohow Eden Life</p>
            </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Client RSVP confirmation sent to ${clientEmail}`);
  } catch (error) {
    console.error('❌ Error sending RSVP confirmation email:', error);
  }
};

/**
 * Sends an alert to the Admin when a client RSVPs to a regional seminar
 */
const notifyAdminOfNewRSVP = async (details, eventTitle) => {
  try {
    const adminEmail = process.env.ADMIN_EMAILS || process.env.EMAIL_USER;
    const mailOptions = {
      from: `"Amani Herbalists System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `🚨 New RSVP for Event: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1c1a16; max-w: 600px; margin: 0 auto; border: 1px solid #ede8df; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #811816; padding: 20px; text-align: center;">
                <h1 style="color: #f7f4ef; margin: 0;">NEW EVENT RSVP</h1>
            </div>
            <div style="padding: 30px;">
                <p>A new RSVP has been submitted for <strong>${eventTitle}</strong>.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tbody>
                        <tr style="background-color: #fcf5f5;">
                            <td style="padding: 12px; border: 1px solid #ede8df; font-weight: bold; width: 30%;">Name:</td>
                            <td style="padding: 12px; border: 1px solid #ede8df;">${details.attendee_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ede8df; font-weight: bold;">Clinic/Business:</td>
                            <td style="padding: 12px; border: 1px solid #ede8df;">${details.clinic_name || 'Not Provided'}</td>
                        </tr>
                        <tr style="background-color: #fcf5f5;">
                            <td style="padding: 12px; border: 1px solid #ede8df; font-weight: bold;">Phone:</td>
                            <td style="padding: 12px; border: 1px solid #ede8df;">${details.phone_number}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ede8df; font-weight: bold;">Email:</td>
                            <td style="padding: 12px; border: 1px solid #ede8df;">${details.email_address}</td>
                        </tr>
                        <tr style="background-color: #fcf5f5;">
                            <td style="padding: 12px; border: 1px solid #ede8df; font-weight: bold;">Guests:</td>
                            <td style="padding: 12px; border: 1px solid #ede8df;">${details.attendee_count}</td>
                        </tr>
                    </tbody>
                </table>
                
                <p style="margin-top: 25px;">Please log into the <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/events" style="color: #811816; font-weight: bold;">Admin Dashboard</a> to manage RSVPs.</p>
            </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Admin notification email sent for RSVP: ${details.attendee_name}`);
  } catch (error) {
    console.error('❌ Error sending admin RSVP email:', error);
  }
};

module.exports = { 
  sendOrderConfirmationEmail,
  sendOrderPendingEmail,
  notifyAdminOfNewConsultation,
  sendClientConsultationConfirmation,
  sendClientRSVPConfirmation,
  notifyAdminOfNewRSVP
};

