import { useState } from "react";
import type { FormEvent } from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(
        email.trim(),
        password,
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f6f8",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "360px",
          padding: "32px",
          background: "white",
          borderRadius: "12px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1>CRM Login</h1>

        {error && (
          <div
            style={{
              padding: "10px",
              marginBottom: "16px",
              background: "#fee2e2",
              color: "#b91c1c",
              borderRadius: "6px",
            }}
          >
            {error}
          </div>
        )}

        <label>
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="Enter your email"
          required
          style={{
            width: "100%",
            padding: "10px",
            margin:
              "6px 0 16px",
            boxSizing: "border-box",
          }}
        />

        <label>
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(
              event.target.value,
            )
          }
          placeholder="Enter your password"
          required
          style={{
            width: "100%",
            padding: "10px",
            margin:
              "6px 0 20px",
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "11px",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "Signing in..."
            : "Sign in"}
        </button>
      </form>
    </div>
  );
};