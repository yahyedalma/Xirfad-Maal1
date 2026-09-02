'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Award, LogOut, UserRound, PlayCircle, ShieldCheck } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

type Profile = { full_name: string | null; display_name: string | null; email: string; role: string };
type Enrollment = { id: string; course_id: string; status: string; courses: { title: string; description: string | null } | null };

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<{ id: string; course_id: string; certificate_number: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { router.replace('/login'); return; }
      const { data: p } = await supabase.from('profiles').select('full_name,display_name,email,role').eq('id', auth.user.id).single();
      const { data: e } = await supabase.from('enrollments').select('id,course_id,status,courses(title,description)').eq('student_profile_id', auth.user.id).order('created_at', { ascending: false });
      const { data: c } = await supabase.from('certificates').select('id,course_id,certificate_number').eq('student_profile_id', auth.user.id).order('issued_at', { ascending: false });
      setProfile(p ?? { full_name: auth.user.user_metadata?.full_name ?? '', display_name: '', email: auth.user.email ?? '', role: 'STUDENT' });
      setEnrollments((e ?? []) as unknown as Enrollment[]); setCertificates(c ?? []); setLoading(false);
    })();
  }, [router]);

  async function logout() { const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!); await supabase.auth.signOut(); router.replace('/'); }

  if (loading) return <main className="section"><div className="container"><div className="hero-card">Loading dashboard...</div></div></main>;
  const name = profile?.full_name || profile?.display_name || 'Arday';
  const isStaff = profile?.role === 'ADMIN' || profile?.role === 'OWNER' || profile?.role === 'INSTRUCTOR';

  return <main className="section"><div className="container">
    <div className="dash-top"><div><span className="eyebrow">STUDENT DASHBOARD</span><h1 style={{margin:'14px 0 4px'}}>Salaan, {name} 👋</h1><p className="muted">Halkan ka sii wad waxbarashadaada.</p></div><div style={{display:'flex',gap:10,flexWrap:'wrap'}}>{isStaff && <a className="btn btn-ghost" href="/admin"><ShieldCheck size={16}/> Maamulka</a>}<button className="btn btn-ghost" onClick={logout}><LogOut size={16}/> Ka bax</button></div></div>
    <div className="dash-stats"><div className="feature"><BookOpen/><h3>{enrollments.length}</h3><p>Koorsooyin aan ku jiro</p></div><div className="feature"><PlayCircle/><h3>0%</h3><p>Horumarka guud</p></div><div className="feature"><Award/><h3>{certificates.length}</h3><p>Shahaadooyin</p></div><div className="feature"><UserRound/><h3>{profile?.role ?? 'STUDENT'}</h3><p>Nooca akoonka</p></div></div>
    <section className="section" style={{paddingBottom:0}}><div className="section-head"><div><h2>Koorsooyinkayga</h2><p className="muted">Koorsooyinka aad iska diiwaangelisay.</p></div><a className="btn btn-primary" href="/courses">Raadi koorsooyin</a></div>
      {enrollments.length ? <div className="course-grid">{enrollments.map(e => <article className="course" key={e.id}><div className="course-cover"><BookOpen size={18}/> XIRFAD MAAL ACADEMY</div><div className="course-body"><h3>{e.courses?.title ?? 'Koorso'}</h3><p>{e.courses?.description ?? 'Sii wad casharradaada.'}</p><div className="price"><span className="muted">{e.status}</span><a className="btn btn-primary" href={`/courses/${e.course_id}`}>Sii wad →</a></div></div></article>)}</div> : <div className="hero-card"><h3>Weli koorso ma aadan bilaabin.</h3><p className="muted">Dooro koorso si aad waxbarashada u bilowdo.</p><a className="btn btn-primary" href="/courses">Eeg koorsooyinka</a></div>}
    </section>
  </div></main>;
}
