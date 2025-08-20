import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

function computeTimesForWeight(cut, weightKg) {
  if (!cut || !weightKg || Number.isNaN(weightKg)) return { braiseHours: null, pressureMinutes: null };
  const ratio = weightKg / 0.8;
  const braisePer = cut?.default_times?.braise_hours_per_0_8kg;
  const pressurePer = cut?.default_times?.pressure_minutes_per_0_8kg;
  const braiseHours = typeof braisePer === 'number' ? Math.round(braisePer * ratio * 10) / 10 : null;
  const pressureMinutes = typeof pressurePer === 'number' ? Math.round(pressurePer * ratio) : null;
  return { braiseHours, pressureMinutes };
}

export default function Home() {
  const [q, setQ] = useState('');
  const [method, setMethod] = useState('');
  const [cuts, setCuts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (method) params.set('method', method);
    fetch(`/api/cuts?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => { if (active) setCuts(data.cuts || []); })
      .catch(() => { if (active) setCuts([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [q, method]);

  const allMethods = useMemo(() => {
    const set = new Set();
    cuts.forEach((c) => (c.ideal_methods || []).forEach((m) => set.add(m)));
    return Array.from(set);
  }, [cuts]);

  return (
    <div className="container">
      <header className="header">
        <h1 className="brand">CutWise</h1>
        <nav><Link href="/recipes">Recipes</Link></nav>
      </header>

      <section className="panel">
        <div className="controls">
          <input className="input" placeholder="Search cuts (e.g. cheek, ribeye, tail)" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="">All methods</option>
            {allMethods.map((m) => (<option key={m} value={m}>{m}</option>))}
          </select>
        </div>
        <div className="grid">
          <ExploreMoreCard />
          {loading && <div className="card panel"><div className="muted">Loading…</div></div>}
          {!loading && cuts.map((cut) => (
            <CutCard key={cut.id} cut={cut} />
          ))}
        </div>
      </section>

      <div className="footer">Grass-fed, grass-finished guidance. Swap images later in /public/images.</div>
    </div>
  );
}

function CutCard({ cut }) {
  const [weight, setWeight] = useState('0.8');
  const weightNum = parseFloat(weight);
  const times = computeTimesForWeight(cut, weightNum);

  return (
    <div className="card panel">
      <img src={(cut.images && cut.images[0]) || '/images/placeholder.jpg'} alt={cut.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)', background: '#0c1218' }} />
      <h3><Link href={`/cuts/${cut.id}`}>{cut.name}</Link></h3>
      <div className="muted">{cut.primal} • {cut.fat_level} fat {cut.collagen_heavy ? '• collagen-rich' : ''}</div>
      <div className="methods">
        {(cut.ideal_methods || []).map((m) => (<span key={m} className="badge">{m}</span>))}
      </div>
      <div className="quick">
        {renderQuick(cut)}
      </div>
      <div className="helper">
        <input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" aria-label="Weight in kg" />
        <div className="muted">kg</div>
        <div className="muted">Braise: {times.braiseHours != null ? `${times.braiseHours} h @ ${cut?.default_temps?.braise_c || '—'} C` : '—'}</div>
        <div className="muted">Pressure: {times.pressureMinutes != null ? `${times.pressureMinutes} min` : '—'}</div>
      </div>
    </div>
  );
}

function renderQuick(cut) {
  if (cut.id === 'ribeye') {
    return `Sear ${cut?.default_times?.sear_minutes_per_side || 2.5} min/side • Target ${cut?.default_temps?.sear_target_c || '54–57'} C`;
  }
  if (cut.id === 'stirfry-strips') {
    return 'Stir-fry under 2–3 minutes total on very high heat';
  }
  const braise = cut?.default_times?.braise_hours_per_0_8kg;
  const pressure = cut?.default_times?.pressure_minutes_per_0_8kg;
  if (braise || pressure) {
    const parts = [];
    if (braise) parts.push(`Braise ${braise} h/0.8 kg @ ${cut?.default_temps?.braise_c || '—'} C`);
    if (pressure) parts.push(`Pressure ${pressure} min/0.8 kg`);
    return parts.join(' • ');
  }
  return 'See tips for guidance';
}

function ExploreMoreCard() {
  return (
    <div className="card panel" style={{ borderStyle: 'dashed' }}>
      <h3>Explore more</h3>
      <div className="row">
        <Link className="badge" href="/cuts/cheek">Cheek</Link>
        <Link className="badge" href="/cuts/oxtail">Oxtail</Link>
        <Link className="badge" href="/cuts/ossobuco">Osso buco</Link>
        <Link className="badge" href="/cuts/ribeye">Ribeye</Link>
        <Link className="badge" href="/recipes">Recipes</Link>
      </div>
      <div className="spacer" />
      <div className="muted">Try a collagen-rich braise or a quick sear.</div>
    </div>
  );
}
