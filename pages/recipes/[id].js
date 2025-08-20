import Link from 'next/link';

export async function getServerSideProps(context) {
  const { req, params } = context;
  const { id } = params;
  const proto = (req.headers['x-forwarded-proto'] || 'http');
  const host = req.headers.host;
  const baseUrl = `${proto}://${host}`;

  const [recipesRes, cutsRes] = await Promise.all([
    fetch(`${baseUrl}/api/recipes`),
    fetch(`${baseUrl}/api/cuts`)
  ]);
  const recipesData = await recipesRes.json();
  const cutsData = await cutsRes.json();
  const recipe = (recipesData.recipes || []).find((r) => r.id === id) || null;
  const cut = recipe ? (cutsData.cuts || []).find((c) => c.id === recipe.cut) || null : null;
  return { props: { recipe, cut } };
}

export default function RecipePage({ recipe, cut }) {
  if (!recipe) {
    return (
      <div className="container">
        <header className="header"><h1 className="brand">CutWise</h1></header>
        <div className="panel card">Recipe not found. <Link href="/recipes">Back to recipes</Link></div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="brand">{recipe.title}</h1>
        <nav><Link href="/recipes">All recipes</Link></nav>
      </header>

      <section className="panel card">
        <img className="hero" src={recipe.image || '/images/placeholder.jpg'} alt={recipe.title} />
        <div className="muted">{recipe.method} • Total {recipe.total_time_minutes} min • Serves {recipe.serves}</div>
        {cut && (
          <div className="row" style={{ marginTop: 8 }}>
            <span className="badge">Cut</span>
            <Link className="badge" href={`/cuts/${cut.id}`}>{cut.name}</Link>
          </div>
        )}
        <div className="spacer" />
        <h3>Ingredients</h3>
        <ul>
          {(recipe.ingredients || []).map((ing, i) => (<li key={i} className="muted">{ing}</li>))}
        </ul>
        <div className="spacer" />
        <h3>Steps</h3>
        <ol>
          {(recipe.steps || []).map((step, i) => (<li key={i} className="muted">{step}</li>))}
        </ol>
        {recipe.tips && recipe.tips.length > 0 && (
          <>
            <div className="spacer" />
            <h3>Tips</h3>
            <ul>
              {recipe.tips.map((t, i) => (<li key={i} className="muted">{t}</li>))}
            </ul>
          </>
        )}
      </section>

      {cut && <Link className="backLink" href={`/cuts/${cut.id}`}>Back to {cut.name} →</Link>}
    </div>
  );
}
