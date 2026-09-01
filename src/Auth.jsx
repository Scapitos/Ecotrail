// src/Auth.jsx
import { useState } from "react";
import { supabase } from "./supabaseClient";

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
    <div style={containerStyle}>
      <h2 style={{ color: "#3D5A40", marginTop: 0, marginBottom: 20 }}>
        {isSignUp ? "Créer un compte" : "Connexion"}
      </h2>

      <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
        <input
          type="email"
          placeholder="Ton email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Ton mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {isSignUp && (
          <input
            type="password"
            placeholder="Confirme ton mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={inputStyle}
          />
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 8,
            border: "none",
            background: "#3D5A40",
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer",
            marginTop: 4,
          }}
        >
          {loading ? "Chargement..." : isSignUp ? "S'inscrire" : "Se connecter"}
        </button>
      </form>

      {message && (
        <p
          style={{
            fontSize: 13,
            marginTop: 14,
            marginBottom: 0,
            color: "#D9534F",
            fontWeight: 700,
            width: "100%",
            wordBreak: "break-word", // Force le texte à aller à la ligne sans élargir la boîte
            overflowWrap: "break-word",
          }}
        >
          {message}
        </p>
      )}

      <button
        onClick={() => {
          setIsSignUp(!isSignUp);
          setMessage(null);
          setConfirmPassword("");
        }}
        style={{
          background: "none",
          border: "none",
          color: "#4A7C82",
          marginTop: 16,
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {isSignUp ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? S'inscrire"}
      </button>
    </div>
  );
}

const containerStyle = {
  width: "320px", // Largeur strictly fixe
  margin: "60px auto",
  padding: 24,
  textAlign: "center",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 8,
  border: "1px solid #DCD5C0",
  boxSizing: "border-box",
  fontSize: 14,
};