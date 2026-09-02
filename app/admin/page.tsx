'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Award, Plus, LogOut, ShieldCheck } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

type Course = { id: string; title: string; description: string | null; original_price: number | null; discounted_price: number | null };

export default function AdminPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [counts, setCounts] = useState({ users: 0, enrollments: 0, certificates: 0 });
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [price, setPrice] = useState('0'); const [discount, setDiscount] = useState('0');
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');

  async function load() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { router.replace('/login'); return; }
    const { data: p } = await supabase.from('profiles').select('role').eq('id', auth.user.id).single();
    const ok = p?.role === 'ADMIN' || p?.role === 'OWNER'; setAuthorized(ok);
    if (!ok) return;
    const [{ data: c }, { count: users }, { count: enrollments }, { count: certificates }] = await Promise.all([
      supabase.from('courses').select('id,title,description,original_price,discounted_price').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('enrollments').select('id', { count: 'exact', head: true }),
      supabase.from('certificates').select('id', { count: 'exact', head: true }),
    ]);
    setCourses(c ?? []); setCounts({ users: users ?? 0, enrollments: enrollments ?? 0, certificates: certificates ?? 0 });
  }

  useEffect(() => { load(); }, []);

  async function addCourse(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    const { error } = await supabase.from('courses').insert({ title: title.trim(), description: description.trim(), original_price: Number(price) || 0, discounted_price: Number(discount) || 0 });
    if (error) setError(error.message); else { setTitle(''); setDescription(''); setPrice('0'); setDiscount('0'); await load(); }
    setSaving(false);
  }

  async function logout() { const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!); await supabase.auth.signOut(); router.replace('/'); }

  if (authorized === null) return <main className="section"><div className="container"><div className="hero-card">Hubinaya maamulka...</div></div></main>;
  if (!authorized) return <main className="section"><div className="container"><div className="hero-card"><h2>Maamulka waa xiran yahay</h2><p className="muted">Akoonkan ma laha ADMIN ama OWNER role.</p><a className="btn btn-primary" href="/dashboard">Ku noqo dashboard</a></div></div></main>;

  return <main className="section"><div className="container">
    <div className="dash-top"><div><span className="eyebrow"><ShieldCheck size={14}/> ADMIN PANEL</span><h1 style={{margin:'14px 0 4px'}}>Xirfad Maal maamulka</h1><p className="muted">Maamul koorsooyinka iyo xogta LMS-ka.</p></div><button className="btn btn-ghost" onClick={logout}><LogOut size={16}/> Ka bax</button></div>
    <div className="dash-stats"><div className="feature"><Users/><h3>{counts.users}</h3><p>Users</p></div><div className="feature"><BookOpen/><h3>{courses.length}</h3><p>Koorsooyin</p></div><div className="feature"><Users/><h3>{counts.enrollments}</h3><p>Enrollments</p></div><div className="feature"><Award/><h3>{counts.certificates}</h3><p>Certificates</p></div></div>
    <section className="section" style={{paddingBottom:0}}><div className="hero-card"><h2 style={{marginTop:0}}>Ku dar koorso</h2><form onSubmit={addCourse} style={{display:'grid',gap:12}}><input placeholder="Magaca koorsada" required value={title} onChange={e=>setTitle(e.target.value)} style={field}/><textarea placeholder="Sharaxaad" rows={4} value={description} onChange={e=>setDescription(e.target.value)} style={field}/><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><input type="number" min="0" placeholder="Qiimaha" value={price} onChange={e=>setPrice(e.target.value)} style={field}/><input type="number" min="0" placeholder="Qiimaha dhimista" value={discount} onChange={e=>setDiscount(e.target.value)} style={field}/></div>{error && <p style={{color:'#fda4af'}}>{error}</p>}<button className="btn btn-primary" disabled={saving} type="submit"><Plus size={16}/>{saving?'Kaydinaya...':'Ku dar koorso'}</button></form></div></section>
    <section className="section" style={{paddingBottom:0}}><div className="section-head"><div><h2>Koorsooyinka</h2><p className="muted">Koorsooyinka hadda ku jira database-ka.</p></div></div><div className="course-grid">{courses.map(c=><article className="course" key={c.id}><div className="course-cover"><BookOpen size={18}/> XIRFAD MAAL ACADEMY</div><div className="course-body"><h3>{c.title}</h3><p>{c.description || 'Sharaxaad lama gelin.'}</p><div className="price"><strong>{Number(c.discounted_price ?? 0) === 0 ? 'FREE' : `$${c.discounted_price}`}</strong><a className="btn btn-ghost" href={`/courses/${c.id}`}>Fur</a></div></div></article>)}</div></section>
  </div></main>;
}

const field={width:'100%',padding:'13px 14px',borderRadius:12,border:'1px solid rgba(255,255,255,.1)',background:'#091525',color:'white',outline:'none'};
