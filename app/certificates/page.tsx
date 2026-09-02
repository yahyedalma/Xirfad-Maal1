'use client';

import { useEffect, useState } from 'react';
import { Award, CheckCircle2, LockKeyhole, Download, ShieldCheck } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import './certificates.css';

type Cert={id:string;student_name:string;course_title:string;verification_id:string;issued_at:string;revoked:boolean};

export default function CertificatesPage(){
 const [certs,setCerts]=useState<Cert[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
 useEffect(()=>{(async()=>{const {data:{user}}=await sb.auth.getUser(); if(!user){location.href='/login';return;} const {data,error}=await sb.from('certificates').select('id,student_name,course_title,verification_id,issued_at,revoked').eq('student_profile_id',user.id).order('issued_at',{ascending:false}); if(error)setError(error.message); setCerts(data||[]);setLoading(false)})()},[]);
 return <main className="cert-page"><header className="cert-header"><Link href="/dashboard">← Dashboard</Link><div><span>ACHIEVEMENT CENTER</span><h1>Certificates</h1><p>Shahaadooyinkaaga waxaa si automatic ah loo soo saaraa marka koorsadu dhammaato.</p></div></header><section className="cert-grid">{loading?<div className="cert-empty">Loading...</div>:error?<div className="cert-empty">{error}</div>:certs.length===0?<article className="cert-preview locked"><div className="preview-art"><Award size={54}/><div className="watermark">XIRFAD MAAL ACADEMY</div><div className="preview-lock"><LockKeyhole size={22}/><b>Certificate Locked</b><span>Dhammaystir dhammaan casharrada si xogta shahaadadu u muuqato.</span></div></div><div className="cert-meta"><b>Shahaadadaada ayaa halkan ka muuqan doonta</b><span>Preview-ga waa diyaar, laakiin magaca ardayga iyo verification ID lama muujinayo ilaa koorsada la dhammeeyo.</span></div></article>:certs.map(c=><article className="cert-preview" key={c.id}><div className="certificate"><div className="cert-frame"><div className="cert-brand"><Award size={28}/><b>XIRFAD MAAL ACADEMY</b></div><small>CERTIFICATE OF COMPLETION</small><h2>Certificate of Achievement</h2><p>This certificate is proudly presented to</p><h3>{c.student_name}</h3><p>for successfully completing</p><strong>{c.course_title}</strong><div className="cert-bottom"><span>Issued {new Date(c.issued_at).toLocaleDateString()}</span><span>{c.verification_id}</span></div></div></div><div className="cert-actions"><div><CheckCircle2 size={18}/><b>Course Completed</b><span>Certificate automatically issued</span></div><button onClick={()=>window.print()}><Download size={17}/> Print / Save PDF</button></div></article>)}</section><footer className="cert-security"><ShieldCheck size={18}/> Certificate verification is protected by a unique verification ID.</footer></main>;
}
