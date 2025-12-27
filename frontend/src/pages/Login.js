// frontend/src/pages/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    tenantSubdomain: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", formData);
      const { token } = res.data.data;

      // Store Token & User Info
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));

      // Decode to check role (optional, but good for debugging)
      const decoded = jwtDecode(token);
      console.log("Logged in as:", decoded);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card shadow-sm mt-5">
          <div className="card-body">
            <h2 className="text-center mb-4">Login</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Organization Subdomain</label>
                <input
                  type="text"
                  name="tenantSubdomain"
                  className="form-control"
                  placeholder="e.g. tesla"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-success w-100">
                Login
              </button>
            </form>
            <div className="mt-3 text-center">
              <p>
                New organization? <Link to="/register">Register here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
