'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const inputStyle = { width: '100%', padding: '14px 15px', borderRadius: 12, border: '1px solid rgba(255,255,255,.1)', background: '#091525', color: 'white', outline: 'none' };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Email ama password-ka waa khalad.' : error.message);
      setLoading(false);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return <main className="section"><div className="container" style={{maxWidth:520}}><a href="/">← Xirfad Maal Academy</a><div className="hero-card" style={{marginTop:28}}><span className="eyebrow">ARDAY</span><h1 style={{fontSize:42,margin:'16px 0 8px'}}>Soo gal</h1><p className="muted">Geli email-kaaga iyo password-kaaga si aad u sii waddo waxbarashada.</p><form onSubmit={submit} style={{display:'grid',gap:14,marginTop:24}}><input aria-label="Email" placeholder="Email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle}/><input aria-label="Password" placeholder="Password" type="password" required value={password} onChange={e=>setPassword(e.target.value)} style={inputStyle}/>{error && <p style={{color:'#fda4af',margin:0}}>{error}</p>}<button className="btn btn-primary" disabled={loading} type="submit">{loading ? 'Soo galaya...' : 'Soo gal'}</button></form><p className="muted" style={{marginTop:20}}>Akoon ma lihid? <a href="/register" style={{color:'#7dd3fc'}}>Isdiiwaangeli</a></p></div></div></main>;
}
