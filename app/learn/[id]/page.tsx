'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, ArrowLeft, LockKeyhole } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

type Lesson = { id: string; course_id: string; title: string; description: string | null; youtube_url: string | null; duration: string | null; is_locked: boolean | null };

function youtubeEmbed(url: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes('youtube.com')) return `https://www.youtube.com/embed/${u.searchParams.get('v') || u.pathname.split('/').pop()}`;
  } catch {}
  return null;
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [enrollment, setEnrollment] = useState<{ id: string } | null>(null);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.replace('/login'); return; }
      const { data: l } = await supabase.from('lessons').select('id,course_id,title,description,youtube_url,duration,is_locked').eq('id', id).maybeSingle();
      if (!l) { setLoading(false); return; }
      setLesson(l);
      const { data: e } = await supabase.from('enrollments').select('id').eq('course_id', l.course_id).eq('student_profile_id', auth.user.id).in('status', ['active','completed']).maybeSingle();
      if (!e && l.is_locked) { setLoading(false); return; }
      setEnrollment(e ?? null);
      if (e) { const { data: p } = await supabase.from('lesson_progress').select('completed').eq('enrollment_id', e.id).eq('lesson_id', l.id).maybeSingle(); setCompleted(Boolean(p?.completed)); }
      setLoading(false);
    })();
  }, [id, router]);

  async function complete() {
    if (!lesson || !enrollment) return;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    const { error } = await supabase.from('lesson_progress').upsert({ enrollment_id: enrollment.id, lesson_id: lesson.id, student_profile_id: (await supabase.auth.getUser()).data.user?.id, completed: true, completed_at: new Date().toISOString() }, { onConflict: 'enrollment_id,lesson_id' });
    if (error) setMessage(error.message); else { setCompleted(true); setMessage('Casharkan waa la dhammaystiray.'); }
  }

  if (loading) return <main className="section"><div className="container"><div className="hero-card">Loading casharka...</div></div></main>;
  if (!lesson) return <main className="section"><div className="container"><h1>Casharka lama helin</h1><a className="btn btn-primary" href="/courses">Koorsooyinka</a></div></main>;
  if (lesson.is_locked && !enrollment) return <main className="section"><div className="container"><div className="hero-card"><LockKeyhole/><h2>Casharkan waa xiran yahay</h2><p className="muted">Fadlan iska diiwaangeli koorsada si aad u daawato casharkan.</p><a className="btn btn-primary" href={`/courses/${lesson.course_id}`}>Ku noqo koorsada</a></div></div></main>;
  const embed = youtubeEmbed(lesson.youtube_url);

  return <main><header className="nav"><div className="container nav-inner"><a href="/dashboard" className="brand">Xirfad <span>Maal</span> Academy</a><a className="btn btn-ghost" href={`/courses/${lesson.course_id}`}><ArrowLeft size={16}/> Koorsada</a></div></header><section className="section"><div className="container"><span className="eyebrow">CASHAR • {lesson.duration || 'Online'}</span><h1 style={{fontSize:44,margin:'16px 0 10px'}}>{lesson.title}</h1><p className="muted" style={{maxWidth:800,lineHeight:1.7}}>{lesson.description}</p>{embed ? <div style={{marginTop:26,aspectRatio:'16/9',borderRadius:22,overflow:'hidden',background:'#000',border:'1px solid rgba(255,255,255,.1)'}}><iframe src={embed} title={lesson.title} style={{width:'100%',height:'100%',border:0}} allowFullScreen /></div> : <div className="hero-card" style={{marginTop:26}}><p className="muted">Video casharkan weli lama gelin.</p></div>}<div className="hero-card" style={{marginTop:20,display:'flex',justifyContent:'space-between',alignItems:'center',gap:15,flexWrap:'wrap'}}><div>{completed ? <span className="eyebrow"><CheckCircle2 size={14}/> Waa la dhammaystiray</span> : <span className="muted">Markaad dhammayso casharka, riix badhanka.</span>}</div><button className="btn btn-primary" disabled={completed || !enrollment} onClick={complete}>{completed ? 'Completed ✓' : 'Calaamadee inuu dhammaaday'}</button></div>{message && <p style={{color:'#7dd3fc'}}>{message}</p>}</div></section></main>;
}
