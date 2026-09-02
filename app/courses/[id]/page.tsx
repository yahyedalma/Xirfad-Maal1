'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock3, FileText, LockKeyhole, PlayCircle, UserPlus, Users, Award, BookOpen } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import './course-detail.css';

type Course = {
  id: string; title: string; description: string | null; original_price: number | null;
  discounted_price: number | null; image_url?: string | null; syllabus?: string | null;
  category?: { name: string } | null; instructor?: { name: string; specialty?: string | null; avatar_url?: string | null } | null;
};
type Lesson = { id: string; title: string; order_num: number | null; is_locked: boolean | null; duration: string | null; description: string | null; is_free_preview?: boolean | null; published?: boolean | null };

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    const [{ data: c }, { data: auth }] = await Promise.all([
      supabase.from('courses').select('id,title,description,original_price,discounted_price,image_url,syllabus,category:categories(name),instructor:instructors(name,specialty,avatar_url)').eq('id', id).maybeSingle(),
      supabase.auth.getUser(),
    ]);
    setCourse(c as Course | null);
    setUserId(auth.user?.id ?? null);
    if (auth.user) {
      const { data: e } = await supabase.from('enrollments').select('id,status').eq('course_id', id).eq('student_profile_id', auth.user.id).in('status', ['active', 'completed', 'pending_verification']).maybeSingle();
      setEnrolled(Boolean(e));
    }
    const { data: l } = await supabase.from('lessons').select('id,title,order_num,is_locked,duration,description,is_free_preview,published').eq('course_id', id).eq('published', true).order('order_num');
    setLessons(l ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function enrollFree() {
    if (!userId) { router.push(`/login?next=/courses/${id}`); return; }
    setBusy(true); setMessage('');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    const { error } = await supabase.rpc('enroll_free_course', { p_course_id: id });
    if (error) setMessage(error.message);
    else { setEnrolled(true); setMessage('Waad ku biirtay koorsadan. Casharrada kuu furan ayaa diyaar ah.'); await load(); }
    setBusy(false);
  }

  const price = Number(course?.discounted_price ?? course?.original_price ?? 0);
  const original = Number(course?.original_price ?? 0);
  const previewCount = lessons.filter(l => l.is_free_preview).length;
  const totalMinutes = useMemo(() => lessons.reduce((sum, l) => {
    const match = (l.duration || '').match(/^(\d+):([0-5]\d)$/); return sum + (match ? Number(match[1]) * 60 + Number(match[2]) : 0);
  }, 0), [lessons]);
  const syllabusItems = (course?.syllabus || '').split('\n').map(s => s.trim()).filter(Boolean);

  if (loading) return <main className="course-detail-page"><div className="container"><div className="course-loading">Koorsada waa la soo gelinayaa...</div></div></main>;
  if (!course) return <main className="course-detail-page"><div className="container"><div className="course-not-found"><h1>Koorsada lama helin</h1><a className="btn btn-primary" href="/courses">Ku noqo koorsooyinka</a></div></div></main>;

  return <main className="course-detail-page">
    <header className="nav"><div className="container nav-inner">
      <a href="/" className="brand"><span className="brand-mark">✦</span><span><b>Xirfad Maal</b><small>ACADEMY</small></span></a>
      <a className="btn btn-outline" href="/courses"><ArrowLeft size={16}/> Koorsooyinka</a>
    </div></header>

    <section className="course-hero-detail"><div className="container course-hero-grid">
      <div className="course-hero-copy">
        <span className="eyebrow"><BookOpen size={14}/> {course.category?.name || 'Koorso'}</span>
        <h1>{course.title}</h1>
        <p>{course.description || 'Baro xirfaddan si nidaamsan, casharro la fahmi karo iyo tababar wax-ku-ool ah.'}</p>
        <div className="course-instructor-row">
          <div className="instructor-avatar">{course.instructor?.avatar_url ? <img src={course.instructor.avatar_url} alt=""/> : (course.instructor?.name?.charAt(0) || 'X')}</div>
          <div><span>Macallinka koorsada</span><strong>{course.instructor?.name || 'Xirfad Maal Academy'}</strong>{course.instructor?.specialty && <small>{course.instructor.specialty}</small>}</div>
        </div>
      </div>
      <div className="course-cover-card">
        {course.image_url ? <img src={course.image_url} alt={course.title}/> : <div className="course-cover-fallback"><BookOpen size={64}/><span>{course.title.slice(0, 2).toUpperCase()}</span></div>}
        <div className="cover-price"><div><small>Qiimaha koorsada</small><strong>{price === 0 ? 'FREE' : `$${price}`}</strong>{original > price && price > 0 && <del>${original}</del>}</div>
          {enrolled ? <a className="btn btn-primary btn-lg" href={lessons[0] ? `/learn/${lessons[0].id}` : '/dashboard'}><PlayCircle size={17}/> Sii wad barashada</a> : <button className="btn btn-primary btn-lg" onClick={enrollFree} disabled={busy || price !== 0}><UserPlus size={17}/>{price === 0 ? (busy ? 'Ku biiraya...' : 'Ku biir bilaash') : 'Payment ayaa loo baahan yahay'}</button>}
        </div>
        {message && <div className="course-message">{message}</div>}
        <div className="course-guarantees"><span><CheckCircle2 size={15}/> Online learning</span><span><Award size={15}/> Certificate</span><span><Users size={15}/> Student dashboard</span></div>
      </div>
    </div></section>

    <section className="section course-content-detail"><div className="container detail-grid">
      <div>
        <div className="detail-panel"><div className="panel-heading"><div><span className="section-kicker">CURRICULUM</span><h2>Waxa aad baran doonto</h2></div><span className="lesson-count"><FileText size={15}/> {lessons.length} cashar</span></div>
          <div className="course-stats"><div><BookOpen size={19}/><strong>{lessons.length}</strong><span>Casharro</span></div><div><Clock3 size={19}/><strong>{totalMinutes ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : '—'}</strong><span>Muddada</span></div><div><Award size={19}/><strong>100%</strong><span>Certificate</span></div></div>
          <div className="lesson-list">{lessons.length === 0 ? <p className="muted">Casharrada weli lama gelin.</p> : lessons.map((l, i) => {
            const locked = Boolean(l.is_locked) && !enrolled && !l.is_free_preview;
            return <div className="lesson-row" key={l.id}><div className="lesson-number">{i + 1}</div><div className="lesson-info"><strong>{l.title}</strong><span>{l.duration || 'Cashar'} {l.is_free_preview && '• Preview'}</span>{l.description && <small>{l.description}</small>}</div><div className="lesson-action">{locked ? <LockKeyhole size={18}/> : <a href={`/learn/${l.id}`} aria-label={`Fur ${l.title}`}><PlayCircle size={20}/></a>}</div></div>;
          })}</div>
        </div>
        {syllabusItems.length > 0 && <div className="detail-panel syllabus-panel"><span className="section-kicker">SYLLABUS</span><h2>Qorshaha koorsada</h2><ul>{syllabusItems.map((item, i) => <li key={i}><CheckCircle2 size={17}/><span>{item}</span></li>)}</ul></div>}
      </div>
      <aside className="detail-sidebar"><div className="sidebar-card"><span className="section-kicker">KOORSADAN</span><h3>Waxaad heli doontaa</h3><ul><li><CheckCircle2 size={17}/> Casharro online ah</li><li><CheckCircle2 size={17}/> Casharro si nidaamsan loo diyaariyey</li><li><CheckCircle2 size={17}/> La socodka progress-ka</li><li><CheckCircle2 size={17}/> Shahaado marka la dhammaystiro</li><li><CheckCircle2 size={17}/> Mobile, tablet & desktop</li></ul>{previewCount > 0 && <div className="preview-note"><PlayCircle size={16}/><span>{previewCount} cashar ayaa preview ahaan u furan.</span></div>}</div></aside>
    </div></section>
  </main>;
}
