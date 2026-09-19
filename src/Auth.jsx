// src/Auth.jsx
import { useState } from "react";
import { supabase } from "./supabaseClient";
import "./Auth.css";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (isSignUp) {
      if (password !== confirmPassword) {
        setMessage("Les mots de passe ne correspondent pas.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage("Compte créé ! Vérifie tes emails pour valider l'inscription.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <h2 className="auth-title">{isSignUp ? "Créer un compte" : "Connexion"}</h2>

      <form onSubmit={handleAuth} className="auth-form">
        <input
          type="email"
          placeholder="Ton email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Ton mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
        />

        {isSignUp && (
          <input
            type="password"
            placeholder="Confirme ton mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="auth-input"
          />
        )}

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? "Chargement..." : isSignUp ? "S'inscrire" : "Se connecter"}
        </button>
      </form>

      {message && <p className="auth-message">{message}</p>}

      <button
        onClick={() => {
          setIsSignUp(!isSignUp);
          setMessage(null);
          setConfirmPassword("");
        }}
        className="auth-toggle"
      >
        {isSignUp ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? S'inscrire"}
      </button>
    </div>
  );
}
