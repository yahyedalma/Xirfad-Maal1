import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Search, ShieldCheck, Sparkles, Star, Users, Video } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const fallbackCourses = [
  { id: '1', title: 'Graphic Design Complete Course', description: 'Baro Photoshop, Illustrator iyo InDesign.', discounted_price: 0, original_price: 0 },
  { id: '2', title: 'Video Editing with CapCut', description: 'Ka baro tafatirka muuqaalka ilaa heer xirfadeed.', discounted_price: 0, original_price: 0 },
  { id: '3', title: 'Artificial Intelligence A-Z', description: 'Faham AI, prompts iyo content creation.', discounted_price: 0, original_price: 0 },
  { id: '4', title: 'Web Development', description: 'Dhis websites casri ah oo responsive ah.', discounted_price: 0, original_price: 0 },
];

async function getCourses() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return fallbackCourses;
  const supabase = createClient(url, key);
  const { data } = await supabase.from('courses').select('id,title,description,discounted_price,original_price').order('created_at', { ascending: false }).limit(8);
  return data?.length ? data : fallbackCourses;
}

function Logo() { return <a href="/" className="brand"><span className="brand-mark">✦</span><span><b>Xirfad Maal</b><small>ACADEMY</small></span></a>; }

export default async function Home() {
  const courses = await getCourses();
  return <main className="site-shell">
    <header className="nav"><div className="container nav-inner"><Logo/><nav className="links"><a className="active" href="/">Home</a><a href="#courses">Courses</a><a href="#instructors">Instructors</a><a href="#about">About Us</a><a href="#contact">Contact</a></nav><div className="actions"><button className="icon-btn" aria-label="Search"><Search size={18}/></button><span className="lang-pill">◎ EN</span><a className="btn btn-primary" href="/login">Login</a></div></div></header>
    <section className="hero-ref"><div className="container hero-ref-grid"><div className="hero-copy"><span className="eyebrow"><Sparkles size={13}/> Ku Baro. Ku Kobco. Ku Guuleyso.</span><h1>Xirfad Maal<br/><span>Academy</span></h1><p>Baro xirfado casri ah oo aad mustaqbalkaaga ku dhisi karto. Waxbarasho online ah oo tayo leh, casharro la taaban karo iyo macallimiin khibrad leh.</p><div className="hero-actions"><a className="btn btn-primary btn-lg" href="/register">Bilow Hadda <ArrowRight size={18}/></a><a className="btn btn-outline btn-lg" href="#courses">Daawo Courses</a></div><div className="hero-stats"><div><strong>500+</strong><span>Arday</span></div><div><strong>50+</strong><span>Courses</span></div><div><strong>20+</strong><span>Instructors</span></div><div><strong>100%</strong><span>Satisfaction</span></div></div></div><div className="hero-art" aria-hidden="true"><div className="orb orb-one"/><div className="orb orb-two"/><div className="glow-person"><div className="person-head"/><div className="person-body"/><div className="laptop"/><div className="person-arm"/></div><div className="float-card float-play">▶</div><div className="float-card float-cap">⌂</div><div className="float-card float-chart">↗</div><div className="art-label"><b>Baro</b><span>Xirfado Cusub</span></div></div></div></section>
    <section className="search-strip"><div className="container search-panel"><div><b>Raadi Course ku Habboon</b><span>Dhammaan xirfadaha hal meel.</span></div><div className="search-fields"><label><Search size={17}/><input placeholder="Raadi course..."/></label><select defaultValue=""><option value="">Dhammaan Kategoriyada</option><option>Design</option><option>Technology</option><option>Marketing</option></select><a className="btn btn-primary" href="/courses">Raadi Course</a></div></div></section>
    <section id="courses" className="section light-section"><div className="container"><div className="section-head"><div><span className="section-kicker">LEARN & GROW</span><h2>Courses <span>Popular ah</span></h2></div><a className="section-link" href="/courses">Dhammaan Courses <ArrowRight size={16}/></a></div><div className="course-grid-ref">{courses.slice(0,4).map((course,index)=><article className="course-ref" key={course.id}><div className={'course-image ci-'+index}><span>{index===0?'Ps':index===1?'CE':index===2?'Ai':'WEB'}</span><em>{index<2?'Popular':'New'}</em></div><div className="course-body-ref"><div className="course-meta">Fudud · {30+index*5} Lessons</div><h3>{course.title}</h3><div className="rating"><Star size={14} fill="currentColor"/> 4.{9-index} <span>({60+index*28})</span></div><div className="course-foot"><strong>{Number(course.discounted_price??0)===0?'Free':`$${course.discounted_price}`}</strong><a href={`/courses/${course.id}`}>Eeg <ArrowRight size={14}/></a></div></div></article>)}</div></div></section>
    <section id="why" className="benefit-section"><div className="container benefit-grid"><div><span className="section-kicker">WHY XIRFAD MAAL</span><h2>Waxbarasho kuu dhisan,<br/><span>mustaqbal kuu dhisan.</span></h2><p className="muted">Waxaan isku keenaynaa casharro tayo leh, macallimiin khibrad leh iyo LMS kuu oggolaanaya inaad wax barato meel kasta.</p></div><div className="benefit-cards"><div><Video/><b>Online Classes</b><span>24/7 access to quality education</span></div><div><Users/><b>Expert Instructors</b><span>Learn from industry professionals</span></div><div><CheckCircle2/><b>Certificate</b><span>Get certified and boost your career</span></div><div><ShieldCheck/><b>Secure & Fast</b><span>Your data is safe with us</span></div></div></div></section>
    <section id="about" className="cta-ref"><div className="container cta-inner"><div><span className="eyebrow">READY TO START?</span><h2>Diyaar ma u tahay xirfaddaada cusub?</h2><p>Ku biir Xirfad Maal Academy maanta.</p></div><a className="btn btn-primary btn-lg" href="/register">Bilow Hadda <ArrowRight size={18}/></a></div></section>
    <footer id="contact" className="footer"><div className="container footer-inner"><Logo/><span>© {new Date().getFullYear()} Xirfad Maal Academy.</span><a href="mailto:register@xirfadmaal.com">register@xirfadmaal.com</a></div></footer>
  </main>;
}
