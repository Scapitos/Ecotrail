// src/App.jsx
import { useState, useMemo, useEffect } from "react";
import { Leaf, Check, Award, RotateCcw, LogOut } from "lucide-react";
import { TYPOLOGIES, ELEMENTS, OPTIONS } from "./config";
import { BADGES } from "./badges";
import { getBadge, pickChallenges, getChallengesByIds } from "./challenges";
import { getChallengePoints } from "./points";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";

export default function EcoTrail() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // États de l'application
  const [step, setStep] = useState("profile");
  const [typology, setTypology] = useState(null);
  const [elements, setElements] = useState([]);
  const [options, setOptions] = useState([]);
  const [proposedChallenges, setProposedChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]); // tableau d'ids de défis cochés
  const [totalPoints, setTotalPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [savedWalk, setSavedWalk] = useState(null); // balade détectée au chargement, en attente de choix

  // Écoute de l'authentification
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadUserProfile(session.user.id);
      else setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadUserProfile(session.user.id);
      else setLoadingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Charger les points ET la balade en cours depuis Supabase
  async function loadUserProfile(userId) {
    const { data, error } = await supabase
      .from("profils")
      .select("points_total, balade_en_cours")
      .eq("id", userId)
      .single();

    if (data) {
      setTotalPoints(data.points_total || 0);

      if (data.balade_en_cours) {
        setSavedWalk(data.balade_en_cours);
      }
    } else if (error && error.code === "PGRST116") {
      await supabase.from("profils").insert([{ id: userId, points_total: 0 }]);
    }
    setLoadingSession(false);
  }

  // Sauvegarder les points dans Supabase
  async function syncPoints(newPoints) {
    if (!session) return;
    const { error } = await supabase.from("profils").upsert({
      id: session.user.id,
      points_total: newPoints,
    });
    if (error) console.error("❌ Erreur Supabase (points) :", error.message);
  }

  // Sauvegarder la balade en cours (ou l'effacer si null)
  async function syncCurrentWalk(walkState) {
    if (!session) return;
    const { error } = await supabase.from("profils").upsert({
      id: session.user.id,
      balade_en_cours: walkState,
    });
    if (error) console.error("❌ Erreur Supabase (balade) :", error.message);
  }

  // À chaque changement des défis tirés ou des défis cochés, on sauvegarde
  useEffect(() => {
    if (step === "challenges" && proposedChallenges.length > 0) {
      syncCurrentWalk({
        typologie: typology,
        elements,
        options,
        defisProposesIds: proposedChallenges.map((c) => c.id),
        defisRealises: completedChallenges,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposedChallenges, completedChallenges]);

  const currentBadge = useMemo(() => getBadge(totalPoints), [totalPoints]);
  const nextBadge = useMemo(
    () => BADGES.find((b) => b.threshold > totalPoints),
    [totalPoints]
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

  function startWalk() {
    setProposedChallenges(pickChallenges(typology, elements, options));
    setCompletedChallenges([]);
    setStep("challenges");
  }

  function toggleCompleted(id) {
    setCompletedChallenges((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function validateWalk() {
    const validatedChallenges = proposedChallenges.filter((c) => completedChallenges.includes(c.id));
    const earnedPoints = validatedChallenges.reduce((total, c) => total + getChallengePoints(c.difficulty), 0);
    const newTotal = totalPoints + earnedPoints;

    setTotalPoints(newTotal);
    syncPoints(newTotal);
    syncCurrentWalk(null); // la balade est terminée, on efface la sauvegarde
    setHistory((h) => [
      {
        label: `${validatedChallenges.length} défi(s) réalisé(s) sur ${proposedChallenges.length}`,
        points: earnedPoints,
        validatedChallenges,
      },
      ...h,
    ]);
    setStep("recap");
  }

  function resumeWalk() {
    const w = savedWalk;
    setTypology(w.typologie || null);
    setElements(w.elements || []);
    setOptions(w.options || []);
    setProposedChallenges(getChallengesByIds(w.defisProposesIds || []));
    setCompletedChallenges(w.defisRealises || []);
    setStep("challenges");
    setSavedWalk(null);
  }

  function cancelSavedWalk() {
    syncCurrentWalk(null);
    setSavedWalk(null);
  }

  function startNewWalk() {
    setTypology(null);
    setElements([]);
    setOptions([]);
    setProposedChallenges([]);
    setCompletedChallenges([]);
    setStep("profile");
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
      {savedWalk && (
        <OngoingWalkModal onResume={resumeWalk} onCancel={cancelSavedWalk} />
      )}

      <div style={{ width: "100%", maxWidth: 420, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header totalPoints={totalPoints} badge={currentBadge} />

        <div style={{ flex: 1, padding: "20px 20px 32px" }}>
          {step === "profile" && (
            <ProfileStep
              typology={typology}
              setTypology={setTypology}
              elements={elements}
              toggleElement={toggleElement}
              options={options}
              toggleOption={toggleOption}
              onStart={startWalk}
            />
          )}

          {step === "challenges" && (
            <ChallengesStep
              challenges={proposedChallenges}
              completedChallenges={completedChallenges}
              onToggle={toggleCompleted}
              onValidate={validateWalk}
              onBack={() => setStep("profile")}
            />
          )}

          {step === "recap" && (
            <RecapStep
              lastResult={history[0]}
              totalPoints={totalPoints}
              badge={currentBadge}
              nextBadge={nextBadge}
              onNewWalk={startNewWalk}
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

function Header({ totalPoints, badge }) {
  async function signOut() {
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
        <div style={{ textAlign: "left" }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#3D5A40", margin: 0, lineHeight: 1.1 }}>
            EcoTrail
          </h1>
          <span style={{ fontSize: 11, color: "#8A8064" }}>Balade & Biodiversité</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#2E2A22" }}>{badge.name}</div>
          <div style={{ fontSize: 11, color: "#4A7C82", fontWeight: 800 }}>{totalPoints} pts</div>
        </div>
        <button
          onClick={signOut}
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

function OngoingWalkModal({ onResume, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(46, 42, 34, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          padding: 24,
          maxWidth: 340,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 10 }}>🥾</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2E2A22", margin: "0 0 8px" }}>
          Balade en cours...
        </h2>
        <p style={{ fontSize: 13.5, color: "#8A8064", lineHeight: 1.5, marginBottom: 20 }}>
          Tu as une balade non terminée avec des défis en attente. Veux-tu la reprendre ou l'annuler ?
        </p>

        <button onClick={onResume} style={primaryButton}>
          Reprendre ma balade
        </button>
        <button
          onClick={onCancel}
          style={{
            width: "100%",
            marginTop: 10,
            padding: "12px 20px",
            borderRadius: 12,
            border: "1px solid #D9534F",
            background: "transparent",
            color: "#D9534F",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Annuler la balade
        </button>
      </div>
    </div>
  );
}

function ProfileStep({ typology, setTypology, elements, toggleElement, options, toggleOption, onStart }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={sectionTitle}>1. Où marches-tu principalement aujourd'hui ?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {TYPOLOGIES.map((t) => {
            const active = typology === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTypology(t.id)}
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
                {Icon && <Icon size={24} color={active ? "#3D5A40" : "#2E2A22"} />}
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6, color: "#2E2A22" }}>
                  {t.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 style={sectionTitle}>2. Tu vas croiser...</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {ELEMENTS.map((el) => {
            const active = elements.includes(el.id);
            const Icon = el.icon;
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
                {Icon && <Icon size={20} color={active ? "#4A7C82" : "#2E2A22"} />}
                <span style={{ fontSize: 13, fontWeight: 600, color: "#2E2A22" }}>{el.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 style={sectionTitle}>3. Et en bonus : </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {OPTIONS.map((opt) => {
            const active = options.includes(opt.id);
            const Icon = opt.icon;
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
                {Icon && <Icon size={20} color={active ? "#4A7C82" : "#2E2A22"} />}
                <span style={{ fontSize: 13, fontWeight: 600, color: "#2E2A22" }}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        disabled={!typology}
        onClick={onStart}
        style={{
          ...primaryButton,
          opacity: typology ? 1 : 0.5,
          cursor: typology ? "pointer" : "not-allowed",
          marginTop: 8,
        }}
      >
        Trouver mes défis
      </button>
    </div>
  );
}

function ChallengesStep({ challenges, completedChallenges, onToggle, onValidate, onBack }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button onClick={onBack} style={backButton}>
        ← Modifier l'environnement
      </button>

      <h2 style={sectionTitle}>Tes défis du jour</h2>
      <p style={{ fontSize: 13, color: "#8A8064", margin: 0, lineHeight: 1.5 }}>
        3 défis t'attendent. Coche ceux que tu as réalisés à la fin de ta balade.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {challenges.map((challenge) => {
          const completed = completedChallenges.includes(challenge.id);
          return (
            <div
              key={challenge.id}
              style={{
                padding: 16,
                borderRadius: 14,
                background: completed ? "#E8F0E6" : "#FFFFFF",
                border: completed ? "2px solid #3D5A40" : "1px solid #DCD5C0",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={difficultyBadge(challenge.difficulty)}>
                  Niveau {challenge.difficulty}
                  {challenge.difficulty >= 4 ? " · Corsé" : ""}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#3D5A40" }}>
                  +{getChallengePoints(challenge.difficulty)} pts
                </span>
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#2E2A22" }}>{challenge.title}</h3>
              <p style={{ fontSize: 13, color: "#8A8064", margin: 0, lineHeight: 1.4 }}>{challenge.explanation}</p>

              <button
                onClick={() => onToggle(challenge.id)}
                style={{
                  marginTop: 6,
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  border: completed ? "none" : "1px solid #DCD5C0",
                  background: completed ? "#3D5A40" : "#FFFFFF",
                  color: completed ? "#FFFFFF" : "#5C543F",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {completed && <Check size={16} />}
                {completed ? "Réalisé" : "C'est fait !"}
              </button>
            </div>
          );
        })}
      </div>

      <button onClick={onValidate} style={{ ...primaryButton, marginTop: 8 }}>
        Valider ma balade ({completedChallenges.length}/{challenges.length})
      </button>
    </div>
  );
}

function RecapStep({ lastResult, totalPoints, badge, nextBadge, onNewWalk }) {
  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 20, padding: "10px 0" }}>
      <div style={{ fontSize: 48, margin: 0 }}>🎉</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#3D5A40", margin: 0 }}>Bravo pour ta balade !</h2>

      <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 16, border: "1px solid #DCD5C0" }}>
        <div style={{ fontSize: 13, color: "#8A8064" }}>Résultat :</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#2E2A22", margin: "4px 0 12px" }}>
          {lastResult?.label}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#3D5A40" }}>
          +{lastResult?.points || 0} points
        </div>
      </div>

      <div style={{ background: "#E8F0E6", padding: 16, borderRadius: 14, textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Award size={24} color="#3D5A40" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#3D5A40" }}>Badge : {badge.name}</div>
            {nextBadge && (
              <div style={{ fontSize: 12, color: "#8A8064" }}>
                Plus que {nextBadge.threshold - totalPoints} pts pour débloquer {nextBadge.name}
              </div>
            )}
          </div>
        </div>
      </div>

      <button onClick={onNewWalk} style={primaryButton}>
        <RotateCcw size={18} /> Nouvelle balade
      </button>
    </div>
  );
}

/* ==========================================================================
   STYLES RÉUTILISABLES
   ========================================================================== */

const sectionTitle = {
  fontSize: 15,
  fontWeight: 800,
  color: "#3D5A40",
  margin: 0,
};

const primaryButton = {
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

const backButton = {
  background: "none",
  border: "none",
  color: "#4A7C82",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  textAlign: "left",
  padding: 0,
};

function difficultyBadge(diff) {
  const colors = {
    1: { bg: "#E8F0E6", txt: "#3D5A40" },
    2: { bg: "#FFF4E5", txt: "#B76E00" },
    3: { bg: "#FCE8E6", txt: "#C53929" },
    4: { bg: "#F1E3F7", txt: "#7B2CBF" },
    5: { bg: "#2E2A22", txt: "#FFFFFF" },
  };
  const c = colors[diff] || colors[1];

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
