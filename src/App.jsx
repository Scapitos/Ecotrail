// src/App.jsx
import { useState, useMemo, useEffect } from "react";
import { Leaf, Check, Award, RotateCcw, LogOut, ArrowRightLeft } from "lucide-react";
import { TYPOLOGIES, ELEMENTS, OPTIONS } from "./config";
import { BADGES } from "./badges";
import { getBadge, pickChallenges, getChallengesByIds, getAlternativeChallenges } from "./challenges";
import { getChallengePoints } from "./points";
import { supabase } from "./supabaseClient";
import Auth, { ResetPasswordForm } from "./Auth";
import "./App.css";

export default function EcoTrail() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
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

  function requestAlternativeChallenge(currentChallenge) {
    const others = proposedChallenges.filter((c) => c.id !== currentChallenge.id);
    return getAlternativeChallenges(currentChallenge, typology, elements, options, others);
  }

  function confirmReplacement(oldId, newChallenge) {
    setProposedChallenges((prev) => prev.map((c) => (c.id === oldId ? newChallenge : c)));
    setCompletedChallenges((prev) => prev.filter((id) => id !== oldId));
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
      <div className="app-loading">
        <Leaf size={32} color="#3D5A40" className="app-loading-icon" />
      </div>
    );
  }

  if (passwordRecovery) {
    return <ResetPasswordForm onDone={() => setPasswordRecovery(false)} />;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="app-shell">
      {savedWalk && (
        <OngoingWalkModal onResume={resumeWalk} onCancel={cancelSavedWalk} />
      )}

      <div className="app-container">
        <Header totalPoints={totalPoints} badge={currentBadge} />

        <div className="app-content">
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
              onRequestAlternative={requestAlternativeChallenge}
              onConfirmReplacement={confirmReplacement}
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
    <header className="header">
      <div className="header-brand">
        <div className="header-icon">
          <Leaf size={20} />
        </div>
        <div className="header-titles">
          <h1 className="header-title">EcoTrail</h1>
          <span className="header-subtitle">Balade & Biodiversité</span>
        </div>
      </div>

      <div className="header-info">
        <div className="header-stats">
          <div className="header-badge-name">{badge.name}</div>
          <div className="header-points">{totalPoints} pts</div>
        </div>
        <button onClick={signOut} title="Se déconnecter" className="header-signout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

function OngoingWalkModal({ onResume, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-emoji">🥾</div>
        <h2 className="modal-title">Balade en cours...</h2>
        <p className="modal-text">
          Tu as une balade non terminée avec des défis en attente. Veux-tu la reprendre ou l'annuler ?
        </p>

        <button onClick={onResume} className="btn-primary">
          Reprendre ma balade
        </button>
        <button onClick={onCancel} className="btn-cancel">
          Annuler la balade
        </button>
      </div>
    </div>
  );
}

function ProfileStep({ typology, setTypology, elements, toggleElement, options, toggleOption, onStart }) {
  return (
    <div className="profile-step">
      <div>
        <h2 className="section-title">1. Où marches-tu principalement aujourd'hui ?</h2>
        <div className="option-grid">
          {TYPOLOGIES.map((t) => {
            const active = typology === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTypology(t.id)}
                className={`type-button${active ? " active" : ""}`}
              >
                {Icon && <Icon size={24} color={active ? "#3D5A40" : "#2E2A22"} />}
                <div className="type-button-label">{t.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="section-title">2. Tu vas croiser...</h2>
        <div className="option-grid">
          {ELEMENTS.map((el) => {
            const active = elements.includes(el.id);
            const Icon = el.icon;
            return (
              <button
                key={el.id}
                onClick={() => toggleElement(el.id)}
                className={`choice-button${active ? " active" : ""}`}
              >
                {Icon && <Icon size={20} color={active ? "#4A7C82" : "#2E2A22"} />}
                <span className="choice-button-label">{el.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="section-title">3. Et en bonus : </h2>
        <div className="option-grid">
          {OPTIONS.map((opt) => {
            const active = options.includes(opt.id);
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => toggleOption(opt.id)}
                className={`choice-button${active ? " active" : ""}`}
              >
                {Icon && <Icon size={20} color={active ? "#4A7C82" : "#2E2A22"} />}
                <span className="choice-button-label">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button disabled={!typology} onClick={onStart} className="btn-primary btn-primary--spaced">
        Trouver mes défis
      </button>
    </div>
  );
}

function ChallengesStep({ challenges, completedChallenges, onToggle, onValidate, onBack, onRequestAlternative, onConfirmReplacement }) {
  return (
    <div className="challenges-step">
      <button onClick={onBack} className="btn-back">
        ← Modifier l'environnement
      </button>

      <h2 className="section-title">Tes défis du jour</h2>
      <p className="challenges-intro">
        3 défis t'attendent. Pas convaincu par l'un d'eux ? Retourne la carte pour en changer.
      </p>

      <div className="challenge-list">
        {challenges.map((challenge, index) => (
          <ChallengeCard
            key={index}
            challenge={challenge}
            completed={completedChallenges.includes(challenge.id)}
            onToggleCompleted={() => onToggle(challenge.id)}
            onRequestAlternative={onRequestAlternative}
            onConfirmReplacement={onConfirmReplacement}
          />
        ))}
      </div>

      <button onClick={onValidate} className="btn-primary btn-primary--spaced">
        Valider ma balade ({completedChallenges.length}/{challenges.length})
      </button>
    </div>
  );
}
function ChallengeCard({ challenge, completed, onToggleCompleted, onRequestAlternative, onConfirmReplacement }) {
  const [flipped, setFlipped] = useState(false);
  const [backChallenge, setBackChallenge] = useState(null);

  function handleFlip() {
    if (flipped) return;
    const alternative = onRequestAlternative(challenge);
    if (!alternative) return;
    setBackChallenge(alternative);
    setFlipped(true);
  }

  function handleAnimationEnd(e) {
    if (e.propertyName !== "transform") return;
    onConfirmReplacement(challenge.id, backChallenge);
    setFlipped(false);
    setBackChallenge(null);
  }

  return (
    <div className="challenge-flip-outer">
      <div className={`challenge-flip-inner${flipped ? " flipped" : ""}`} onTransitionEnd={handleAnimationEnd}>
        <div className="challenge-flip-face challenge-flip-face--front">
          <ChallengeCardContent
            challenge={challenge}
            completed={completed}
            onToggleCompleted={onToggleCompleted}
            onFlip={handleFlip}
          />
        </div>
        <div className="challenge-flip-face challenge-flip-face--back">
          {backChallenge && (
            <ChallengeCardContent challenge={backChallenge} completed={false} onToggleCompleted={() => {}} onFlip={() => {}} />
          )}
        </div>
      </div>
    </div>
  );
}

function ChallengeCardContent({ challenge, completed, onToggleCompleted, onFlip }) {
  return (
    <div className={`challenge-card${completed ? " completed" : ""}`}>
      <div className="challenge-card-top">
        <span className={`badge-diff badge-diff-${challenge.difficulty}`}>
          Niveau {challenge.difficulty}
          {challenge.difficulty >= 4 ? " · Corsé" : ""}
        </span>
        <div className="challenge-card-actions">
          <span className="challenge-points">+{getChallengePoints(challenge.difficulty)} pts</span>
          <button onClick={onFlip} title="Proposer un autre défi de même niveau" className="challenge-flip-btn">
            <ArrowRightLeft size={16} />
          </button>
        </div>
      </div>

      <h3 className="challenge-title">{challenge.title}</h3>
      <p className="challenge-explanation">{challenge.explanation}</p>

      <button onClick={onToggleCompleted} className={`challenge-toggle-btn${completed ? " completed" : ""}`}>
        {completed && <Check size={16} />}
        {completed ? "Réalisé" : "C'est fait !"}
      </button>
    </div>
  );
}
function RecapStep({ lastResult, totalPoints, badge, nextBadge, onNewWalk }) {
  return (
    <div className="recap-step">
      <div className="recap-emoji">🎉</div>
      <h2 className="recap-title">Bravo pour ta balade !</h2>

      <div className="recap-result-card">
        <div className="recap-result-label">Résultat :</div>
        <div className="recap-result-text">{lastResult?.label}</div>
        <div className="recap-result-points">+{lastResult?.points || 0} points</div>
      </div>

      <div className="recap-badge-card">
        <div className="recap-badge-row">
          <Award size={24} color="#3D5A40" />
          <div>
            <div className="recap-badge-name">Badge : {badge.name}</div>
            {nextBadge && (
              <div className="recap-badge-next">
                Plus que {nextBadge.threshold - totalPoints} pts pour débloquer {nextBadge.name}
              </div>
            )}
          </div>
        </div>
      </div>

      <button onClick={onNewWalk} className="btn-primary">
        <RotateCcw size={18} /> Nouvelle balade
      </button>
    </div>
  );
}
