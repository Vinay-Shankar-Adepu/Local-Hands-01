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
  Alert,
  Divider,
  CircularProgress,
} from "@mui/material";

export default function RegisterPage() {
  const { register, loginWithGoogleIdToken, redirectAfterAuth } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const u = await register(form);
      redirectAfterAuth(u, nav);
    } catch (e) {
      setErr(e?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (response) => {
    try {
      const idToken = response?.credential;
      const u = await loginWithGoogleIdToken(idToken);
      redirectAfterAuth(u, nav);
    } catch {
      setErr("Google sign-up failed. Please try again.");
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
            maxWidth: 500,
            width: "100%",
            borderRadius: 3,
            boxShadow: 6,
            p: { xs: 2, sm: 3 },
          }}
        >
          <CardContent>
            {/* Branding */}
            <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
              Join LocalHands
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ mb: 3, color: "text.secondary" }}
            >
              Create your account to book trusted services anytime
            </Typography>

            {/* Error Banner */}
            {err && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {err}
              </Alert>
            )}

            {/* Register Form */}
            <form onSubmit={onSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Full Name"
                  fullWidth
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <TextField
                  label="Phone"
                  type="tel"
                  fullWidth
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
                </Button>
              </Stack>
            </form>

            {/* Divider */}
            <Divider sx={{ my: 3 }}>or</Divider>

            {/* Google Sign Up */}
            <Stack alignItems="center">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => setErr("Google sign-up failed")}
                theme="outline"
                size="large"
                width="100%"
              />
            </Stack>

            {/* Footer */}
            <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
              Already have an account?{" "}
              <Link to="/login" style={{ fontWeight: 600, color: "#1976d2" }}>
                Login
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </GoogleOAuthProvider>
  );
}
