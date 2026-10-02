export type MatchCandidate = {
  skills: string[];
  headline?: string;
  bio?: string;
  experience?: string;
  cvText?: string;
  projects?: { name: string; description: string }[];
};

export type MatchJob = {
  title: string;
  description: string;
  requirements?: string;
  skills: string[];
};

export type MatchResult = {
  score: number;
  matched: string[];
  missing: string[];
  label: string;
};

const STOPWORDS = new Set(
  "de la el los las un una y o en con para por del al a su sus que se es lo como mas más o/a junior mid senior sr jr ssr experiencia real buscamos alguien equipo".split(
    " ",
  ),
);

const ALIASES: Record<string, string[]> = {
  "node.js": ["node", "nodejs", "express"],
  "next.js": ["next", "nextjs"],
  javascript: ["js", "ecmascript"],
  typescript: ["ts"],
  postgresql: ["postgres", "sql", "supabase"],
  "soporte it": ["soporte", "helpdesk", "mesa de ayuda"],
  redes: ["networking", "vlan", "mikrotik", "tcp/ip"],
  ia: ["inteligencia artificial", "machine learning", "ml", "llm", "openai", "yolo", "opencv"],
  pwa: ["progressive web app", "service worker"],
  ux: ["ui", "diseño", "figma"],
  docker: ["contenedores", "compose"],
  linux: ["ubuntu", "debian", "vps"],
  salud: ["clínica", "clinica", "hospital", "pacientes", "diabetes", "ips"],
};

export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function variants(skill: string) {
  const key = normalize(skill);
  const extra = Object.entries(ALIASES).find(([k, list]) => k === key || list.includes(key));
  const all = new Set([key]);
  if (extra) {
    all.add(extra[0]);
    extra[1].forEach((v) => all.add(normalize(v)));
  }
  return [...all];
}

function containsTerm(haystack: string, term: string) {
  if (!term) return false;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(haystack);
}

function tokens(text: string) {
  return normalize(text)
    .split(/[^a-z0-9.+#]+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

export function matchScore(candidate: MatchCandidate, job: MatchJob): MatchResult {
  const candidateSkills = new Set(candidate.skills.flatMap(variants));
  const corpus = normalize(
    [
      candidate.headline,
      candidate.bio,
      candidate.experience,
      candidate.cvText,
      ...(candidate.projects || []).map((p) => `${p.name} ${p.description}`),
      candidate.skills.join(" "),
    ]
      .filter(Boolean)
      .join(" "),
  );

  const matched: string[] = [];
  const missing: string[] = [];
  for (const skill of job.skills) {
    const hit = variants(skill).some((v) => candidateSkills.has(v) || containsTerm(corpus, v));
    (hit ? matched : missing).push(skill);
  }

  const jobTokens = [...new Set(tokens(`${job.title} ${job.requirements || ""}`))];
  const tokenHits = jobTokens.filter((t) => containsTerm(corpus, t)).length;
  const textRatio = jobTokens.length ? tokenHits / jobTokens.length : 0;

  const skillRatio = job.skills.length ? matched.length / job.skills.length : textRatio;
  const raw = skillRatio * 0.75 + textRatio * 0.25;
  const score = Math.max(5, Math.min(99, Math.round(raw * 100)));

  const label = score >= 80 ? "Match excelente" : score >= 60 ? "Muy buen match" : score >= 40 ? "Match parcial" : "Match bajo";
  return { score, matched, missing, label };
}
