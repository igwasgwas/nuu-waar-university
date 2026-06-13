import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('mahasiswa')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { nama, nim, program_studi, ipk } = req.body;

      if (!nama || !nim || !program_studi || ipk === undefined || ipk === null) {
        return res.status(400).json({ error: 'Semua field wajib diisi' });
      }

      const ipkNum = parseFloat(ipk);
      if (isNaN(ipkNum) || ipkNum < 0 || ipkNum > 4) {
        return res.status(400).json({ error: 'IPK harus antara 0.0 dan 4.0' });
      }

      const { data: existing } = await supabase
        .from('mahasiswa')
        .select('id')
        .eq('nim', nim)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ error: 'NIM sudah terdaftar' });
      }

      const { data, error } = await supabase
        .from('mahasiswa')
        .insert({ nama, nim, program_studi, ipk: ipkNum })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, nama, nim, program_studi, ipk } = req.body;

      if (!id || !nama || !nim || !program_studi || ipk === undefined || ipk === null) {
        return res.status(400).json({ error: 'Semua field wajib diisi' });
      }

      const ipkNum = parseFloat(ipk);
      if (isNaN(ipkNum) || ipkNum < 0 || ipkNum > 4) {
        return res.status(400).json({ error: 'IPK harus antara 0.0 dan 4.0' });
      }

      const { data: existing } = await supabase
        .from('mahasiswa')
        .select('id')
        .eq('nim', nim)
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ error: 'NIM sudah terdaftar' });
      }

      const { data, error } = await supabase
        .from('mahasiswa')
        .update({ nama, nim, program_studi, ipk: ipkNum })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID diperlukan' });
      }

      const { error } = await supabase
        .from('mahasiswa')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
