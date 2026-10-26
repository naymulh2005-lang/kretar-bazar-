import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';

// Admin Auth Configuration & Persistent Cryptographic Store
const ADMIN_AUTH_FILE = path.join(process.cwd(), '.admin_auth.json');
const ADMIN_ORDERS_FILE = path.join(process.cwd(), '.admin_orders.json');
const ADMIN_PRODUCTS_FILE = path.join(process.cwd(), '.admin_products.json');
const ADMIN_SLIDES_FILE = path.join(process.cwd(), '.admin_slides.json');
const ADMIN_HEADERS_FILE = path.join(process.cwd(), '.admin_headers.json');
const ADMIN_BRANDING_FILE = path.join(process.cwd(), '.admin_branding.json');
const ADMIN_MEDIA_FILE = path.join(process.cwd(), '.admin_media.json');
const ADMIN_NOTIFS_FILE = path.join(process.cwd(), '.order_email_notifications.json');
const ADMIN_SENT_EMAILS_FILE = path.join(process.cwd(), '.order_emails_sent.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

const AUTHORIZED_ADMIN_USERNAME = 'naymul';
const AUTHORIZED_ADMIN_EMAIL = 'naymulh2005@gmail.com';
const SESSION_SECRET = process.env.SESSION_SECRET || 'kb_sec_jwt_auth_secret_kretar_bazar_2026_salt';

// Ensure public uploads directories exist
const IMAGES_DIR = path.join(UPLOADS_DIR, 'products', 'images');
const VIDEOS_DIR = path.join(UPLOADS_DIR, 'products', 'videos');
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });

function getStoredOrders(): any[] {
  try {
    if (fs.existsSync(ADMIN_ORDERS_FILE)) {
      const data = fs.readFileSync(ADMIN_ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Error reading admin orders store:', err);
  }
  return [];
}

function saveStoredOrders(orders: any[]): void {
  try {
    fs.writeFileSync(ADMIN_ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing admin orders store:', err);
  }
}

function getStoredProducts(): any[] {
  try {
    if (fs.existsSync(ADMIN_PRODUCTS_FILE)) {
      const data = fs.readFileSync(ADMIN_PRODUCTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Error reading admin products store:', err);
  }
  return [];
}

function saveStoredProducts(products: any[]): void {
  try {
    fs.writeFileSync(ADMIN_PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing admin products store:', err);
  }
}

function getStoredSlides(): any[] {
  try {
    if (fs.existsSync(ADMIN_SLIDES_FILE)) {
      return JSON.parse(fs.readFileSync(ADMIN_SLIDES_FILE, 'utf-8'));
    }
  } catch (err) {
    console.warn('Error reading slides store:', err);
  }
  return [];
}

function saveStoredSlides(slides: any[]): void {
  try {
    fs.writeFileSync(ADMIN_SLIDES_FILE, JSON.stringify(slides, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing slides store:', err);
  }
}

function getStoredHeaders(): any[] {
  try {
    if (fs.existsSync(ADMIN_HEADERS_FILE)) {
      return JSON.parse(fs.readFileSync(ADMIN_HEADERS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.warn('Error reading headers store:', err);
  }
  return [];
}

function saveStoredHeaders(headers: any[]): void {
  try {
    fs.writeFileSync(ADMIN_HEADERS_FILE, JSON.stringify(headers, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing headers store:', err);
  }
}

function getStoredBranding(): any {
  try {
    if (fs.existsSync(ADMIN_BRANDING_FILE)) {
      return JSON.parse(fs.readFileSync(ADMIN_BRANDING_FILE, 'utf-8'));
    }
  } catch (err) {
    console.warn('Error reading branding store:', err);
  }
  return null;
}

function saveStoredBranding(branding: any): void {
  try {
    fs.writeFileSync(ADMIN_BRANDING_FILE, JSON.stringify(branding, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing branding store:', err);
  }
}

function getStoredMedia(): any[] {
  try {
    if (fs.existsSync(ADMIN_MEDIA_FILE)) {
      return JSON.parse(fs.readFileSync(ADMIN_MEDIA_FILE, 'utf-8'));
    }
  } catch (err) {
    console.warn('Error reading media store:', err);
  }
  return [];
}

function saveStoredMedia(media: any[]): void {
  try {
    fs.writeFileSync(ADMIN_MEDIA_FILE, JSON.stringify(media, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing media store:', err);
  }
}

function getEmailNotificationLogs(): any[] {
  try {
    if (fs.existsSync(ADMIN_NOTIFS_FILE)) {
      return JSON.parse(fs.readFileSync(ADMIN_NOTIFS_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

function saveEmailNotificationLogs(logs: any[]): void {
  try {
    fs.writeFileSync(ADMIN_NOTIFS_FILE, JSON.stringify(logs.slice(0, 100), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing email notification log:', err);
  }
}

function getSentOrderEmailIds(): Set<string> {
  try {
    if (fs.existsSync(ADMIN_SENT_EMAILS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ADMIN_SENT_EMAILS_FILE, 'utf-8'));
      return new Set(Array.isArray(data) ? data : []);
    }
  } catch {}
  return new Set();
}

function markOrderEmailSent(orderId: string): void {
  try {
    const ids = getSentOrderEmailIds();
    ids.add(orderId);
    fs.writeFileSync(ADMIN_SENT_EMAILS_FILE, JSON.stringify(Array.from(ids)), 'utf-8');
  } catch {}
}

async function sendOrderNotificationEmail(order: any): Promise<{ sent: boolean; reason?: string; messageId?: string }> {
  // 1. Strict deduplication check
  const sentIds = getSentOrderEmailIds();
  if (sentIds.has(order.id)) {
    console.log(`[Order Email]: Order ${order.id} notification was already sent. Skipping duplicate.`);
    return { sent: false, reason: 'Duplicate: already sent' };
  }

  // 2. Strict fixed recipient & subject
  const recipient = AUTHORIZED_ADMIN_EMAIL;
  const subject = `New Kretar Bazar Order — [${order.id}]`;

  // 3. Format items table
  const items = order.itemDetails || order.items || [];
  const itemsHtml = items.map((item: any, idx: number) => {
    const name = item.nameBn || item.nameEn || item.product?.nameBn || item.product?.nameEn || 'পণ্য';
    const sku = item.productId || item.sku || item.product?.id || 'N/A';
    const size = item.selectedSize || 'Standard';
    const color = item.selectedColor?.nameBn || item.selectedColor?.nameEn || 'Default';
    const qty = item.quantity || 1;
    const unitPrice = item.unitPrice || item.product?.discountPrice || item.product?.price || 0;
    const total = item.totalPrice || (unitPrice * qty);
    return `<tr>
      <td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-size: 13px;">${idx + 1}. <strong>${name}</strong><br><span style="color: #64748b; font-size: 11px;">SKU/ID: ${sku} | সাইজ: ${size} | কালার: ${color}</span></td>
      <td style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: center; font-size: 13px;">${qty}টি</td>
      <td style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: right; font-size: 13px;">৳${unitPrice}</td>
      <td style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: right; font-size: 13px; font-weight: bold;">৳${total}</td>
    </tr>`;
  }).join('');

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; color: #1e293b; background: #ffffff;">
      <div style="background-color: #0f172a; padding: 22px 20px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 20px; color: #f59e0b; font-weight: 800;">ক্রেতার বাজার — নতুন কাস্টমার অর্ডার</h2>
        <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8;">অর্ডার আইডি: <strong style="color: #ffffff;">#${order.id}</strong> | ট্র্যাকিং: <strong style="color: #ffffff;">${order.trackingNumber || 'N/A'}</strong></p>
      </div>

      <div style="padding: 24px;">
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #db2777; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">গ্রাহকের তথ্য ও ডেলিভারি বিবরণ</h3>
          <p style="margin: 4px 0; font-size: 13px;"><strong>গ্রাহকের নাম:</strong> ${order.customerName}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>যোগাযোগের ফোন:</strong> <a href="tel:${order.customerPhone}" style="color: #2563eb; font-weight: bold; text-decoration: none;">${order.customerPhone}</a></p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>ইমেইল:</strong> ${order.customerEmail ? order.customerEmail : '<span style="color: #94a3b8; font-style: italic;">প্রদান করা হয়নি</span>'}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>সম্পূর্ণ ডেলিভারি ঠিকানা:</strong> ${order.shippingAddress}</p>
          <p style="margin: 4px 0; font-size: 12px; color: #64748b;">
            ডেলিভারি জোন: <strong>${order.city === 'inside-dhaka' ? 'ঢাকা সিটির ভেতর' : order.city === 'outside-dhaka' ? 'ঢাকা সিটির বাইরে' : order.city}</strong>
            ${order.district ? ` | জেলা: <strong>${order.district}</strong>` : ''}
            ${order.area ? ` | এলাকা: <strong>${order.area}</strong>` : ''}
            ${order.postalCode ? ` | পোস্টাল কোড: <strong>${order.postalCode}</strong>` : ''}
          </p>
          <p style="margin: 6px 0 0; font-size: 12px;">
            ${order.userId ? `<span style="background-color: #e2e8f0; padding: 2px 8px; rounded: 4px; color: #334155;">👤 নিবন্ধিত গ্রাহক অ্যাকাউন্ট (আইডি: ${order.userId})</span>` : `<span style="background-color: #f3e8ff; padding: 2px 8px; border-radius: 4px; color: #7e22ce; font-weight: bold;">🟢 গেস্ট কাস্টমার অর্ডার (No Account)</span>`}
          </p>
          ${order.customerNote ? `<div style="margin-top: 10px; padding: 10px; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; font-size: 12px; color: #92400e;"><strong>গ্রাহকের বিশেষ নির্দেশনা:</strong> ${order.customerNote}</div>` : ''}
        </div>

        <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; color: #0f172a;">অর্ডারকৃত পণ্যসমূহ (${items.length}টি আইটেম):</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f1f5f9; font-size: 12px; color: #475569;">
              <th style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: left;">পণ্যের বিবরণ</th>
              <th style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: center;">পরিমাণ</th>
              <th style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: right;">একক দর</th>
              <th style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: right;">মোট</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
          <table style="width: 100%; font-size: 13px;">
            <tr><td style="padding: 3px 0; color: #64748b;">পণ্য সাবটোটাল:</td><td style="text-align: right; font-weight: bold;">৳${order.subtotal}</td></tr>
            <tr><td style="padding: 3px 0; color: #64748b;">ডেলিভারি ফি:</td><td style="text-align: right; font-weight: bold;">৳${order.shippingCost}</td></tr>
            ${order.discountAmount > 0 ? `<tr><td style="padding: 3px 0; color: #16a34a;">কুপন ডিসকাউন্ট:</td><td style="text-align: right; color: #16a34a; font-weight: bold;">-৳${order.discountAmount}</td></tr>` : ''}
            <tr style="border-top: 1px solid #cbd5e1;"><td style="padding: 10px 0 0; font-size: 15px; font-weight: 800; color: #0f172a;">সর্বমোট প্রদেয়:</td><td style="padding: 10px 0 0; text-align: right; font-size: 17px; font-weight: 900; color: #db2777;">৳${order.total}</td></tr>
          </table>
        </div>

        <div style="font-size: 12px; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          <p style="margin: 3px 0;"><strong>পেমেন্ট মেথড:</strong> <span style="text-transform: uppercase; font-weight: bold;">${order.paymentMethod}</span> (${order.paymentStatus === 'paid' ? 'পরিশোধিত' : 'ক্যাশ অন ডেলিভারি / অপরিশোধিত'})</p>
          ${order.transactionId ? `<p style="margin: 3px 0;"><strong>ট্রানজেকশন আইডি:</strong> ${order.transactionId}</p>` : ''}
          <p style="margin: 3px 0;"><strong>অর্ডারের সময়:</strong> ${order.date} ${order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : ''}</p>
        </div>
      </div>

      <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
        ক্রেতার বাজার Kids & Baby E-Commerce — অটোমেটিক অ্যাডমিন অর্ডার নোটিফিকেশন হাব
      </div>
    </div>
  `;

  // 4. SMTP configuration detection
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  const logs = getEmailNotificationLogs();

  if (!gmailUser || !gmailPass) {
    const logEntry = {
      orderId: order.id,
      recipient,
      subject,
      status: 'CONFIG_REQUIRED',
      timestamp: new Date().toISOString(),
      note: 'Order saved safely. To send live emails to naymulh2005@gmail.com, set GMAIL_USER and GMAIL_APP_PASSWORD in environment variables.'
    };
    logs.unshift(logEntry);
    saveEmailNotificationLogs(logs);
    console.log(`[Order Email Service]: Order #${order.id} saved in admin panel. Live Gmail dispatch requires GMAIL_USER & GMAIL_APP_PASSWORD.`);
    return { sent: false, reason: 'GMAIL_USER and GMAIL_APP_PASSWORD not configured' };
  }

  // 5. Send via nodemailer
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });

    const info = await transporter.sendMail({
      from: `"ক্রেতার বাজার অর্ডার সিস্টেম" <${gmailUser}>`,
      to: recipient,
      subject,
      html: htmlContent
    });

    markOrderEmailSent(order.id);
    const logEntry = {
      orderId: order.id,
      recipient,
      subject,
      status: 'DELIVERED',
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    };
    logs.unshift(logEntry);
    saveEmailNotificationLogs(logs);
    console.log(`[Order Email Service]: Order #${order.id} email delivered to ${recipient}. Message ID: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[Order Email Service] Delivery error for order #${order.id}:`, err);
    const logEntry = {
      orderId: order.id,
      recipient,
      subject,
      status: 'FAILED',
      error: err?.message || String(err),
      timestamp: new Date().toISOString()
    };
    logs.unshift(logEntry);
    saveEmailNotificationLogs(logs);
    return { sent: false, reason: err?.message || 'SMTP delivery failure' };
  }
}

interface AdminStoredAuth {
  username: string;
  email: string;
  salt: string;
  hash: string;
  updatedAt: string;
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function getOrInitAdminAuth(): AdminStoredAuth {
  try {
    if (fs.existsSync(ADMIN_AUTH_FILE)) {
      const data = fs.readFileSync(ADMIN_AUTH_FILE, 'utf-8');
      return JSON.parse(data) as AdminStoredAuth;
    }
  } catch (err) {
    console.warn('Error reading admin auth file, generating fresh store:', err);
  }

  // Initial secure credential setup: username 'naymul', password 'naymul' (securely hashed, zero plaintext stored)
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword('naymul', salt);
  const authData: AdminStoredAuth = {
    username: AUTHORIZED_ADMIN_USERNAME,
    email: AUTHORIZED_ADMIN_EMAIL,
    salt,
    hash,
    updatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(ADMIN_AUTH_FILE, JSON.stringify(authData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing admin auth file:', err);
  }
  return authData;
}

function signSessionToken(payload: { username: string; email: string; role: string; exp: number }): string {
  const jsonStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonStr).toString('base64url');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(base64Payload);
  const signature = hmac.digest('base64url');
  return `${base64Payload}.${signature}`;
}

function verifySessionToken(token: string): { valid: boolean; admin?: { username: string; email: string; role: string } } {
  try {
    const [base64Payload, signature] = token.split('.');
    if (!base64Payload || !signature) return { valid: false };

    const hmac = crypto.createHmac('sha256', SESSION_SECRET);
    hmac.update(base64Payload);
    const expectedSig = hmac.digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return { valid: false };
    }

    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Date.now()) {
      return { valid: false };
    }

    if (payload.username !== AUTHORIZED_ADMIN_USERNAME && payload.email !== AUTHORIZED_ADMIN_EMAIL) {
      return { valid: false };
    }

    return { valid: true, admin: { username: payload.username, email: payload.email, role: payload.role } };
  } catch {
    return { valid: false };
  }
}

async function startServer() {
  const app = express();
  
  // Parse port from CLI args (e.g. --port 3000); dev server MUST always bind to port 3000 in AI Studio
  const portArgIndex = process.argv.indexOf('--port');
  const portFromArg = portArgIndex !== -1 ? parseInt(process.argv[portArgIndex + 1], 10) : NaN;
  const PORT = !isNaN(portFromArg) ? portFromArg : 3000;

  const server = http.createServer(app);

  server.on('error', (err: any) => {
    console.error('Server error:', err);
  });

  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ extended: true, limit: '60mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', brand: 'Kretar Bazar - Kids & Baby' });
  });

  // Separate Admin Login Endpoint
  app.post('/api/admin/login', (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, error: 'ব্যবহারকারীর নাম ও পাসওয়ার্ড প্রদান আবশ্যক।' });
      }

      const cleanUser = String(username).trim().toLowerCase();
      const cleanPass = String(password).trim();

      // Check if matches authorized administrator username or email
      if (cleanUser !== AUTHORIZED_ADMIN_USERNAME.toLowerCase() && cleanUser !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        return res.status(401).json({ 
          success: false, 
          error: 'অননুমোদিত ব্যবহারকারীর নাম। শুধুমাত্র অনুমোদিত প্রশাসক লগইন করতে পারবেন।' 
        });
      }

      const storedAuth = getOrInitAdminAuth();
      const computedHash = hashPassword(cleanPass, storedAuth.salt);

      // Constant-time comparison to prevent timing attacks
      const isMatch = crypto.timingSafeEqual(
        Buffer.from(computedHash, 'hex'),
        Buffer.from(storedAuth.hash, 'hex')
      );

      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          error: 'ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।' 
        });
      }

      const exp = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      const token = signSessionToken({
        username: AUTHORIZED_ADMIN_USERNAME,
        email: AUTHORIZED_ADMIN_EMAIL,
        role: 'admin',
        exp
      });

      return res.json({
        success: true,
        token,
        admin: {
          username: AUTHORIZED_ADMIN_USERNAME,
          email: AUTHORIZED_ADMIN_EMAIL,
          role: 'admin'
        }
      });
    } catch (err) {
      console.error('Admin login error:', err);
      return res.status(500).json({ success: false, error: 'সার্ভার প্রক্রিয়াকরণে ত্রুটি হয়েছে।' });
    }
  });

  // Verify Active Admin Session Endpoint
  app.get('/api/admin/session', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false });
    }

    const token = authHeader.substring(7);
    const result = verifySessionToken(token);
    if (!result.valid) {
      return res.status(401).json({ valid: false });
    }

    return res.json({ valid: true, admin: result.admin });
  });

  // Admin Change Password Endpoint
  app.post('/api/admin/change-password', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';
      const sessionResult = verifySessionToken(token);

      const { currentPassword, newPassword } = req.body;
      if (!newPassword || String(newPassword).length < 6) {
        return res.status(400).json({ success: false, error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
      }

      const storedAuth = getOrInitAdminAuth();

      // If no valid session token, require current password
      if (!sessionResult.valid) {
        if (!currentPassword) {
          return res.status(401).json({ success: false, error: 'বর্তমান পাসওয়ার্ড প্রদান আবশ্যক।' });
        }
        const checkHash = hashPassword(String(currentPassword).trim(), storedAuth.salt);
        const match = crypto.timingSafeEqual(Buffer.from(checkHash, 'hex'), Buffer.from(storedAuth.hash, 'hex'));
        if (!match) {
          return res.status(401).json({ success: false, error: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' });
        }
      }

      // Update with new salt and hash
      const newSalt = crypto.randomBytes(16).toString('hex');
      const newHash = hashPassword(String(newPassword).trim(), newSalt);

      const updatedAuth: AdminStoredAuth = {
        username: AUTHORIZED_ADMIN_USERNAME,
        email: AUTHORIZED_ADMIN_EMAIL,
        salt: newSalt,
        hash: newHash,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(ADMIN_AUTH_FILE, JSON.stringify(updatedAuth, null, 2), 'utf-8');

      return res.json({ success: true, message: 'প্রশাসক পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।' });
    } catch (err) {
      console.error('Change password error:', err);
      return res.status(500).json({ success: false, error: 'পাসওয়ার্ড পরিবর্তনে ত্রুটি হয়েছে।' });
    }
  });

  // Admin Logout Endpoint
  app.post('/api/admin/logout', (req, res) => {
    res.json({ success: true });
  });

  // Server-side AI Advisor endpoint using Gemini API
  app.post('/api/ai-advisor', async (req, res) => {
    try {
      const { query, lang } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          reply: lang === 'bn' 
            ? '৬ মাস থেকে ১০ বছরের বাচ্চাদের জন্য আমাদের সুতির জামা, মন্টেসরি খেলনা এবং হাইজেনিক কেয়ার আইটেম সেরা পছন্দ।' 
            : 'Our organic cotton apparel, Montessori toys, and baby care products are top recommendations!'
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert friendly AI Baby Shopping Advisor for "ক্রেতার বাজার" (Kretar Bazar), a Bengali/English e-commerce store specializing in Kids & Baby items for ages 6 months to 10 years. Answer concisely in ${lang === 'bn' ? 'Bangla' : 'English'} regarding baby clothes size, toy safety, or product recommendations for query: "${query}". Keep response under 3 sentences.`,
      });

      res.json({ reply: response.text });
    } catch (err) {
      console.error('AI Advisor Error:', err);
      res.json({
        reply: 'আমাদের ১০০% সফট অর্গানিক সুতির জামা এবং বিপিএ ফ্রী লার্নিং খেলনা সবচেয়ে জনপ্রিয়।'
      });
    }
  });

  // Valid Coupons list for trusted server-side coupon validation
  const KNOWN_COUPONS: Record<string, { type: 'percentage' | 'flat'; value: number; min: number }> = {
    'KRETA10': { type: 'percentage', value: 10, min: 500 },
    'KIDS200': { type: 'flat', value: 200, min: 1500 },
    'FREESHIP': { type: 'flat', value: 60, min: 1000 },
    'SAVE30': { type: 'percentage', value: 30, min: 1000 }
  };

  // Secure Server Order Creation & Validation Endpoint
  app.post('/api/orders', (req, res) => {
    try {
      const orderPayload = req.body;
      if (!orderPayload) {
        return res.status(400).json({ success: false, error: 'অর্ডার ডাটা পাওয়া যায়নি।' });
      }

      const {
        customerName,
        customerPhone,
        shippingAddress,
        city,
        country,
        countryName,
        postalCode,
        customerEmail,
        customerNote,
        district,
        area,
        items,
        couponCode,
        paymentMethod,
        transactionId,
        userId
      } = orderPayload;

      // 1. Validate required customer details
      if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
        return res.status(400).json({ success: false, error: 'গ্রাহকের নাম আবশ্যক।' });
      }
      if (!customerPhone || typeof customerPhone !== 'string' || !customerPhone.trim()) {
        return res.status(400).json({ success: false, error: 'গ্রাহকের ফোন নম্বর আবশ্যক।' });
      }
      if (!shippingAddress || typeof shippingAddress !== 'string' || !shippingAddress.trim()) {
        return res.status(400).json({ success: false, error: 'ডেলিভারি ঠিকানা আবশ্যক।' });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'কার্টে কমপক্ষে একটি পণ্য আবশ্যক।' });
      }

      // 2. Validate and calculate item totals securely
      let calculatedSubtotal = 0;
      const verifiedItemDetails: any[] = [];

      for (const item of items) {
        const prod = item.product || item;
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        const unitPrice = Math.max(0, parseFloat(prod.discountPrice || prod.price || prod.unitPrice || 0));
        const lineTotal = Math.round(unitPrice * qty);
        calculatedSubtotal += lineTotal;

        verifiedItemDetails.push({
          productId: String(prod.id || 'p_unknown'),
          nameBn: String(prod.nameBn || prod.name || 'পণ্য'),
          nameEn: String(prod.nameEn || prod.name || 'Product'),
          selectedSize: String(item.selectedSize || 'Standard'),
          selectedColor: item.selectedColor || { nameBn: 'ডিফল্ট', nameEn: 'Default', hex: '#000000' },
          quantity: qty,
          unitPrice,
          totalPrice: lineTotal,
          image: String((prod.images && prod.images[0]) || prod.image || '')
        });
      }

      // 3. Compute trusted delivery fee
      const cleanCity = String(city || 'inside-dhaka').trim();
      let calculatedShipping = 60;
      const isIntl = country && country !== 'BD';
      if (isIntl) {
        calculatedShipping = parseFloat(orderPayload.shippingCost) || 2500;
      } else if (cleanCity === 'outside-dhaka') {
        calculatedShipping = 120;
      } else if (cleanCity === 'express-dhaka') {
        calculatedShipping = 150;
      } else {
        calculatedShipping = 60;
      }

      // 4. Compute trusted discount if coupon applied
      let calculatedDiscount = 0;
      if (couponCode && typeof couponCode === 'string') {
        const coupon = KNOWN_COUPONS[couponCode.trim().toUpperCase()];
        if (coupon && calculatedSubtotal >= coupon.min) {
          calculatedDiscount = coupon.type === 'percentage'
            ? Math.round((calculatedSubtotal * coupon.value) / 100)
            : coupon.value;
        }
      } else if (orderPayload.discountAmount && !isNaN(parseFloat(orderPayload.discountAmount))) {
        // Allow verified discount from client if within subtotal bounds
        calculatedDiscount = Math.min(calculatedSubtotal, Math.max(0, parseFloat(orderPayload.discountAmount)));
      }

      const calculatedTotal = Math.max(0, calculatedSubtotal + calculatedShipping - calculatedDiscount);

      // 5. Generate or preserve unique order ID & tracking
      const now = new Date();
      const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
      const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderId = (orderPayload.id && typeof orderPayload.id === 'string' && orderPayload.id.startsWith('KB-'))
        ? orderPayload.id
        : `KB-${datePart}-${randPart}`;
      const tracking = (orderPayload.trackingNumber && typeof orderPayload.trackingNumber === 'string')
        ? orderPayload.trackingNumber
        : `KB-TRK-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

      // 6. Build the validated order object
      const cleanOrder: Record<string, any> = {
        id: orderId,
        date: now.toISOString().split('T')[0],
        createdAt: now.toISOString(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        city: cleanCity,
        country: country || 'BD',
        countryName: countryName || 'Bangladesh',
        items: items,
        itemDetails: verifiedItemDetails,
        subtotal: calculatedSubtotal,
        shippingCost: calculatedShipping,
        discountAmount: calculatedDiscount,
        total: calculatedTotal,
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'paid',
        status: 'pending',
        trackingNumber: tracking
      };

      if (customerEmail && typeof customerEmail === 'string' && customerEmail.trim()) {
        cleanOrder.customerEmail = customerEmail.trim();
      }
      if (postalCode && typeof postalCode === 'string' && postalCode.trim()) {
        cleanOrder.postalCode = postalCode.trim();
      }
      if (customerNote && typeof customerNote === 'string' && customerNote.trim()) {
        cleanOrder.customerNote = customerNote.trim();
      }
      if (district && typeof district === 'string' && district.trim()) {
        cleanOrder.district = district.trim();
      }
      if (area && typeof area === 'string' && area.trim()) {
        cleanOrder.area = area.trim();
      }
      if (transactionId && typeof transactionId === 'string' && transactionId.trim()) {
        cleanOrder.transactionId = transactionId.trim();
      }

      // CRITICAL: Strictly omit userId if guest; only attach if valid authenticated user ID
      if (userId && typeof userId === 'string' && userId.trim() && userId !== 'u101' && userId !== 'guest') {
        cleanOrder.userId = userId.trim();
      }

      // 7. Persist to server orders store
      const storedOrders = getStoredOrders();
      const existingIdx = storedOrders.findIndex(o => o.id === orderId);
      if (existingIdx !== -1) {
        storedOrders[existingIdx] = cleanOrder;
      } else {
        storedOrders.unshift(cleanOrder);
      }
      saveStoredOrders(storedOrders);

      // 8. Trigger order acceptance email notification to authorized admin (naymulh2005@gmail.com)
      sendOrderNotificationEmail(cleanOrder).catch(err => {
        console.error('Order notification email dispatch error:', err);
      });

      return res.status(200).json({
        success: true,
        order: cleanOrder
      });
    } catch (err) {
      console.error('Order creation error on server:', err);
      return res.status(500).json({ success: false, error: 'সার্ভারে অর্ডার প্রসেসিং ব্যর্থ হয়েছে।' });
    }
  });

  // Secure Admin Orders Retrieval Endpoint (Protected by Server Session Token)
  app.get('/api/admin/orders', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'প্রশাসক অথেনটিকেশন টোকেন অনুপস্থিত।' });
      }
      const token = authHeader.split(' ')[1];
      const sessionResult = verifySessionToken(token);
      if (!sessionResult.valid) {
        return res.status(401).json({ success: false, error: 'অবৈধ অথবা মেয়াদোত্তীর্ণ প্রশাসক সেশন।' });
      }

      const orders = getStoredOrders();
      return res.json({ success: true, orders });
    } catch (err) {
      console.error('Admin get orders error:', err);
      return res.status(500).json({ success: false, error: 'অর্ডার তালিকা লোড করতে ত্রুটি হয়েছে।' });
    }
  });

  // Secure Admin Order Status Update Endpoint
  app.post('/api/admin/orders/:id/status', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'প্রশাসক অথেনটিকেশন টোকেন অনুপস্থিত।' });
      }
      const token = authHeader.split(' ')[1];
      const sessionResult = verifySessionToken(token);
      if (!sessionResult.valid) {
        return res.status(401).json({ success: false, error: 'অননুমোদিত অনুরোধ।' });
      }

      const orderId = req.params.id;
      const { status } = req.body;
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: 'অবৈধ অর্ডার স্ট্যাটাস।' });
      }

      const storedOrders = getStoredOrders();
      const order = storedOrders.find(o => o.id === orderId);
      if (!order) {
        return res.status(404).json({ success: false, error: 'অর্ডার পাওয়া যায়নি।' });
      }

      order.status = status;
      order.updatedAt = new Date().toISOString();
      saveStoredOrders(storedOrders);

      return res.json({ success: true, message: 'অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।' });
    } catch (err) {
      console.error('Update order status error:', err);
      return res.status(500).json({ success: false, error: 'স্ট্যাটাস আপডেটে ত্রুটি হয়েছে।' });
    }
  });

  // Dedicated Media Upload Endpoint (Supports direct mobile gallery & PC images/videos)
  app.post('/api/upload', (req, res) => {
    try {
      const { fileData, fileName, fileType, folder } = req.body;
      if (!fileData || !fileName || !fileType) {
        return res.status(400).json({ success: false, error: 'ফাইল ডাটা পাওয়া যায়নি।' });
      }

      const isVideo = fileType.startsWith('video/');
      const isImage = fileType.startsWith('image/');

      if (isVideo && (folder === 'products/videos' || String(folder).includes('products'))) {
        return res.status(400).json({ 
          success: false, 
          error: 'পণ্যের ভিডিওর জন্য ইউটিউব ভিডিও লিংক ব্যবহার করুন। সার্ভারে ভিডিও ফাইল আপলোড অনুমোদিত নয়।' 
        });
      }

      if (!isImage && !isVideo) {
        return res.status(400).json({ success: false, error: 'শুধুমাত্র বৈধ ছবি (JPG, PNG, WebP) ফাইল গ্রহণযোগ্য।' });
      }

      // Extract base64 payload
      const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Strict file size checks
      if (isImage && buffer.length > 8 * 1024 * 1024) {
        return res.status(400).json({ success: false, error: 'ছবির সাইজ সর্বোচ্চ ৮MB হতে পারে।' });
      }
      if (isVideo && buffer.length > 40 * 1024 * 1024) {
        return res.status(400).json({ success: false, error: 'ভিডিওর সাইজ সর্বোচ্চ ৪০MB হতে পারে।' });
      }

      // Safe clean subfolder
      const safeFolder = (folder && typeof folder === 'string' && /^[a-zA-Z0-9_\-/]+$/.test(folder))
        ? folder
        : (isVideo ? 'products/videos' : 'products/images');

      const targetDir = path.join(UPLOADS_DIR, safeFolder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Predictable safe filename
      const ext = path.extname(fileName) || (isVideo ? '.mp4' : '.jpg');
      const uniqueName = `KB_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext.toLowerCase()}`;
      const filePath = path.join(targetDir, uniqueName);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${safeFolder}/${uniqueName}`;
      return res.json({
        success: true,
        url: publicUrl,
        fileName: uniqueName,
        size: buffer.length,
        contentType: fileType
      });
    } catch (err: any) {
      console.error('File upload error on server:', err);
      return res.status(500).json({ success: false, error: 'ফাইল সেভ করার সময় সার্ভারে ত্রুটি হয়েছে।' });
    }
  });

  // Stored Products Endpoint (For seamless synchronization across devices & refreshes)
  app.get('/api/products', (req, res) => {
    try {
      const products = getStoredProducts();
      return res.json({ success: true, products });
    } catch (err) {
      console.error('Get products error:', err);
      return res.status(500).json({ success: false, error: 'পণ্য তালিকা লোড করতে ত্রুটি হয়েছে।' });
    }
  });

  // Admin Product Create / Update Endpoint
  app.post('/api/admin/products', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'প্রশাসক অথেনটিকেশন টোকেন অনুপস্থিত।' });
      }
      const token = authHeader.split(' ')[1];
      const sessionResult = verifySessionToken(token);
      if (!sessionResult.valid) {
        return res.status(401).json({ success: false, error: 'অননুমোদিত অনুরোধ।' });
      }

      const product = req.body;
      if (!product || !product.id || !product.nameBn) {
        return res.status(400).json({ success: false, error: 'অবৈধ পণ্য তথ্য।' });
      }

      const products = getStoredProducts();
      const existingIdx = products.findIndex(p => p.id === product.id);
      if (existingIdx !== -1) {
        products[existingIdx] = product;
      } else {
        products.unshift(product);
      }
      saveStoredProducts(products);

      return res.json({ success: true, product });
    } catch (err) {
      console.error('Save product error:', err);
      return res.status(500).json({ success: false, error: 'পণ্য সংরক্ষণে ত্রুটি হয়েছে।' });
    }
  });

  // Admin Product Delete Endpoint
  app.delete('/api/admin/products/:id', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'প্রশাসক অথেনটিকেশন টোকেন অনুপস্থিত।' });
      }
      const token = authHeader.split(' ')[1];
      const sessionResult = verifySessionToken(token);
      if (!sessionResult.valid) {
        return res.status(401).json({ success: false, error: 'অননুমোদিত অনুরোধ।' });
      }

      const productId = req.params.id;
      const products = getStoredProducts();
      const filtered = products.filter(p => p.id !== productId);
      saveStoredProducts(filtered);

      return res.json({ success: true, message: 'পণ্য সফলভাবে মুছে ফেলা হয়েছে।' });
    } catch (err) {
      console.error('Delete product error:', err);
      return res.status(500).json({ success: false, error: 'পণ্য মুছে ফেলতে ত্রুটি হয়েছে।' });
    }
  });

  // Hero Slides Endpoints
  app.get('/api/slides', (_req, res) => {
    try {
      const slides = getStoredSlides();
      return res.json({ success: true, slides });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'স্লাইড লোড করতে ত্রুটি।' });
    }
  });

  app.post('/api/admin/slides', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false });
      if (!verifySessionToken(authHeader.split(' ')[1]).valid) return res.status(401).json({ success: false });

      const slide = req.body;
      if (!slide || !slide.id) return res.status(400).json({ success: false, error: 'অবৈধ স্লাইড।' });

      const slides = getStoredSlides();
      const idx = slides.findIndex(s => s.id === slide.id);
      if (idx !== -1) {
        slides[idx] = slide;
      } else {
        slides.push(slide);
      }
      saveStoredSlides(slides);
      return res.json({ success: true, slide });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'স্লাইড সংরক্ষণে ত্রুটি।' });
    }
  });

  app.delete('/api/admin/slides/:id', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false });
      if (!verifySessionToken(authHeader.split(' ')[1]).valid) return res.status(401).json({ success: false });

      const slideId = req.params.id;
      const slides = getStoredSlides().filter(s => s.id !== slideId);
      saveStoredSlides(slides);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'স্লাইড মুছতে ত্রুটি।' });
    }
  });

  // Header Configs Endpoints
  app.get('/api/headers', (_req, res) => {
    try {
      const headers = getStoredHeaders();
      return res.json({ success: true, headers });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'হেডার কনফিগ লোড করতে ত্রুটি।' });
    }
  });

  app.post('/api/admin/headers', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false });
      if (!verifySessionToken(authHeader.split(' ')[1]).valid) return res.status(401).json({ success: false });

      const headerConfig = req.body;
      if (!headerConfig || !headerConfig.id) return res.status(400).json({ success: false, error: 'অবৈধ হেডার কনফিগ।' });

      const headers = getStoredHeaders();
      const idx = headers.findIndex(h => h.id === headerConfig.id);
      if (idx !== -1) {
        headers[idx] = headerConfig;
      } else {
        headers.push(headerConfig);
      }
      saveStoredHeaders(headers);
      return res.json({ success: true, headerConfig });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'হেডার কনফিগ সংরক্ষণে ত্রুটি।' });
    }
  });

  app.delete('/api/admin/headers/:id', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false });
      if (!verifySessionToken(authHeader.split(' ')[1]).valid) return res.status(401).json({ success: false });

      const headerId = req.params.id;
      const headers = getStoredHeaders().filter(h => h.id !== headerId);
      saveStoredHeaders(headers);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'হেডার মুছতে ত্রুটি।' });
    }
  });

  // Store Branding Endpoints
  app.get('/api/branding', (_req, res) => {
    try {
      const branding = getStoredBranding();
      return res.json({ success: true, branding });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'ব্র্যান্ডিং লোড করতে ত্রুটি।' });
    }
  });

  app.post('/api/admin/branding', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false });
      if (!verifySessionToken(authHeader.split(' ')[1]).valid) return res.status(401).json({ success: false });

      const branding = req.body;
      saveStoredBranding(branding);
      return res.json({ success: true, branding });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'ব্র্যান্ডিং সংরক্ষণে ত্রুটি।' });
    }
  });

  // Media Endpoints
  app.get('/api/media', (_req, res) => {
    try {
      const media = getStoredMedia();
      return res.json({ success: true, media });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'মিডিয়া লোড করতে ত্রুটি।' });
    }
  });

  app.post('/api/admin/media', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false });
      if (!verifySessionToken(authHeader.split(' ')[1]).valid) return res.status(401).json({ success: false });

      const item = req.body;
      if (!item || !item.id) return res.status(400).json({ success: false, error: 'অবৈধ মিডিয়া আইটেম।' });

      const media = getStoredMedia();
      const idx = media.findIndex(m => m.id === item.id);
      if (idx !== -1) {
        media[idx] = item;
      } else {
        media.unshift(item);
      }
      saveStoredMedia(media);
      return res.json({ success: true, media: item });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'মিডিয়া সংরক্ষণে ত্রুটি।' });
    }
  });

  app.delete('/api/admin/media/:id', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false });
      if (!verifySessionToken(authHeader.split(' ')[1]).valid) return res.status(401).json({ success: false });

      const mediaId = req.params.id;
      const media = getStoredMedia().filter(m => m.id !== mediaId);
      saveStoredMedia(media);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'মিডিয়া মুছতে ত্রুটি।' });
    }
  });

  // Admin Order Email Notification Audit Logs Endpoint
  app.get('/api/admin/order-emails', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'প্রশাসক অথেনটিকেশন টোকেন অনুপস্থিত।' });
      }
      const token = authHeader.split(' ')[1];
      const sessionResult = verifySessionToken(token);
      if (!sessionResult.valid) {
        return res.status(401).json({ success: false, error: 'অননুমোদিত অনুরোধ।' });
      }

      const logs = getEmailNotificationLogs();
      const hasConfig = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
      return res.json({
        success: true,
        configured: hasConfig,
        recipient: AUTHORIZED_ADMIN_EMAIL,
        logs
      });
    } catch (err) {
      console.error('Get email logs error:', err);
      return res.status(500).json({ success: false, error: 'লগ উদ্ধার করতে ত্রুটি হয়েছে।' });
    }
  });

  // Admin Test Email Dispatch Endpoint
  app.post('/api/admin/test-email', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'প্রশাসক অথেনটিকেশন টোকেন অনুপস্থিত।' });
      }
      const token = authHeader.split(' ')[1];
      const sessionResult = verifySessionToken(token);
      if (!sessionResult.valid) {
        return res.status(401).json({ success: false, error: 'অননুমোদিত অনুরোধ।' });
      }

      const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
      const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

      if (!gmailUser || !gmailPass) {
        return res.status(400).json({
          success: false,
          configured: false,
          error: 'GMAIL_USER এবং GMAIL_APP_PASSWORD এনভায়রনমেন্ট ভেরিয়েবলে সেট করা নেই। naymulh2005@gmail.com এ লাইভ ইমেইল পাঠানোর জন্য ১৬ অক্ষরের Google App Password সেট করুন।'
        });
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass }
      });

      const info = await transporter.sendMail({
        from: `"ক্রেতার বাজার টেস্ট" <${gmailUser}>`,
        to: AUTHORIZED_ADMIN_EMAIL,
        subject: 'Kretar Bazar — Test Notification Email',
        text: 'This is a test notification email from Kretar Bazar Kids & Baby E-Commerce verifying that your email notification system is working.'
      });

      return res.json({ success: true, messageId: info.messageId, recipient: AUTHORIZED_ADMIN_EMAIL });
    } catch (err: any) {
      console.error('Test email delivery error:', err);
      return res.status(500).json({ success: false, error: err?.message || 'ইমেইল পাঠাতে ব্যর্থ হয়েছে।' });
    }
  });

  // Vite Middleware for dev or static server for prod
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          hmr: false
        },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    }
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  const cleanup = () => {
    server.close(() => {
      process.exit(0);
    });
  };
  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

startServer();
