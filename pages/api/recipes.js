import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { q = '', cut = '' } = req.query;
  const dataPath = path.join(process.cwd(), 'data', 'recipes.json');
  const file = fs.readFileSync(dataPath, 'utf-8');
  const recipes = JSON.parse(file);
  const query = String(q).toLowerCase();
  const cutId = String(cut).toLowerCase();

  const filtered = recipes.filter((r) => {
    const matchesQuery = !query || r.title.toLowerCase().includes(query) || (r.ingredients && r.ingredients.join(' ').toLowerCase().includes(query));
    const matchesCut = !cutId || String(r.cut).toLowerCase() === cutId;
    return matchesQuery && matchesCut;
  });

  res.status(200).json({ recipes: filtered });
}
