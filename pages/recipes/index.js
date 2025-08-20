import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RecipesIndex() {
  const [q, setQ] = useState('');
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    fetch(`/api/recipes?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => { if (active) setRecipes(data.recipes || []); });
    return () => { active = false; };
  }, [q]);

  return (
    <div className="container">
      <header className="header">
        <h1 className="brand">Recipes</h1>
        <nav><Link href="/">Home</Link></nav>
      </header>

      <section className="panel">
        <div className="controls">
          <input className="input" placeholder="Search recipes or ingredients" value={q} onChange={(e) => setQ(e.target.value)} />
          <div />
        </div>
        <div className="grid">
          {recipes.map((r) => (
            <article key={r.id} className="panel card">
              <img src={r.image || '/images/placeholder.jpg'} alt={r.title} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)', background: '#0c1218' }} />
              <h3><Link href={`/recipes/${r.id}`}>{r.title}</Link></h3>
              <div className="muted">{r.method} • {r.total_time_minutes} min • Serves {r.serves}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
