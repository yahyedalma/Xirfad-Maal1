'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Home, LockKeyhole, Menu, PlayCircle, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import './learn.css';

type Lesson = { id: string; course_id: string; title: string; description: string | null; youtube_url: string | null; duration: string | null; is_locked: boolean | null; published: boolean | null; order_num: number | null };
type Course = { id: string; title: string; image_url: string | null };
type ProgressRow = { lesson_id: string; completed: boolean | null };

function youtubeEmbed(url: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${u.pathname.slice(1)}?rel=0&modestbranding=1`;
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v') || u.pathname.split('/').pop();
      return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
    }
  } catch {}
  return null;
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [enrollment, setEnrollment] = useState<{ id: string } | null>(null);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.replace('/login'); return; }
      const { data: l } = await supabase.from('lessons').select('id,course_id,title,description,youtube_url,duration,is_locked,published,order_num').eq('id', id).maybeSingle();
      if (!l) { setLoading(false); return; }
      setLesson(l);
      const [courseRes, lessonRes, enrollmentRes] = await Promise.all([
        supabase.from('courses').select('id,title,image_url').eq('id', l.course_id).maybeSingle(),
        supabase.from('lessons').select('id,course_id,title,description,youtube_url,duration,is_locked,published,order_num').eq('course_id', l.course_id).eq('published', true).order('order_num', { ascending: true }),
        supabase.from('enrollments').select('id').eq('course_id', l.course_id).eq('student_profile_id', auth.user.id).in('status', ['active','completed']).maybeSingle(),
      ]);
      setCourse(courseRes.data ?? null);
      const orderedLessons = (lessonRes.data ?? []) as Lesson[];
      setLessons(orderedLessons);
      setEnrollment(enrollmentRes.data ?? null);
      if (enrollmentRes.data) {
        const { data: p } = await supabase.from('lesson_progress').select('lesson_id,completed').eq('enrollment_id', enrollmentRes.data.id);
        const rows = (p ?? []) as ProgressRow[];
        setProgress(rows);
        setCompleted(rows.some((row) => row.lesson_id === l.id && row.completed));
      }
      setLoading(false);
    })();
  }, [id, router]);

  async function complete() {
    if (!lesson || !enrollment || completed) return;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from('lesson_progress').upsert({ enrollment_id: enrollment.id, lesson_id: lesson.id, student_profile_id: auth.user?.id, completed: true, completed_at: new Date().toISOString() }, { onConflict: 'enrollment_id,lesson_id' });
    if (error) setMessage(error.message);
    else { setCompleted(true); setProgress((items) => [...items.filter((item) => item.lesson_id !== lesson.id), { lesson_id: lesson.id, completed: true }]); setMessage('Casharkan waa la dhammaystiray ✓'); }
  }

  const currentIndex = useMemo(() => lessons.findIndex((item) => item.id === id), [lessons, id]);
  const previous = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const completedCount = lessons.filter((item) => progress.some((p) => p.lesson_id === item.id && p.completed)).length;
  const percent = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
  const embed = youtubeEmbed(lesson?.youtube_url ?? null);

  if (loading) return <main className="learn-page"><div className="learn-loading"><div className="learn-spinner"/><span>Casharka waa la soo shubayaa...</span></div></main>;
  if (!lesson) return <main className="section"><div className="container"><h1>Casharka lama helin</h1><a className="btn btn-primary" href="/courses">Koorsooyinka</a></div></main>;
  if (lesson.is_locked && !enrollment) return <main className="section"><div className="container"><div className="hero-card"><LockKeyhole/><h2>Casharkan waa xiran yahay</h2><p className="muted">Fadlan iska diiwaangeli koorsada si aad u daawato casharkan.</p><a className="btn btn-primary" href={`/courses/${lesson.course_id}`}>Ku noqo koorsada</a></div></div></main>;

  return <main className="learn-page">
    <header className="learn-topbar">
      <a href="/dashboard" className="learn-logo"><span>XM</span><b>Xirfad Maal</b><small>ACADEMY</small></a>
      <div className="learn-top-course"><span>Waxaad baranaysaa</span><b>{course?.title || 'Koorso'}</b></div>
      <div className="learn-top-actions"><a href="/dashboard" className="learn-top-link"><Home size={16}/> Dashboard</a><button className="learn-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Casharrada"><Menu size={19}/></button></div>
    </header>

    <div className="learn-layout">
      <aside className={`learn-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="learn-sidebar-head"><div><span>CURRICULUM</span><h2>{course?.title || 'Koorso'}</h2></div><button className="learn-close" onClick={() => setMenuOpen(false)}><X size={18}/></button></div>
        <div className="learn-overall"><div className="learn-overall-row"><span>Horumarka koorsada</span><b>{percent}%</b></div><div className="learn-track"><span style={{ width: `${percent}%` }}/></div><small>{completedCount} / {lessons.length} cashar</small></div>
        <nav className="learn-lessons">{lessons.map((item, index) => {
          const done = progress.some((p) => p.lesson_id === item.id && p.completed);
          const active = item.id === lesson.id;
          return <a key={item.id} className={`learn-lesson ${active ? 'active' : ''} ${done ? 'done' : ''}`} href={`/learn/${item.id}`} onClick={() => setMenuOpen(false)}><span className="learn-lesson-index">{done ? <CheckCircle2 size={15}/> : <span>{index + 1}</span>}</span><span className="learn-lesson-copy"><b>{item.title}</b><small>{item.duration || 'Cashar'}</small></span>{item.is_locked && !enrollment ? <LockKeyhole size={14}/> : <PlayCircle size={14}/>}</a>;
        })}</nav>
      </aside>

      {menuOpen && <button className="learn-overlay" aria-label="Xir menu" onClick={() => setMenuOpen(false)}/>} 

      <section className="learn-content">
        <div className="learn-breadcrumb"><a href={`/courses/${lesson.course_id}`}><ArrowLeft size={14}/> Koorsada</a><span>/</span><span>Cashar {currentIndex + 1}</span></div>
        <div className="learn-title-row"><div><span className="learn-eyebrow">CASHAR {currentIndex + 1} OF {lessons.length || 1}</span><h1>{lesson.title}</h1><p>{lesson.description || 'Casharkan si fiican u daawo, kadibna calaamadee inuu dhammaaday.'}</p></div><div className="learn-time"><Clock3 size={15}/>{lesson.duration || 'Online'}</div></div>

        <div className="learn-video-wrap">{embed ? <iframe src={embed} title={lesson.title} allowFullScreen/> : <div className="learn-video-empty"><PlayCircle size={42}/><b>Video casharkan weli lama gelin.</b><span>Macallinku marka uu video geliyo halkan ayuu kasoo muuqanayaa.</span></div>}</div>

        <div className="learn-complete-card"><div><div className="learn-complete-title">{completed ? <><CheckCircle2 size={19}/> Casharkan waa la dhammaystiray</> : 'Ma dhammaysay casharkan?'}</div><p>{completed ? 'Horumarkaaga si toos ah ayaa loo kaydiyey.' : 'Markaad casharka dhamayso, riix badhanka si progress-kaaga loo kaydiyo.'}</p></div><button className="btn btn-primary" disabled={completed || !enrollment} onClick={complete}>{completed ? '✓ Completed' : 'Calaamadee inuu dhammaaday'}</button></div>
        {message && <div className="learn-message">{message}</div>}

        <div className="learn-navigation"><div>{previous && <a href={`/learn/${previous.id}`} className="learn-nav-card"><ArrowLeft size={18}/><span><small>Casharkii hore</small><b>{previous.title}</b></span></a>}</div><div>{next && <a href={`/learn/${next.id}`} className="learn-nav-card next"><span><small>Casharka xiga</small><b>{next.title}</b></span><ArrowRight size={18}/></a>}</div></div>
      </section>
    </div>
  </main>;
}
