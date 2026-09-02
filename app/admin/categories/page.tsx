'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, BookOpen, Edit3, FolderPlus, Search, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import './categories.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Category = { id: string; name: string; slug: string; icon: string; created_at: string; courseCount?: number };

type CourseRef = { id: string; category_id: string | null };

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<CourseRef[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: 'BookOpen' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function guard() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/login'; return false; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['ADMIN', 'OWNER'].includes(profile.role)) { window.location.href = '/dashboard'; return false; }
    return true;
  }

  async function load() {
    setLoading(true); setError('');
    const { data: cats, error: catError } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
    const { data: courseRows, error: courseError } = await supabase.from('courses').select('id,category_id');
    if (catError || courseError) setError(catError?.message || courseError?.message || 'Failed to load categories.');
    const rows = (cats || []) as Category[];
    const refs = (courseRows || []) as CourseRef[];
    setCourses(refs);
    setCategories(rows.map(c => ({ ...c, courseCount: refs.filter(r => r.category_id === c.id).length })));
    setLoading(false);
  }

  useEffect(() => { guard().then(ok => ok && load()); }, []);

  const filtered = useMemo(() => categories.filter(c => `${c.name} ${c.slug} ${c.icon}`.toLowerCase().includes(search.toLowerCase())), [categories, search]);

  function openCreate() {
    setEditing(null); setForm({ name: '', slug: '', icon: 'BookOpen' }); setError('');
  }
  function openEdit(category: Category) {
    setEditing(category); setForm({ name: category.name, slug: category.slug, icon: category.icon || 'BookOpen' }); setError('');
  }
  function autoSlug(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim(); const slug = form.slug.trim() || autoSlug(name); const icon = form.icon.trim() || 'BookOpen';
    if (!name || !slug) { setError('Category name and slug are required.'); return; }
    setSaving(true); setError('');
    const result = editing
      ? await supabase.from('categories').update({ name, slug, icon }).eq('id', editing.id)
      : await supabase.from('categories').insert({ name, slug, icon });
    if (result.error) setError(result.error.message); else { setEditing(null); await load(); }
    setSaving(false);
  }

  async function remove(category: Category) {
    const count = category.courseCount || 0;
    const message = count ? `Category “${category.name}” has ${count} course(s). Remove it only after moving those courses to another category.` : `Delete category “${category.name}”?`;
    if (count || !window.confirm(message)) return;
    const { error: deleteError } = await supabase.from('categories').delete().eq('id', category.id);
    if (deleteError) setError(deleteError.message); else load();
  }

  return <main className="category-page">
    <header className="category-topbar">
      <Link href="/admin" className="back-link"><ArrowLeft size={18}/> Admin Dashboard</Link>
      <div><span className="eyebrow">CONTENT MANAGEMENT</span><h1>Categories</h1><p>Organize courses into clear learning paths.</p></div>
      <button className="primary-btn" onClick={openCreate}><FolderPlus size={18}/> New Category</button>
    </header>

    <section className="category-shell">
      <div className="category-toolbar"><div className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories..."/></div><span>{filtered.length} categories</span></div>
      {error && <div className="error-box">{error}</div>}
      {loading ? <div className="empty-state">Loading categories...</div> : filtered.length === 0 ? <div className="empty-state"><BookOpen size={34}/><strong>No categories found</strong><span>Create your first category to organize courses.</span></div> :
      <div className="category-grid">{filtered.map(category => <article className="category-card" key={category.id}>
        <div className="category-icon"><BookOpen size={22}/></div><div className="category-content"><h2>{category.name}</h2><code>/{category.slug}</code><p>{category.courseCount || 0} course{category.courseCount === 1 ? '' : 's'}</p></div>
        <div className="category-actions"><button aria-label="Edit" onClick={() => openEdit(category)}><Edit3 size={17}/></button><button aria-label="Delete" onClick={() => remove(category)}><Trash2 size={17}/></button></div>
      </article>)}</div>}
    </section>

    {(editing !== null || form.name !== '' || form.slug !== '') && <div className="modal-backdrop" onMouseDown={() => setEditing(null)}><div className="category-modal" onMouseDown={e => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setEditing(null)}><X size={20}/></button><span className="eyebrow">{editing ? 'EDIT CATEGORY' : 'NEW CATEGORY'}</span><h2>{editing ? 'Update category' : 'Create category'}</h2>
      <form onSubmit={save}><label>Name<input autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: f.slug || autoSlug(e.target.value) }))} placeholder="Graphic Design"/></label><label>Slug<input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="graphic-design"/></label><label>Icon name<input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="BookOpen"/></label><button className="primary-btn save-btn" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Category'}</button></form>
    </div></div>}
  </main>;
}
