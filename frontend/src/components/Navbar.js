import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Utility: check if route is active
  const isActive = (path) => loc.pathname === path;

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{ bgcolor: "white", color: "text.primary" }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Brand */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: "none",
            color: "primary.main",
            fontWeight: 700,
          }}
        >
          LocalHands
        </Typography>

        {/* Desktop Nav */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          <Button
            component={Link}
            to="/"
            color={isActive("/") ? "primary" : "inherit"}
          >
            Home
          </Button>

          {user?.role === "customer" && (
            <Button
              component={Link}
              to="/customer"
              color={isActive("/customer") ? "primary" : "inherit"}
            >
              Customer
            </Button>
          )}
          {user?.role === "provider" && (
            <Button
              component={Link}
              to="/provider"
              color={isActive("/provider") ? "primary" : "inherit"}
            >
              Provider
            </Button>
          )}
          {user?.role === "admin" && (
            <Button
              component={Link}
              to="/admin"
              color={isActive("/admin") ? "primary" : "inherit"}
            >
              Admin
            </Button>
          )}

          {!user ? (
            <>
              <Button variant="outlined" onClick={() => nav("/login")}>
                Login
              </Button>
              <Button
                variant="contained"
                disableElevation
                onClick={() => nav("/register")}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="error"
              disableElevation
              onClick={() => {
                logout();
                nav("/");
              }}
            >
              Logout
            </Button>
          )}
        </Box>

        {/* Mobile Nav */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton onClick={handleMenu} color="inherit">
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <MenuItem component={Link} to="/" onClick={handleClose}>
              Home
            </MenuItem>
            {user?.role === "customer" && (
              <MenuItem component={Link} to="/customer" onClick={handleClose}>
                Customer
              </MenuItem>
            )}
            {user?.role === "provider" && (
              <MenuItem component={Link} to="/provider" onClick={handleClose}>
                Provider
              </MenuItem>
            )}
            {user?.role === "admin" && (
              <MenuItem component={Link} to="/admin" onClick={handleClose}>
                Admin
              </MenuItem>
            )}
            {!user ? (
              <>
                <MenuItem onClick={() => { handleClose(); nav("/login"); }}>
                  Login
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); nav("/register"); }}>
                  Sign Up
                </MenuItem>
              </>
            ) : (
              <MenuItem
                onClick={() => {
                  handleClose();
                  logout();
                  nav("/");
                }}
              >
                Logout
              </MenuItem>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
