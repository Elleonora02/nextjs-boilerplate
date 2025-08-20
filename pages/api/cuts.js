import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { q = '', method = '' } = req.query;
  const dataPath = path.join(process.cwd(), 'data', 'cuts.json');
  const file = fs.readFileSync(dataPath, 'utf-8');
  const cuts = JSON.parse(file);
  const query = String(q).toLowerCase();
  const m = String(method).toLowerCase();

  const filtered = cuts.filter((c) => {
    const matchesQuery = !query || c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query) || c.primal.toLowerCase().includes(query);
    const matchesMethod = !m || (Array.isArray(c.ideal_methods) && c.ideal_methods.some((im) => String(im).toLowerCase() === m));
    return matchesQuery && matchesMethod;
  });

  res.status(200).json({ cuts: filtered });
}
