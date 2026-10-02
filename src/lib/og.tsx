import { SITE_URL } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };

export async function fetchImageData(src: string) {
  try {
    const url = src.startsWith("http") ? src : `${SITE_URL}${src}`;
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "image/jpeg";
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

type CardProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  chips?: string[];
  image?: string | null;
  round?: boolean;
};

export function OgCard({ eyebrow, title, subtitle, chips = [], image, round }: CardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "linear-gradient(135deg, #022c22 0%, #065f46 45%, #1e40af 100%)",
        color: "white",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -160,
          width: 640,
          height: 640,
          display: "flex",
          background: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(16,185,129,0) 70%)",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 56px 56px 72px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 700 }}>
          <span>Tucan</span>
          <span style={{ color: "#6ee7b7", marginLeft: -14 }}>Jobs</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 4,
              color: "#a7f3d0",
            }}
          >
            {eyebrow}
          </div>
          <div style={{ display: "flex", fontSize: title.length > 40 ? 56 : 68, fontWeight: 800, lineHeight: 1.08, marginTop: 14 }}>{title}</div>
          {subtitle ? <div style={{ display: "flex", fontSize: 28, color: "rgba(255,255,255,0.8)", marginTop: 18 }}>{subtitle}</div> : null}
          {chips.length ? (
            <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
              {chips.slice(0, 4).map((c) => (
                <div
                  key={c}
                  style={{
                    display: "flex",
                    fontSize: 22,
                    padding: "8px 18px",
                    borderRadius: 9999,
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.6)" }}>TucanJobs · Posadas, Misiones</div>
      </div>
      {image ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 430, paddingRight: 56 }}>
          <img
            src={image}
            alt=""
            width={round ? 340 : 380}
            height={round ? 340 : 380}
            style={{
              objectFit: "cover",
              borderRadius: round ? 9999 : 48,
              border: "8px solid rgba(255,255,255,0.25)",
              boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
