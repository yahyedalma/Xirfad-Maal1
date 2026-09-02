'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, LockKeyhole, PlayCircle, UserPlus } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

type Course = { id: string; title: string; description: string | null; original_price: number | null; discounted_price: number | null };
type Lesson = { id: string; title: string; order_num: number | null; is_locked: boolean | null; duration: string | null; description: string | null; is_free_preview?: boolean | null };

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    const [{ data: c }, { data: auth }] = await Promise.all([
      supabase.from('courses').select('id,title,description,original_price,discounted_price').eq('id', id).maybeSingle(),
      supabase.auth.getUser(),
    ]);
    setCourse(c);
    setUserId(auth.user?.id ?? null);
    if (auth.user) {
      const { data: e } = await supabase.from('enrollments').select('id').eq('course_id', id).eq('student_profile_id', auth.user.id).in('status', ['active','completed','pending_verification']).maybeSingle();
      setEnrolled(Boolean(e));
    }
    const { data: l } = await supabase.from('lessons').select('id,title,order_num,is_locked,duration,description,is_free_preview').eq('course_id', id).order('order_num');
    setLessons(l ?? []); setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function enrollFree() {
    if (!userId) { router.push(`/login?next=/courses/${id}`); return; }
    setBusy(true); setMessage('');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    const { error } = await supabase.rpc('enroll_free_course', { p_course_id: id });
    if (error) setMessage(error.message); else { setEnrolled(true); setMessage('Waad ku biirtay koorsadan. Casharradaada hadda way kuu furmeen.'); await load(); }
    setBusy(false);
  }

  if (loading) return <main className="section"><div className="container"><div className="hero-card">Loading...</div></div></main>;
  if (!course) return <main className="section"><div className="container"><h1>Koorsada lama helin</h1><a className="btn btn-primary" href="/courses">Ku noqo koorsooyinka</a></div></main>;
  const price = Number(course.discounted_price ?? course.original_price ?? 0);

  return <main><header className="nav"><div className="container nav-inner"><a href="/" className="brand">Xirfad <span>Maal</span> Academy</a><a className="btn btn-ghost" href="/courses">← Koorsooyinka</a></div></header><section className="section"><div className="container"><span className="eyebrow">KOORSO</span><h1 style={{fontSize:48,letterSpacing:'-2px',margin:'16px 0 10px'}}>{course.title}</h1><p className="muted" style={{maxWidth:760,lineHeight:1.7}}>{course.description}</p><div className="hero-card" style={{marginTop:26,display:'flex',justifyContent:'space-between',alignItems:'center',gap:20,flexWrap:'wrap'}}><div><span className="muted">Qiimaha</span><h2 style={{margin:'5px 0'}}>{price === 0 ? 'FREE' : `$${price}`}</h2></div>{enrolled ? <span className="eyebrow"><CheckCircle2 size={14}/> Waad ku jirtaa koorsada</span> : <button className="btn btn-primary" onClick={enrollFree} disabled={busy || price !== 0}><UserPlus size={16}/>{price === 0 ? (busy ? 'Ku biiraya...' : 'Ku biir bilaash') : 'Payment ayaa loo baahan yahay'}</button>}</div>{message && <p style={{color:'#7dd3fc',marginTop:15}}>{message}</p>}<div className="hero-card" style={{marginTop:30}}><h2>Casharrada koorsada</h2>{lessons.length===0?<p className="muted">Casharrada weli lama gelin.</p>:lessons.map((l,i)=>{const locked=Boolean(l.is_locked)&&!enrolled&&!l.is_free_preview;return <div key={l.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,padding:'16px 0',borderBottom:'1px solid rgba(255,255,255,.07)'}}><div><strong>{i+1}. {l.title}</strong><div className="muted" style={{fontSize:13,marginTop:5}}>{l.duration||'Cashar'}{locked?' • 🔒 Xiran':l.is_free_preview?' • Preview':' • Furan'}</div></div>{locked?<LockKeyhole size={18} color="#94a3b8"/>:<PlayCircle size={18} color="#7dd3fc"/>}</div>})}</div></div></section></main>;
}
