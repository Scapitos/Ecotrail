// src/Auth.jsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "./supabaseClient";
import "./Auth.css";

function PasswordInput({ value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-password-wrapper">
      <input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="auth-input auth-input--password"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="auth-password-toggle"
        tabIndex={-1}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState("signIn"); // "signIn" | "signUp" | "forgot"
  const [message, setMessage] = useState(null);

  function switchMode(newMode) {
    setMode(newMode);
    setMessage(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "signUp") {
      if (password !== confirmPassword) {
        setMessage("Les mots de passe ne correspondent pas.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage("Compte créé ! Vérifie tes emails pour valider l'inscription.");
    } else if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) setMessage(error.message);
      else setMessage("Un email de réinitialisation vient de t'être envoyé.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
    }
    setLoading(false);
  }

  const titles = {
    signIn: "Connexion",
    signUp: "Créer un compte",
    forgot: "Mot de passe oublié",
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">{titles[mode]}</h2>

      <form onSubmit={handleAuth} className="auth-form">
        <input
          type="email"
          placeholder="Ton email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
        />

        {mode !== "forgot" && (
          <PasswordInput
            placeholder="Ton mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {mode === "signUp" && (
          <PasswordInput
            placeholder="Confirme ton mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}

        <button type="submit" disabled={loading} className="auth-submit">
          {loading
            ? "Chargement..."
            : mode === "signUp"
            ? "S'inscrire"
            : mode === "forgot"
            ? "Envoyer le lien de réinitialisation"
            : "Se connecter"}
        </button>
      </form>

      {message && <p className="auth-message">{message}</p>}

      {mode === "signIn" && (
        <button onClick={() => switchMode("forgot")} className="auth-forgot">
          Mot de passe oublié ?
        </button>
      )}

      <button
        onClick={() => switchMode(mode === "signUp" ? "signIn" : mode === "forgot" ? "signIn" : "signUp")}
        className="auth-toggle"
      >
        {mode === "signUp"
          ? "Déjà un compte ? Se connecter"
          : mode === "forgot"
          ? "Retour à la connexion"
          : "Pas encore de compte ? S'inscrire"}
      </button>
    </div>
  );
}

export function ResetPasswordForm({ onDone }) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);

  async function handleReset(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else {
      setMessage("Mot de passe mis à jour !");
      setTimeout(onDone, 1500);
    }
  }

  return (
    <div className="auth-container">
      <h2 className="auth-title">Nouveau mot de passe</h2>

      <form onSubmit={handleReset} className="auth-form">
        <PasswordInput
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordInput
          placeholder="Confirme ton mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? "Chargement..." : "Valider le nouveau mot de passe"}
        </button>
      </form>

      {message && <p className="auth-message">{message}</p>}
    </div>
  );
}
