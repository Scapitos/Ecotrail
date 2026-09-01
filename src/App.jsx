// src/App.jsx
import { useState, useMemo, useEffect } from "react";
import { Leaf, Check, X, Award, RotateCcw, LogOut, PlayCircle } from "lucide-react";
import { TYPOLOGIES, ELEMENTS, BADGES } from "./config";
import { getBadge, pickDefis, getPointsDefi } from "./defis";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";

export default function EcoTrail() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // États de l'application
  const [etape, setEtape] = useState("profil");
  const [typologie, setTypologie] = useState(null);
  const [elements, setElements] = useState([]);
  const [defisProposes, setDefisProposes] = useState([]);
  const [defiChoisi, setDefiChoisi] = useState(null);
  const [defiEnCours, setDefiEnCours] = useState(null);
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

  // Charger les données depuis Supabase
  async function chargerProfilUtilisateur(userId) {
    const { data, error } = await supabase
      .from("profils")
      .select("points_total, defi_en_cours")
      .eq("id", userId)
      .single();

    if (data) {
      setPointsTotal(data.points_total || 0);
      setDefiEnCours(data.defi_en_cours || null);
    } else if (error && error.code === "PGRST116") {
      await supabase.from("profils").insert([{ id: userId, points_total: 0 }]);
    }
    setLoadingSession(false);
  }

  // Sauvegarder dans Supabase
async function synchroniserBDD(nouveauxPoints, nouveauDefiEnCours) {
  if (!session) return;

  const { error } = await supabase.from("profils").upsert({
    id: session.user.id,
    points_total: nouveauxPoints,
    defi_en_cours: nouveauDefiEnCours,
  });

  if (error) {
    console.error("❌ Erreur Supabase :", error.message);
  } else {
    console.log("✅ Enregistré !");
  }
}

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

  function lancerBalade() {
    setDefisProposes(pickDefis(typologie, elements));
    setEtape("defis");
  }

  function choisirDefi(defi) {
    setDefiChoisi(defi);
    setDefiEnCours(defi);
    synchroniserBDD(pointsTotal, defi);
    setEtape("detail");
  }

  function terminerBalade() {
    setEtape("validation");
  }

  function validerPrincipal(reussi) {
    if (reussi) {
      const pointsGagnes = getPointsDefi(defiChoisi.difficulte);
      const nouveauTotal = pointsTotal + pointsGagnes;
      setPointsTotal(nouveauTotal);
      setDefiEnCours(null);
      synchroniserBDD(nouveauTotal, null);
      setHistorique((h) => [{ libelle: defiChoisi.titre, points: pointsGagnes, type: "principal" }, ...h]);
      setEtape("recap");
    } else {
      setEtape("remplacement");
    }
  }

  function validerRemplacement(fait) {
    const pointsGagnes = fait ? getPointsDefi(defiChoisi.difficulte) : 0;
    const nouveauTotal = pointsTotal + pointsGagnes;
    setPointsTotal(nouveauTotal);
    setDefiEnCours(null);
    synchroniserBDD(nouveauTotal, null);
    setHistorique((h) => [
      {
        libelle: fait ? defiChoisi.remplacement.titre : "Aucun défi réalisé",
        points: pointsGagnes,
        type: fait ? "remplacement" : "aucun",
      },
      ...h,
    ]);
    setEtape("recap");
  }

  function abandonnerDefi() {
    setDefiEnCours(null);
    setDefiChoisi(null);
    synchroniserBDD(pointsTotal, null);
    setEtape("profil");
  }

  function reprendreDefiActif() {
    setDefiChoisi(defiEnCours);
    setEtape("detail");
  }

  function nouvelleBalade() {
    setTypologie(null);
    setElements([]);
    setDefisProposes([]);
    setDefiChoisi(null);
    setEtape("profil");
  }

  if (loadingSession) {
    return <div style={{ textAlign: "center", padding: 50, color: "#3D5A40" }}>Chargement...</div>;
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

        {/* BANDEAU "DÉFI EN COURS" */}
        {defiEnCours && etape === "profil" && (
          <div
            style={{
              margin: "16px 20px 0",
              padding: 14,
              borderRadius: 12,
              background: "#E8F0E6",
              border: "1px solid #C4D7C1",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#3D5A40", textTransform: "uppercase" }}>
              📍 Défi en cours
            </div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{defiEnCours.titre}</div>

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                onClick={reprendreDefiActif}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: "#3D5A40",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <PlayCircle size={16} /> Reprendre / Valider
              </button>
              <button
                onClick={abandonnerDefi}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #D9534F",
                  background: "transparent",
                  color: "#D9534F",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Abandonner
              </button>
            </div>
          </div>
        )}

        <div style={{ flex: 1, padding: "20px 20px 32px" }}>
          {etape === "profil" && (
            <EtapeProfil
              typologie={typologie}
              setTypologie={setTypologie}
              elements={elements}
              toggleElement={toggleElement}
              onLancer={lancerBalade}
            />
          )}

          {etape === "defis" && (
            <EtapeDefis defis={defisProposes} onChoisir={choisirDefi} onRetour={() => setEtape("profil")} />
          )}

          {etape === "detail" && (
            <EtapeDetail defi={defiChoisi} onTerminer={terminerBalade} onRetour={() => setEtape("defis")} />
          )}

          {etape === "validation" && (
            <EtapeValidation defi={defiChoisi} onValider={validerPrincipal} />
          )}

          {etape === "remplacement" && (
            <EtapeRemplacement defi={defiChoisi} onValiderRemplacement={validerRemplacement} />
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
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#3D5A40", margin: 0, lineHeight: 1.1 }}>
            EcoTrail
          </h1>
          <span style={{ fontSize: 11, color: "#8A8064" }}>Balade & Biodiversité</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#2E2A22" }}>
            {badge.icone} {badge.nom}
          </div>
          <div style={{ fontSize: 11, color: "#4A7C82", fontWeight: 800 }}>
            {pointsTotal} pts
          </div>
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

function EtapeProfil({ typologie, setTypologie, elements, toggleElement, onLancer }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={titreSection}>1. Où marches-tu principalement aujourd'hui ?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {TYPOLOGIES.map((t) => {
            const active = typologie === t.id;
            const Icone = t.icon; // Récupération du composant icône
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
        <h2 style={titreSection}>2.  Tu vas croiser...</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {ELEMENTS.map((el) => {
            const active = elements.includes(el.id);
            const Icone = el.icon; // Récupération du composant icône
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
                <span style={{ fontSize: 13, fontWeight: 600, color: "#2E2A22" }}>
                  {el.label}
                </span>
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

function EtapeDefis({ defis, onChoisir, onRetour }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button onClick={onRetour} style={boutonRetour}>
        ← Modifier l'environnement
      </button>

      <h2 style={titreSection}>Choisis ton défi de balade</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {defis.map((defi) => (
          <div
            key={defi.id}
            onClick={() => onChoisir(defi)}
            style={{
              padding: 16,
              borderRadius: 14,
              background: "#FFFFFF",
              border: "1px solid #DCD5C0",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={badgeDifficulte(defi.difficulte)}>Niveau {defi.difficulte}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#3D5A40" }}>
                +{getPointsDefi(defi.difficulte)} pts
              </span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#2E2A22" }}>{defi.titre}</h3>
            <p style={{ fontSize: 13, color: "#8A8064", margin: 0, lineHeight: 1.4 }}>
              {defi.explication.substring(0, 90)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EtapeDetail({ defi, onTerminer, onRetour }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button onClick={onRetour} style={boutonRetour}>
        ← Choisir un autre défi
      </button>

      <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 16, border: "1px solid #DCD5C0" }}>
        <span style={badgeDifficulte(defi.difficulte)}>Niveau {defi.difficulte}</span>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#3D5A40", marginTop: 12, marginBottom: 8 }}>
          {defi.titre}
        </h2>
        <p style={{ fontSize: 14, color: "#2E2A22", lineHeight: 1.5, marginBottom: 20 }}>
          {defi.explication}
        </p>

        <div style={{ background: "#F7F4EC", padding: 14, borderRadius: 12, border: "1px solid #EAE5D9" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#4A7C82", marginBottom: 4 }}>
            🔄 Défi de substitution (si impossible en balade)
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2E2A22" }}>
            {defi.remplacement.titre}
          </div>
        </div>
      </div>

      <button onClick={onTerminer} style={boutonPrincipal}>
        Terminer la balade & valider
      </button>
    </div>
  );
}

function EtapeValidation({ defi, onValider }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 0", display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#3D5A40" }}>As-tu réussi ton défi ?</h2>
      <p style={{ fontSize: 15, color: "#8A8064" }}>« {defi.titre} »</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
        <button onClick={() => onValider(true)} style={boutonValider}>
          <Check size={20} /> Oui, défi réussi ! (+{getPointsDefi(defi.difficulte)} pts)
        </button>
        <button onClick={() => onValider(false)} style={boutonRemplacement}>
          <X size={20} /> Non, passer au défi de substitution
        </button>
      </div>
    </div>
  );
}

function EtapeRemplacement({ defi, onValiderRemplacement }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#4A7C82", margin: 0 }}>Pas de souci !</h2>
        <p style={{ fontSize: 14, color: "#8A8064", marginTop: 4 }}>Voici ton défi de remplacement à faire plus tard :</p>
      </div>

      <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 16, border: "1px solid #DCD5C0" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2E2A22", marginTop: 0 }}>
          {defi.remplacement.titre}
        </h3>
        <p style={{ fontSize: 14, color: "#8A8064", lineHeight: 1.5, margin: 0 }}>
          {defi.remplacement.explication}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={() => onValiderRemplacement(true)} style={boutonValider}>
          <Check size={20} /> J'ai réalisé la substitution (+{getPointsDefi(defi.difficulte)} pts)
        </button>
        <button onClick={() => onValiderRemplacement(false)} style={boutonSecondaire}>
          Je ne peux pas le faire maintenant
        </button>
      </div>
    </div>
  );
}

function EtapeRecap({ dernierResultat, pointsTotal, badge, prochainBadge, onNouvelleBalade }) {
  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 20, padding: "10px 0" }}>
      <div style={{ fontSize: 48, margin: 0 }}>🎉</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#3D5A40", margin: 0 }}>Bravo pour ton action !</h2>

      <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 16, border: "1px solid #DCD5C0" }}>
        <div style={{ fontSize: 13, color: "#8A8064" }}>Défi enregistré :</div>
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
            <div style={{ fontSize: 14, fontWeight: 700, color: "#3D5A40" }}>
              Badge : {badge.nom} {badge.icone}
            </div>
            {prochainBadge && (
              <div style={{ fontSize: 12, color: "#8A8064" }}>
                Plus que {prochainBadge.seuil - pointsTotal} pts pour débloquer {prochainBadge.nom} {prochainBadge.icone}
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

const boutonSecondaire = {
  width: "100%",
  padding: "12px 20px",
  borderRadius: 12,
  border: "1px solid #DCD5C0",
  background: "#FFFFFF",
  color: "#2E2A22",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

const boutonValider = {
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

const boutonRemplacement = {
  width: "100%",
  padding: "14px 20px",
  borderRadius: 12,
  border: "none",
  background: "#4A7C82",
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