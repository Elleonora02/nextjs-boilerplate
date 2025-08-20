import Link from 'next/link';

export async function getServerSideProps(context) {
  const { req, params } = context;
  const { id } = params;
  const proto = (req.headers['x-forwarded-proto'] || 'http');
  const host = req.headers.host;
  const baseUrl = `${proto}://${host}`;

  const [cutsRes, recipesRes] = await Promise.all([
    fetch(`${baseUrl}/api/cuts`),
    fetch(`${baseUrl}/api/recipes?cut=${encodeURIComponent(id)}`)
  ]);
  const cutsData = await cutsRes.json();
  const recipesData = await recipesRes.json();
  const cut = (cutsData.cuts || []).find((c) => c.id === id) || null;
  return { props: { cut, recipes: recipesData.recipes || [] } };
}

export default function CutPage({ cut, recipes }) {
  if (!cut) {
    return (
      <div className="container">
        <header className="header"><h1 className="brand">CutWise</h1></header>
        <div className="panel card">Cut not found. <Link href="/">Go home</Link></div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="brand">{cut.name}</h1>
        <nav><Link href="/">Home</Link></nav>
      </header>

      <section className="panel card">
        <div className="muted">{cut.primal} • {cut.animal} • {cut.fat_level} fat {cut.collagen_heavy ? '• collagen-rich' : ''}</div>
        <div className="methods" style={{ marginTop: 8 }}>
          {(cut.ideal_methods || []).map((m) => (<span key={m} className="badge">{m}</span>))}
        </div>
        <div className="spacer" />
        <div className="gallery">
          {(cut.images || []).map((src) => (
            <img key={src} src={src} alt={cut.name} />
          ))}
        </div>
        <div className="spacer" />
        <h3>Chef tips</h3>
        <ul>
          {(cut.tips || []).map((t, i) => (<li key={i} className="muted">{t}</li>))}
        </ul>
      </section>

      <div className="spacer" />
      <section className="panel card">
        <h3>Recipes using {cut.name}</h3>
        <div className="recipeGrid">
          {recipes.map((r) => (
            <article key={r.id} className="panel recipeCard">
              <img src={r.image || (cut.images && cut.images[0]) || '/images/placeholder.jpg'} alt={r.title} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', background: '#0c1218' }} />
              <h4><Link href={`/recipes/${r.id}`}>{r.title}</Link></h4>
              <div className="muted">Total: {r.total_time_minutes} min • Serves {r.serves}</div>
            </article>
          ))}
          {recipes.length === 0 && <div className="muted">No recipes yet.</div>}
        </div>
      </section>

      <Link className="backLink" href="/recipes">Browse all recipes →</Link>
    </div>
  );
}
