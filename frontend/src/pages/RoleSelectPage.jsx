// pages/RoleSelectPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Stack,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HandymanIcon from "@mui/icons-material/Handyman";

export default function RoleSelectPage() {
  const { user, setRole } = useAuth();
  const nav = useNavigate();

  // 🔹 Redirect if role already set
  useEffect(() => {
    if (user?.role) {
      nav(`/${user.role}`, { replace: true });
    }
  }, [user, nav]);

  const choose = async (role) => {
    const u = await setRole(role); // persist role in DB
    nav(`/${u.role}`, { replace: true });
  };

  return (
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
          maxWidth: 720,
          width: "100%",
          borderRadius: 3,
          boxShadow: 6,
          p: { xs: 2, sm: 4 },
        }}
      >
        <CardContent>
          {/* Header */}
          <Typography
            variant="h4"
            fontWeight={700}
            textAlign="center"
            gutterBottom
          >
            Hi {user?.name?.split(" ")[0] || ""}, choose your role
          </Typography>
          <Typography
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 5 }}
          >
            Select how you want to use LocalHands.
          </Typography>

          {/* Role Options */}
          <Grid container spacing={4}>
            {/* Customer */}
            <Grid item xs={12} md={6}>
              <Card
                variant="outlined"
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  transition: "0.3s",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: 4,
                  },
                }}
              >
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "primary.light",
                    color: "primary.main",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <PersonOutlineIcon fontSize="large" />
                </Stack>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  I’m a Customer
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Book trusted services instantly near you.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => choose("customer")}
                  sx={{ borderRadius: 2 }}
                >
                  Continue as Customer
                </Button>
              </Card>
            </Grid>

            {/* Provider */}
            <Grid item xs={12} md={6}>
              <Card
                variant="outlined"
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  transition: "0.3s",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: 4,
                  },
                }}
              >
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "secondary.light",
                    color: "secondary.main",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <HandymanIcon fontSize="large" />
                </Stack>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  I’m a Provider
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Accept jobs, upload documents, and get verified.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => choose("provider")}
                  sx={{ borderRadius: 2 }}
                >
                  Continue as Provider
                </Button>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
