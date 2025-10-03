import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";

export default function LoginPage() {
  const { login, loginWithGoogleIdToken } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(form);
      nav("/welcome"); // ✅ Always go to welcome after login
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (response) => {
    try {
      const idToken = response?.credential;
      await loginWithGoogleIdToken(idToken);
      nav("/welcome"); // ✅ Google login also goes to welcome
    } catch {
      setErr("Google sign-in failed. Please try again.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          display: "grid",
          placeItems: "center",
          p: 2,
          bgcolor: "grey.50",
        }}
      >
        <Card
          sx={{
            maxWidth: 420,
            width: "100%",
            borderRadius: 3,
            boxShadow: 6,
            p: { xs: 2, sm: 3 },
          }}
        >
          <CardContent>
            {/* Branding */}
            <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
              LocalHands
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ mb: 3, color: "text.secondary" }}
            >
              Welcome back 👋 Please sign in to continue
            </Typography>

            {/* Error Banner */}
            {err && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {err}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={onSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
                </Button>
              </Stack>
            </form>

            {/* Divider */}
            <Divider sx={{ my: 3 }}>or</Divider>

            {/* Google Login */}
            <Stack alignItems="center">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => setErr("Google sign-in failed")}
                theme="outline"
                size="large"
                width="100%"
              />
            </Stack>

            {/* Footer */}
            <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
              New here?{" "}
              <Link to="/register" style={{ fontWeight: 600, color: "#1976d2" }}>
                Create an account
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </GoogleOAuthProvider>
  );
}
