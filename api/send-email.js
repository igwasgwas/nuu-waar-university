export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, nama, nim, program_studi, ipk } = req.body;

    if (!to || !nama || !nim || !program_studi || ipk === undefined) {
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // Simulation mode
      console.log('Simulating email send to:', to);
      return res.status(200).json({
        success: true,
        message: 'Email berhasil disimulasikan! (Pasang RESEND_API_KEY di Vercel untuk mengirim email asli)',
        simulated: true
      });
    }

    // Call Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'Nuu Waar University <onboarding@resend.dev>',
        to: to,
        subject: subject || `Laporan Data Mahasiswa - ${nama}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1e3a8a; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">Laporan Data Mahasiswa</h2>
            <p style="color: #334155;">Berikut adalah rincian data mahasiswa dari Nuu Waar University:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; color: #334155;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; font-weight: bold; width: 150px;">Nama Lengkap</td>
                <td style="padding: 10px;">: ${nama}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; font-weight: bold;">NIM</td>
                <td style="padding: 10px; font-family: monospace;">: ${nim}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; font-weight: bold;">Program Studi</td>
                <td style="padding: 10px;">: ${program_studi}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; font-weight: bold;">IPK</td>
                <td style="padding: 10px; font-weight: bold; color: ${parseFloat(ipk) >= 3.0 ? '#10b981' : '#f59e0b'};">: ${parseFloat(ipk).toFixed(2)}</td>
              </tr>
            </table>
            <div style="margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center;">
              Sistem Informasi Akademik — Nuu Waar University
            </div>
          </div>
        `
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Gagal mengirim email via Resend');

    return res.status(200).json({ success: true, message: 'Email asli berhasil terkirim!', data });
  } catch (err) {
    console.error('Send email error:', err);
    return res.status(500).json({ error: err.message });
  }
}
