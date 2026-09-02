'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const inputStyle = { width: '100%', padding: '14px 15px', borderRadius: 12, border: '1px solid rgba(255,255,255,.1)', background: '#091525', color: 'white', outline: 'none' };

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setMessage(''); setLoading(true);
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim(), display_name: name.trim() } } });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data.user && data.session) {
      await supabase.from('profiles').upsert({ id: data.user.id, email: data.user.email ?? email.trim(), full_name: name.trim(), display_name: name.trim(), role: 'STUDENT' });
      router.push('/dashboard'); router.refresh(); return;
    }
    setMessage('Akoonka waa la sameeyay. Fadlan ka hubi email-kaaga si aad u xaqiijiso, kadibna soo gal.'); setLoading(false);
  }

  return <main className="section"><div className="container" style={{maxWidth:520}}><a href="/">← Xirfad Maal Academy</a><div className="hero-card" style={{marginTop:28}}><span className="eyebrow">ARDAY CUSUB</span><h1 style={{fontSize:42,margin:'16px 0 8px'}}>Samee akoon</h1><p className="muted">Isdiiwaangeli si aad u hesho koorsooyinkaaga iyo horumarkaaga.</p><form onSubmit={submit} style={{display:'grid',gap:14,marginTop:24}}><input placeholder="Magaca oo dhamaystiran" required value={name} onChange={e=>setName(e.target.value)} style={inputStyle}/><input placeholder="Email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle}/><input placeholder="Password (ugu yaraan 6 xaraf)" type="password" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)} style={inputStyle}/>{error && <p style={{color:'#fda4af',margin:0}}>{error}</p>}{message && <p style={{color:'#7dd3fc',margin:0}}>{message}</p>}<button className="btn btn-primary" disabled={loading} type="submit">{loading ? 'Samaynaya...' : 'Samee akoon'}</button></form><p className="muted" style={{marginTop:20}}>Akoon hore ma leedahay? <a href="/login" style={{color:'#7dd3fc'}}>Soo gal</a></p></div></div></main>;
}
