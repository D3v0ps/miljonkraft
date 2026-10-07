import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Filmen renderas av scripts/film och ligger i public/film. Sektionen och länken i hero
 * visas bara när filerna finns, så att sidan aldrig pekar på en film som saknas.
 */
const dir = join(process.cwd(), 'public', 'film');
const base = '/film/miljonkraft-film';

export interface FilmScene { start: number; end: number; title?: string; text: string[] }

function readText(): FilmScene[] {
  const file = join(dir, 'miljonkraft-film-text.json');
  if (!existsSync(file)) return [];
  try {
    const raw = JSON.parse(readFileSync(file, 'utf8'));
    const list = Array.isArray(raw) ? raw : raw.scenes ?? [];
    return list.map((s: Record<string, unknown>) => {
      const lines = (s.text ?? s.lines ?? s.onScreen ?? []) as unknown;
      return {
        start: Number(s.start ?? 0),
        end: Number(s.end ?? 0),
        title: typeof s.title === 'string' ? s.title : typeof s.chapter === 'string' ? s.chapter : undefined,
        text: Array.isArray(lines) ? lines.map(String) : [String(lines)],
      };
    });
  } catch {
    return [];
  }
}

const has = (name: string) => existsSync(join(dir, name));

export const film = {
  available: has('miljonkraft-film-1080.mp4') && has('miljonkraft-film-poster.jpg'),
  mp4: `${base}-1080.mp4`,
  mp4Small: has('miljonkraft-film-720.mp4') ? `${base}-720.mp4` : null,
  webm: has('miljonkraft-film-1080.webm') ? `${base}-1080.webm` : null,
  vertical: has('miljonkraft-film-vertikal.mp4') ? `${base}-vertikal.mp4` : null,
  poster: `${base}-poster.jpg`,
  posterWebp: has('miljonkraft-film-poster.webp') ? `${base}-poster.webp` : null,
  chapters: has('miljonkraft-film-kapitel.vtt') ? `${base}-kapitel.vtt` : null,
  scenes: readText(),
};
