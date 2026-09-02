import { createClient } from '@supabase/supabase-js';

export default async function CoursesPage(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 let courses:any[]=[];
 if(url&&key){const sb=createClient(url,key); const {data}=await sb.from('courses').select('id,title,description,discounted_price,original_price').order('created_at',{ascending:false}); courses=data||[];}
 return <main><header className="nav"><div className="container nav-inner"><a href="/" className="brand">Xirfad <span>Maal</span> Academy</a><a className="btn btn-ghost" href="/">← Home</a></div></header><section className="section"><div className="container"><span className="eyebrow">BARASHADA</span><h1 style={{fontSize:48,letterSpacing:'-2px',margin:'16px 0 8px'}}>Koorsooyinka</h1><p className="muted">Koorsooyinka hadda ku jira nidaamka Xirfad Maal Academy.</p>{courses.length===0?<div className="hero-card" style={{marginTop:28}}>Koorsooyin weli lama gelin. Admin-ka ayaa halkan ka maamuli doona koorsooyinka.</div>:<div className="course-grid" style={{marginTop:28}}>{courses.map(c=><article className="course" key={c.id}><div className="course-cover">XIRFAD MAAL ACADEMY</div><div className="course-body"><h3>{c.title}</h3><p>{c.description||'Koorso xirfadeed.'}</p><div className="price"><strong>{Number(c.discounted_price??0)===0?'FREE':`$${c.discounted_price}`}</strong><a className="btn btn-primary" href={`/courses/${c.id}`}>Faahfaahin</a></div></div></article>)}</div>}</div></section></main>;
}
