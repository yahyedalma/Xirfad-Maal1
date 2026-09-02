'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, BookOpen, CheckCircle2, GraduationCap, LayoutDashboard, LogOut, Menu, PlayCircle, Settings, ShieldCheck, UserRound } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import './dashboard.css';

type Profile = { full_name: string | null; display_name: string | null; email: string; role: string };
type Enrollment = { id: string; course_id: string; status: string; created_at: string; courses: { title: string; description: string | null; image_url: string | null } | null };
type Lesson = { id: string; course_id: string };
type Progress = { enrollment_id: string; lesson_id: string; completed: boolean | null; completed_at: string | null };
type CourseRow = Enrollment & { totalLessons: number; completedLessons: number; progress: number };

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [certificates, setCertificates] = useState<{ id: string; course_id: string; certificate_number: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.replace('/login'); return; }

      const [profileRes, enrollmentRes, certificateRes] = await Promise.all([
        supabase.from('profiles').select('full_name,display_name,email,role').eq('id', auth.user.id).single(),
        supabase.from('enrollments').select('id,course_id,status,created_at,courses(title,description,image_url)').eq('student_profile_id', auth.user.id).order('created_at', { ascending: false }),
        supabase.from('certificates').select('id,course_id,certificate_number').eq('student_profile_id', auth.user.id).order('issued_at', { ascending: false }),
      ]);

      const enrollmentRows = (enrollmentRes.data ?? []) as unknown as Enrollment[];
      const enrollmentIds = enrollmentRows.map((e) => e.id);
      const courseIds = enrollmentRows.map((e) => e.course_id);
      let lessons: Lesson[] = [];
      let progress: Progress[] = [];
      if (courseIds.length) {
        const [lessonRes, progressRes] = await Promise.all([
          supabase.from('lessons').select('id,course_id').in('course_id', courseIds).eq('published', true),
          enrollmentIds.length ? supabase.from('lesson_progress').select('enrollment_id,lesson_id,completed,completed_at').in('enrollment_id', enrollmentIds) : Promise.resolve({ data: [] as Progress[] }),
        ]);
        lessons = (lessonRes.data ?? []) as Lesson[];
        progress = (progressRes.data ?? []) as Progress[];
      }

      const courseRows = enrollmentRows.map((enrollment) => {
        const courseLessons = lessons.filter((lesson) => lesson.course_id === enrollment.course_id);
        const completedLessons = courseLessons.filter((lesson) => progress.some((p) => p.enrollment_id === enrollment.id && p.lesson_id === lesson.id && p.completed)).length;
        const progressValue = courseLessons.length ? Math.round((completedLessons / courseLessons.length) * 100) : 0;
        return { ...enrollment, totalLessons: courseLessons.length, completedLessons, progress: progressValue };
      });

      setProfile(profileRes.data ?? { full_name: auth.user.user_metadata?.full_name ?? '', display_name: '', email: auth.user.email ?? '', role: 'STUDENT' });
      setCourses(courseRows);
      setCertificates(certificateRes.data ?? []);
      setLoading(false);
    })();
  }, [router]);

  async function logout() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    await supabase.auth.signOut();
    router.replace('/');
  }

  const name = profile?.full_name || profile?.display_name || 'Arday';
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'XM';
  const isStaff = profile?.role === 'ADMIN' || profile?.role === 'OWNER' || profile?.role === 'INSTRUCTOR';
  const overallProgress = useMemo(() => courses.length ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length) : 0, [courses]);
  const completedCourses = courses.filter((course) => course.progress === 100).length;
  const recentActivity = courses.flatMap((course) => course.completedLessons > 0 ? [{ title: course.courses?.title ?? 'Koorso', detail: `${course.completedLessons} cashar ayaa la dhammaystiray`, progress: course.progress }] : []).slice(0, 4);

  if (loading) return <main className="student-page"><div className="container"><div className="hero-card" style={{ marginTop: 40 }}>Loading dashboard...</div></div></main>;

  return <main className="student-page">
    <div className="student-shell">
      <aside className="student-sidebar">
        <a href="/" className="student-brand"><span className="student-brand-mark">XM</span><span><b>Xirfad Maal</b><small>ACADEMY</small></span></a>
        <nav className="student-nav">
          <a className="active" href="/dashboard"><LayoutDashboard size={17}/><span>Dashboard</span></a>
          <a href="/courses"><BookOpen size={17}/><span>Koorsooyinka</span></a>
          <a href="#my-courses"><PlayCircle size={17}/><span>Koorsooyinkayga</span></a>
          <a href="#certificates"><Award size={17}/><span>Shahaadooyinka</span></a>
          <a href="#profile"><UserRound size={17}/><span>Profile</span></a>
          <a href="#settings"><Settings size={17}/><span>Settings</span></a>
        </nav>
        <div className="student-sidebar-bottom">
          {isStaff && <a href="/admin"><ShieldCheck size={17}/><span>Maamulka</span></a>}
          <button onClick={logout}><LogOut size={17}/><span>Ka bax</span></button>
        </div>
      </aside>

      <div className="student-main">
        <header className="student-header">
          <div className="student-header-title">Student Learning Center</div>
          <div className="student-header-actions">
            <a className="student-icon-btn mobile-student-menu" href="/courses" aria-label="Koorsooyinka"><Menu size={18}/></a>
            <a className="student-icon-btn" href="/courses" aria-label="Raadi koorso"><BookOpen size={17}/></a>
            <div className="student-profile"><div className="student-avatar">{initials}</div><div><b style={{fontSize:11}}>{name}</b><div style={{fontSize:9,color:'#8a94a5'}}>{profile?.role || 'STUDENT'}</div></div></div>
          </div>
        </header>

        <div className="student-content">
          <section className="student-welcome">
            <div><div className="student-eyebrow">STUDENT DASHBOARD</div><h1>Ku soo dhawoow, {name} 👋</h1><p>Sii wad halka aad ka joogtay oo dhis xirfaddaada maalin kasta.</p></div>
            <a className="btn btn-primary" href="/courses">+ Raadi koorso</a>
          </section>

          <section className="student-grid-stats">
            <div className="student-stat"><div className="student-stat-top"><div className="student-stat-icon"><BookOpen size={18}/></div><small>ACTIVE</small></div><strong>{courses.length}</strong><span>Koorsooyin aad ku jirto</span></div>
            <div className="student-stat"><div className="student-stat-top"><div className="student-stat-icon"><PlayCircle size={18}/></div><small>{overallProgress}%</small></div><strong>{overallProgress}%</strong><span>Horumarka guud</span></div>
            <div className="student-stat"><div className="student-stat-top"><div className="student-stat-icon"><CheckCircle2 size={18}/></div><small>DONE</small></div><strong>{completedCourses}</strong><span>Koorsooyin la dhammeeyay</span></div>
            <div className="student-stat"><div className="student-stat-top"><div className="student-stat-icon"><Award size={18}/></div><small>AWARDS</small></div><strong>{certificates.length}</strong><span>Shahaadooyin</span></div>
          </section>

          <section className="student-section" id="my-courses">
            <div className="student-section-head"><div><h2>Koorsooyinkayga</h2><p>Waxbarashadaada iyo halka aad marayso.</p></div><a className="section-link" href="/courses">Eeg dhammaan →</a></div>
            {courses.length ? <div className="student-course-list">{courses.map((course) => <article className="student-course" key={course.id}>
              <div className="student-course-cover" style={course.courses?.image_url ? { backgroundImage: `linear-gradient(rgba(5,18,48,.25),rgba(5,18,48,.55)),url(${course.courses.image_url})`, backgroundSize:'cover', backgroundPosition:'center' } : undefined}>{course.courses?.image_url ? '' : 'XIRFAD MAAL'}</div>
              <div><h3>{course.courses?.title ?? 'Koorso'}</h3><div className="student-course-meta">{course.completedLessons} / {course.totalLessons} cashar • {course.status}</div><div className="student-progress-row"><div className="student-progress"><span style={{width:`${course.progress}%`}}/></div><span className="student-progress-label">{course.progress}%</span></div></div>
              <div className="student-course-actions"><a className="student-mini-btn" href={`/courses/${course.course_id}`}>{course.progress ? 'Sii wad' : 'Bilow'}</a></div>
            </article>)}</div> : <div className="student-empty"><GraduationCap size={28} color="#1764e9"/><h3>Weli koorso ma aadan bilaabin.</h3><p>Dooro koorso aad rabto inaad barato, kadibna ka bilow dashboard-kan.</p><a className="btn btn-primary" href="/courses">Eeg koorsooyinka</a></div>}
          </section>

          <div className="student-lower">
            <section className="student-section"><div className="student-section-head"><div><h2>Waxqabadkaaga</h2><p>Horumarka casharrada aad dhammaysay.</p></div></div><div className="student-activity">{recentActivity.length ? recentActivity.map((item, index) => <div className="student-activity-item" key={`${item.title}-${index}`}><div className="activity-dot">{index === 0 ? <PlayCircle size={15}/> : <CheckCircle2 size={15}/>}</div><div><b>{item.title}</b><span>{item.detail} • {item.progress}% progress</span></div></div>) : <div className="student-empty"><p>Markaad cashar dhammayso, waxqabadkaaga halkan ayuu kasoo muuqanayaa.</p></div>}</div></section>
            <section className="student-section" id="certificates"><div className="student-section-head"><div><h2>Shahaadooyinka</h2><p>Guulaha aad kasbatay.</p></div></div><div className="certificate-card"><Award size={22}/><h3>{certificates.length ? 'Hambalyo! 🎉' : 'Shahaadadaada sugaysa'}</h3><p>{certificates.length ? 'Waxaad haysataa shahaadooyin diyaar ah.' : 'Dhammaystir koorso si aad u gaarto heerka shahaadada.'}</p><a className="btn btn-primary" href="#certificates" style={{background:'#fff',color:'#0b3a91'}}>{certificates.length ? 'Eeg shahaadooyinka' : 'Sii wad waxbarashada'}</a></div>{certificates.length > 0 && <div className="certificate-list">{certificates.slice(0,3).map((certificate) => <div className="certificate-item" key={certificate.id}><div><b>{certificate.certificate_number || 'Certificate'}</b><span style={{display:'block'}}>Certificate ID</span></div><Award size={16} color="#1764e9"/></div>)}</div>}</section>
          </div>
        </div>
      </div>
    </div>
  </main>;
}
