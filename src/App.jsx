// src/App.jsx
import { useState, useMemo, useEffect } from "react";
import { Leaf, Check, Award, RotateCcw, LogOut } from "lucide-react";
import { TYPOLOGIES, ELEMENTS, OPTIONS, BADGES } from "./config";
import { getBadge, pickDefis, getPointsDefi, getDefisParIds } from "./defis";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";

export default function EcoTrail() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // États de l'application
  const [etape, setEtape] = useState("profil");
  const [typologie, setTypologie] = useState(null);
  const [elements, setElements] = useState([]);
  const [options, setOptions] = useState([]);
  const [defisProposes, setDefisProposes] = useState([]);
  const [defisRealises, setDefisRealises] = useState([]); // tableau d'ids de défis cochés
  const [pointsTotal, setPointsTotal] = useState(0);
  const [historique, setHistorique] = useState([]);

  // Écoute de l'authentification
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) chargerProfilUtilisateur(session.user.id);
      else setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) chargerProfilUtilisateur(session.user.id);
      else setLoadingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Charger les points ET la balade en cours depuis Supabase
  async function chargerProfilUtilisateur(userId) {
    const { data, error } = await supabase
      .from("profils")
      .select("points_total, balade_en_cours")
      .eq("id", userId)
      .single();

    if (data) {
      setPointsTotal(data.points_total || 0);

      if (data.balade_en_cours) {
        const b = data.balade_en_cours;
        setTypologie(b.typologie || null);
        setElements(b.elements || []);
        setOptions(b.options || []);
        setDefisProposes(getDefisParIds(b.defisProposesIds || []));
        setDefisRealises(b.defisRealises || []);
        setEtape("defis");
      }
    } else if (error && error.code === "PGRST116") {
      await supabase.from("profils").insert([{ id: userId, points_total: 0 }]);
    }
    setLoadingSession(false);
  }

  // Sauvegarder les points dans Supabase
  async function synchroniserPoints(nouveauxPoints) {
    if (!session) return;
    const { error } = await supabase.from("profils").upsert({
      id: session.user.id,
      points_total: nouveauxPoints,
    });
    if (error) console.error("❌ Erreur Supabase (points) :", error.message);
  }

  // Sauvegarder la balade en cours (ou l'effacer si null)
  async function synchroniserBaladeEnCours(baladeState) {
    if (!session) return;
    const { error } = await supabase.from("profils").upsert({
      id: session.user.id,
      balade_en_cours: baladeState,
    });
    if (error) console.error("❌ Erreur Supabase (balade) :", error.message);
  }

  // À chaque changement des défis tirés ou des défis cochés, on sauvegarde
  useEffect(() => {
    if (etape === "defis" && defisProposes.length > 0) {
      synchroniserBaladeEnCours({
        typologie,
        elements,
        options,
        defisProposesIds: defisProposes.map((d) => d.id),
        defisRealises,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defisProposes, defisRealises]);

  const badgeActuel = useMemo(() => getBadge(pointsTotal), [pointsTotal]);
  const prochainBadge = useMemo(
    () => BADGES.find((b) => b.seuil > pointsTotal),
    [pointsTotal]
  );

  function toggleElement(id) {
    setElements((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  function toggleOption(id) {
    setOptions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  }

  function lancerBalade() {
    setDefisProposes(pickDefis(typologie, elements, options));
    setDefisRealises([]);
    setEtape("defis");
  }

  function toggleRealise(id) {
    setDefisRealises((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function validerBalade() {
    const defisValides = defisProposes.filter((d) => defisRealises.includes(d.id));
    const pointsGagnes = defisValides.reduce((total, d) => total + getPointsDefi(d.difficulte), 0);
    const nouveauTotal = pointsTotal + pointsGagnes;

    setPointsTotal(nouveauTotal);
    synchroniserPoints(nouveauTotal);
    synchroniserBaladeEnCours(null); // la balade est terminée, on efface la sauvegarde
    setHistorique((h) => [
      {
        libelle: `${defisValides.length} défi(s) réalisé(s) sur ${defisProposes.length}`,
        points: pointsGagnes,
        defisValides,
      },
      ...h,
    ]);
    setEtape("recap");
  }

  function nouvelleBalade() {
    setTypologie(null);
    setElements([]);
    setOptions([]);
    setDefisProposes([]);
    setDefisRealises([]);
    setEtape("profil");
  }

  if (loadingSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F7F4EC",
        }}
      >
        <Leaf size={32} color="#3D5A40" style={{ animation: "pulse 1.2s ease-in-out infinite" }} />
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(0.9); }
            50% { opacity: 1; transform: scale(1.1); }
          }
        `}</style>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#F7F4EC",
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        color: "#2E2A22",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header pointsTotal={pointsTotal} badge={badgeActuel} />

        <div style={{ flex: 1, padding: "20px 20px 32px" }}>
          {etape === "profil" && (
            <EtapeProfil
              typologie={typologie}
              setTypologie={setTypologie}
              elements={elements}
              toggleElement={toggleElement}
              options={options}
              toggleOption={toggleOption}
              onLancer={lancerBalade}
            />
          )}

          {etape === "defis" && (
            <EtapeDefis
              defis={defisProposes}
              defisRealises={defisRealises}
              onToggle={toggleRealise}
              onValider={validerBalade}
              onRetour={() => setEtape("profil")}
            />
          )}

          {etape === "recap" && (
            <EtapeRecap
              dernierResultat={historique[0]}
              pointsTotal={pointsTotal}
              badge={badgeActuel}
              prochainBadge={prochainBadge}
              onNouvelleBalade={nouvelleBalade}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   SOUS-COMPOSANTS DE L'APPLICATION
   ========================================================================== */

function Header({ pointsTotal, badge }) {
  async function seDeconnecter() {
    await supabase.auth.signOut();
  }

  return (
    <header
      style={{
        padding: "16px 20px",
        background: "#FFFFFF",
        borderBottom: "1px solid #EAE5D9",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "#E8F0E6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#3D5A40",
          }}
        >
          <Leaf size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#3D5A40", margin: 0, lineHeight: 1.1, textAlign: "left" }}>
            EcoTrail
          </h1>
          <span style={{ fontSize: 11, color: "#8A8064", textAlign: "left" }}>Balade & Biodiversité</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#2E2A22" }}>{badge.nom}</div>
          <div style={{ fontSize: 11, color: "#4A7C82", fontWeight: 800 }}>{pointsTotal} pts</div>
        </div>
        <button
          onClick={seDeconnecter}
          title="Se déconnecter"
          style={{
            background: "none",
            border: "none",
            color: "#8A8064",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

function EtapeProfil({ typologie, setTypologie, elements, toggleElement, options, toggleOption, onLancer }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={titreSection}>1. Où marches-tu principalement aujourd'hui ?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {TYPOLOGIES.map((t) => {
            const active = typologie === t.id;
            const Icone = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTypologie(t.id)}
                style={{
                  padding: "14px 12px",
                  borderRadius: 12,
                  border: active ? "2px solid #3D5A40" : "1px solid #DCD5C0",
                  background: active ? "#E8F0E6" : "#FFFFFF",
                  textAlign: "center",
                  cursor: "pointer",
                  color: "#2E2A22",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {Icone && <Icone size={24} color={active ? "#3D5A40" : "#2E2A22"} />}
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6, color: "#2E2A22" }}>
                  {t.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 style={titreSection}>2. Tu vas croiser...</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {ELEMENTS.map((el) => {
            const active = elements.includes(el.id);
            const Icone = el.icon;
            return (
              <button
                key={el.id}
                onClick={() => toggleElement(el.id)}
                style={{
                  padding: "12px",
                  borderRadius: 12,
                  border: active ? "2px solid #4A7C82" : "1px solid #DCD5C0",
                  background: active ? "#EAF2F3" : "#FFFFFF",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  color: "#2E2A22",
                }}
              >
                {Icone && <Icone size={20} color={active ? "#4A7C82" : "#2E2A22"} />}
                <span style={{ fontSize: 13, fontWeight: 600, color: "#2E2A22" }}>{el.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 style={titreSection}>3. D'autres choses ?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {OPTIONS.map((opt) => {
            const active = options.includes(opt.id);
            const Icone = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => toggleOption(opt.id)}
                style={{
                  padding: "12px",
                  borderRadius: 12,
                  border: active ? "2px solid #4A7C82" : "1px solid #DCD5C0",
                  background: active ? "#EAF2F3" : "#FFFFFF",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  color: "#2E2A22",
                }}
              >
                {Icone && <Icone size={20} color={active ? "#4A7C82" : "#2E2A22"} />}
                <span style={{ fontSize: 13, fontWeight: 600, color: "#2E2A22" }}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        disabled={!typologie}
        onClick={onLancer}
        style={{
          ...boutonPrincipal,
          opacity: typologie ? 1 : 0.5,
          cursor: typologie ? "pointer" : "not-allowed",
          marginTop: 8,
        }}
      >
        Trouver mes défis
      </button>
    </div>
  );
}

function EtapeDefis({ defis, defisRealises, onToggle, onValider, onRetour }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button onClick={onRetour} style={boutonRetour}>
        ← Modifier l'environnement
      </button>

      <h2 style={titreSection}>Tes défis du jour</h2>
      <p style={{ fontSize: 13, color: "#8A8064", margin: 0, lineHeight: 1.5 }}>
        3 défis t'attendent, dont un plus corsé. Coche ceux que tu as réalisés à la fin de ta balade.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {defis.map((defi) => {
          const realise = defisRealises.includes(defi.id);
          return (
            <div
              key={defi.id}
              style={{
                padding: 16,
                borderRadius: 14,
                background: realise ? "#E8F0E6" : "#FFFFFF",
                border: realise ? "2px solid #3D5A40" : "1px solid #DCD5C0",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={badgeDifficulte(defi.difficulte)}>
                  Niveau {defi.difficulte}
                  {defi.difficulte >= 4 ? " · Corsé" : ""}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#3D5A40" }}>
                  +{getPointsDefi(defi.difficulte)} pts
                </span>
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#2E2A22" }}>{defi.titre}</h3>
              <p style={{ fontSize: 13, color: "#8A8064", margin: 0, lineHeight: 1.4 }}>{defi.explication}</p>

              <button
                onClick={() => onToggle(defi.id)}
                style={{
                  marginTop: 6,
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  border: realise ? "none" : "1px solid #DCD5C0",
                  background: realise ? "#3D5A40" : "#FFFFFF",
                  color: realise ? "#FFFFFF" : "#5C543F",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {realise && <Check size={16} />}
                {realise ? "Réalisé" : "C'est fait !"}
              </button>
            </div>
          );
        })}
      </div>

      <button onClick={onValider} style={{ ...boutonPrincipal, marginTop: 8 }}>
        Valider ma balade ({defisRealises.length}/{defis.length})
      </button>
    </div>
  );
}

function EtapeRecap({ dernierResultat, pointsTotal, badge, prochainBadge, onNouvelleBalade }) {
  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 20, padding: "10px 0" }}>
      <div style={{ fontSize: 48, margin: 0 }}>🎉</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#3D5A40", margin: 0 }}>Bravo pour ta balade !</h2>

      <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 16, border: "1px solid #DCD5C0" }}>
        <div style={{ fontSize: 13, color: "#8A8064" }}>Résultat :</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#2E2A22", margin: "4px 0 12px" }}>
          {dernierResultat?.libelle}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#3D5A40" }}>
          +{dernierResultat?.points || 0} points
        </div>
      </div>

      <div style={{ background: "#E8F0E6", padding: 16, borderRadius: 14, textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Award size={24} color="#3D5A40" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#3D5A40" }}>Badge : {badge.nom}</div>
            {prochainBadge && (
              <div style={{ fontSize: 12, color: "#8A8064" }}>
                Plus que {prochainBadge.seuil - pointsTotal} pts pour débloquer {prochainBadge.nom}
              </div>
            )}
          </div>
        </div>
      </div>

      <button onClick={onNouvelleBalade} style={boutonPrincipal}>
        <RotateCcw size={18} /> Nouvelle balade
      </button>
    </div>
  );
}

/* ==========================================================================
   STYLES RÉUTILISABLES
   ========================================================================== */

const titreSection = {
  fontSize: 15,
  fontWeight: 800,
  color: "#3D5A40",
  margin: 0,
};

const boutonPrincipal = {
  width: "100%",
  padding: "14px 20px",
  borderRadius: 12,
  border: "none",
  background: "#3D5A40",
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const boutonRetour = {
  background: "none",
  border: "none",
  color: "#4A7C82",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  textAlign: "left",
  padding: 0,
};

function badgeDifficulte(diff) {
  const couleurs = {
    1: { bg: "#E8F0E6", txt: "#3D5A40" },
    2: { bg: "#FFF4E5", txt: "#B76E00" },
    3: { bg: "#FCE8E6", txt: "#C53929" },
    4: { bg: "#F1E3F7", txt: "#7B2CBF" },
    5: { bg: "#2E2A22", txt: "#FFFFFF" },
  };
  const c = couleurs[diff] || couleurs[1];

  return {
    fontSize: 11,
    fontWeight: 800,
    padding: "3px 8px",
    borderRadius: 6,
    background: c.bg,
    color: c.txt,
    display: "inline-block",
  };
}
