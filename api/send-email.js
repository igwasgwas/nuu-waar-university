export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, nama, nim, emailPengirim, pesan } = req.body;

    if (!to || !nama || !nim || !emailPengirim || !pesan) {
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // Simulation mode
      console.log('Simulating complaint email send to:', to);
      return res.status(200).json({
        success: true,
        message: 'Pengaduan disimulasikan! (Pasang RESEND_API_KEY di Vercel untuk mengirim email asli)',
        simulated: true
      });
    }

    // Call Resend API to send the actual complaint
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'Layanan Pengaduan Nuu Waar <onboarding@resend.dev>',
        to: to,
        subject: subject || `[PENGADUAN MAHASISWA] ${nama} - NIM ${nim}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f3f4f6; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background-color: #1e3a8a; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Formulir Pengaduan & Keluhan Mahasiswa</h2>
            </div>
            
            <div style="padding: 20px; color: #1f2937; line-height: 1.6;">
              <p style="font-size: 16px; font-weight: bold; color: #1e3a8a; border-bottom: 2px solid #f59e0b; padding-bottom: 5px;">Rincian Pengirim:</p>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; width: 150px;">Nama Lengkap</td>
                  <td style="padding: 6px 0;">: ${nama}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">NIM</td>
                  <td style="padding: 6px 0; font-family: monospace;">: ${nim}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Email Hubungi</td>
                  <td style="padding: 6px 0;"><a href="mailto:${emailPengirim}" style="color: #3b82f6; text-decoration: none;">${emailPengirim}</a></td>
                </tr>
              </table>

              <p style="font-size: 16px; font-weight: bold; color: #1e3a8a; border-bottom: 2px solid #f59e0b; padding-bottom: 5px;">Isi Keluhan / Komplain:</p>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap; font-style: italic; color: #374151;">
                ${pesan}
              </div>
            </div>

            <div style="margin-top: 30px; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 15px; text-align: center;">
              Email pengaduan ini dikirim secara otomatis oleh Layanan Pengaduan Nuu Waar University.
            </div>
          </div>
        `
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Gagal mengirim email pengaduan via Resend');

    return res.status(200).json({ success: true, message: 'Keluhan asli berhasil terkirim ke email tujuan!', data });
  } catch (err) {
    console.error('Send complaint email error:', err);
    return res.status(500).json({ error: err.message });
  }
}
