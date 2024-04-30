import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const logoutFunction = () => {
    localStorage.clear();
    enqueueSnackbar("Logged out successfully", { variant: "success" });
    history.push("/");
    window.location.reload();
  };

  return (
    <Box className="header">
      <Box className="header-title">
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>

      {hasHiddenAuthButtons === true ? (
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => history.push("/", { from: "Header" })}
        >
          Back to explore
        </Button>
      ) : (
        <>
          {children}
          <Stack direction="row" spacing={2}>
            {localStorage.getItem("username") ? (
              <>
                <Avatar
                  src="avtar.png"
                  alt={localStorage.getItem("username") || "profile"}
                />
                <p className="username-text">
                  {localStorage.getItem("username")}
                </p>

                <Button type="primary" onClick={logoutFunction}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="text"
                  onClick={() => history.push("/login", { from: "Header" })}
                >
                  LOGIN
                </Button>
                <Button
                  variant="contained"
                  onClick={() => history.push("/register", { from: "Header" })}
                >
                  Register
                </Button>
              </>
            )}
          </Stack>
        </>
      )}
    </Box>
  );
};

export default Header;
