"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "@/components/session";
import { api } from "@/lib/format";
import { Button, Field, Input, PageTitle, Select, Textarea } from "@/components/ui";

export default function PerfilPage() {
  const { user, refresh } = useSession();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [availability, setAvailability] = useState("Disponible");

  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [size, setSize] = useState("1-10");

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    if (user.candidate) {
      setHeadline(user.candidate.headline);
      setBio(user.candidate.bio);
      setSkills(user.candidate.skills.join(", "));
      setExperience(user.candidate.experience);
      setEducation(user.candidate.education);
      setLocation(user.candidate.location);
      setPhone(user.candidate.phone);
      setLinkedin(user.candidate.linkedin);
      setPortfolio(user.candidate.portfolio);
      setAvailability(user.candidate.availability || "Disponible");
    }
    if (user.company) {
      setCompanyName(user.company.companyName);
      setDescription(user.company.description);
      setIndustry(user.company.industry);
      setWebsite(user.company.website);
      setLocation(user.company.location);
      setPhone(user.company.phone);
      setSize(user.company.size || "1-10");
    }
  }, [user]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const body =
        user?.role === "COMPANY"
          ? { name, companyName, description, industry, website, location, phone, size }
          : {
              name,
              headline,
              bio,
              skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
              experience,
              education,
              location,
              phone,
              linkedin,
              portfolio,
              availability,
            };
      await api("/api/profile", { method: "PUT", body: JSON.stringify(body) });
      await refresh();
      setMessage("Perfil guardado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div>
      <PageTitle
        title={user.role === "COMPANY" ? "Perfil de empresa" : "Mi perfil técnico"}
        subtitle="Esta información es visible para la comunidad de TucanJobs."
      />
      <form onSubmit={onSubmit} className="max-w-2xl space-y-4 rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
        <Field label="Nombre">
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>

        {user.role === "CANDIDATE" ? (
          <>
            <Field label="Headline profesional">
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Ej. Desarrollador Full Stack" />
            </Field>
            <Field label="Bio">
              <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
            </Field>
            <Field label="Skills (separadas por coma)">
              <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js, SQL" />
            </Field>
            <Field label="Experiencia">
              <Textarea rows={3} value={experience} onChange={(e) => setExperience(e.target.value)} />
            </Field>
            <Field label="Educación">
              <Textarea rows={2} value={education} onChange={(e) => setEducation(e.target.value)} />
            </Field>
            <Field label="Disponibilidad">
              <Select value={availability} onChange={(e) => setAvailability(e.target.value)}>
                <option>Disponible</option>
                <option>Abierto a ofertas</option>
                <option>No disponible</option>
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="LinkedIn">
                <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
              </Field>
              <Field label="Portfolio / GitHub">
                <Input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} />
              </Field>
            </div>
          </>
        ) : (
          <>
            <Field label="Nombre de la empresa">
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </Field>
            <Field label="Descripción">
              <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Industria">
                <Input value={industry} onChange={(e) => setIndustry(e.target.value)} />
              </Field>
              <Field label="Tamaño">
                <Select value={size} onChange={(e) => setSize(e.target.value)}>
                  <option>1-10</option>
                  <option>11-50</option>
                  <option>51-200</option>
                  <option>200+</option>
                </Select>
              </Field>
            </div>
            <Field label="Sitio web">
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
            </Field>
          </>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ubicación">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
          <Field label="Teléfono">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>

        {message ? <p className="text-sm text-forest-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando…" : "Guardar perfil"}
        </Button>
      </form>
    </div>
  );
}
