import { BookOpen, CheckCircle2, GraduationCap, PlayCircle, Sparkles, Users } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const fallbackCourses = [
  { id: '1', title: 'Graphic Design', description: 'Baro naqshadeyn xirfadeed adigoo adeegsanaya qalab casri ah.', discounted_price: 0, original_price: 0 },
  { id: '2', title: 'Video Editing', description: 'Ka bilow aasaaska ilaa heer sare ee tafatirka muuqaalka.', discounted_price: 0, original_price: 0 },
  { id: '3', title: 'Artificial Intelligence', description: 'Faham AI, prompts iyo sida loogu isticmaalo shaqadaada.', discounted_price: 0, original_price: 0 },
];

async function getCourses() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return fallbackCourses;
  const supabase = createClient(url, key);
  const { data } = await supabase.from('courses').select('id,title,description,discounted_price,original_price').order('created_at', { ascending: false }).limit(6);
  return data?.length ? data : fallbackCourses;
}

export default async function Home() {
  const courses = await getCourses();
  return (
    <main>
      <header className="nav"><div className="container nav-inner">
        <a href="/" className="brand">Xirfad <span>Maal</span> Academy</a>
        <nav className="links"><a href="#courses">Koorsooyin</a><a href="#why">Maxaa noo gaar ah?</a><a href="#about">Nagu saabsan</a><a href="#contact">Xiriir</a></nav>
        <div className="actions"><a className="btn btn-ghost" href="/login">Gal</a><a className="btn btn-primary" href="/register">Isdiiwaangeli</a></div>
      </div></header>

      <section className="hero"><div className="container hero-grid">
        <div>
          <span className="eyebrow"><Sparkles size={14} style={{verticalAlign:'-2px'}}/> Xirfado casri ah</span>
          <h1>Baro xirfad.<br/><span>Dhis mustaqbal.</span></h1>
          <p>Ku baro xirfado suuqa shaqada looga baahan yahay adigoo helaya casharro online ah, tababar la taaban karo iyo shahaado markaad dhammayso.</p>
          <div className="hero-actions"><a className="btn btn-primary" href="#courses">Daawo koorsooyinka <PlayCircle size={17}/></a><a className="btn btn-ghost" href="#about">Wax badan ka ogow</a></div>
        </div>
        <div className="hero-card"><span className="eyebrow">Xirfad Maal LMS</span><h2>Wax walba hal meel.</h2><p className="muted">Baro, la soco horumarkaaga, dhammaystir casharrada, kadibna hel shahaadadaada.</p><div className="stat-grid"><div className="stat"><strong>100%</strong><small>Online learning</small></div><div className="stat"><strong>24/7</strong><small>Helitaan casharro</small></div><div className="stat"><strong>Practical</strong><small>Mashruucyo dhab ah</small></div><div className="stat"><strong>Free</strong><small>Shahaadooyin la heli karo</small></div></div></div>
      </div></section>

      <section id="courses" className="section"><div className="container"><div className="section-head"><div><h2>Koorsooyinka</h2><p className="muted">Dooro xirfadda aad rabto inaad maanta bilowdo.</p></div><a className="btn btn-ghost" href="/courses">Dhammaan koorsooyinka →</a></div>
        <div className="course-grid">{courses.map((course) => <article className="course" key={course.id}><div className="course-cover"><BookOpen size={18}/> XIRFAD MAAL ACADEMY</div><div className="course-body"><h3>{course.title}</h3><p>{course.description || 'Koorso tayo leh oo loogu talagalay qof kasta oo doonaya inuu xirfad cusub barto.'}</p><div className="price"><strong>{Number(course.discounted_price ?? 0) === 0 ? 'FREE' : `$${course.discounted_price}`}</strong><a className="btn btn-primary" href={`/courses/${course.id}`}>Eeg koorsada</a></div></div></article>)}</div>
      </div></section>

      <section id="why" className="section"><div className="container"><div className="section-head"><div><h2>Maxaa Xirfad Maal?</h2><p className="muted">Waxaan diiradda saarnaa xirfad aad si dhab ah u isticmaali karto.</p></div></div><div className="features"><div className="feature"><div className="icon"><GraduationCap/></div><h3>Tababar nidaamsan</h3><p>Casharro loo habeeyey si aad uga bilowdo aasaaska una gaarto heer xirfadeed.</p></div><div className="feature"><div className="icon"><CheckCircle2/></div><h3>Practical Projects</h3><p>Waxaad ku tababaranaysaa mashaariic dhab ah, ma aha aragti keliya.</p></div><div className="feature"><div className="icon"><Users/></div><h3>Bulsho waxbarasho</h3><p>La xiriir ardayda iyo macallimiinta, kana qayb qaado kooxaha tababarka.</p></div></div></div></section>

      <section id="about" className="section"><div className="container"><div className="cta"><div><h2>Diyaar ma u tahay xirfaddaada cusub?</h2><p className="muted">Bilow maanta. Mustaqbalkaaga ku dhis xirfad.</p></div><a className="btn btn-primary" href="/register">Bilow waxbarashada</a></div></div></section>

      <footer id="contact" className="footer"><div className="container">© {new Date().getFullYear()} Xirfad Maal Academy. Dhammaan xuquuqdu way dhowran tahay.</div></footer>
    </main>
  );
}
