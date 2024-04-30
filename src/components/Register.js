import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";
// TODO: CRIO_TASK_MODULE_REGISTER - Implement the register function
import { useHistory, Link } from "react-router-dom";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [showLoading, setShowLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const history = useHistory();

  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   -* }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  const register = async (formData) => {
    setShowLoading(true);

    // Validate user input
    if (!validateInput({ username, password, confirmPassword })) {
      setShowLoading(false);
      return;
    }

    try {
      // Make an API request to the backend
      const response = await axios.post(`${config.endpoint}/auth/register`, {
        username,
        password,
      });

      if (response.status === 201 && response.data.success) {
        setShowLoading(false);
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        // Registration successful
        enqueueSnackbar("Registered successfully", { variant: "success" });

        history.push("/login");
      } else {
        // Handle other success response scenarios or unexpected responses
        enqueueSnackbar("Something went wrong. Please try again.", {
          variant: "error",
        });
      }
    } catch (error) {
      if (error.response) {
        setShowLoading(false);
        // HTTP 4xx errors, show the error message from the backend
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      } else {
        // Network or other errors
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };

  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   * 
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */


  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: "error" });
      return false;
    }

    if (data.username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters", {
        variant: "error",
      });
      return false;
    }

    if (!data.password) {
      enqueueSnackbar("Password is a required field", { variant: "error" });
      return false;
    }
    if (data.password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", {
        variant: "error",
      });
      return false;
    }

    if (data.password !== data.confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "error" });
      return false;
    }

    return true;
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />

      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
          />
          <TextField
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
          />
          <TextField
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
          />
          {showLoading ? (
            <CircularProgress />
          ) : (
            <Button
              className="button"
              variant="contained"
              onClick={async () => {
                let formData = {
                  username: username,
                  password: password,
                  confirmPassword: confirmPassword,
                };

                await register(formData);
              }}
            >
              Register Now
            </Button>
          )}
          {/* <Button className="button" variant="contained" onClick={register}>
            Register Now
            </Button> */}
          <p className="secondary-action">
            Already have an account?{" "}
            <Link className="link" to="/login">
              Login here
            </Link>
          </p>
        </Stack>
      </Box>
      
      <Footer />

    </Box>
  );
};

export default Register;
