import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, Sparkles } from "lucide-react";

export const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Login successful!");

        // sessionStorage.setItem('sessionId', data.sessionId); // OR localStorage.setItem()
        // sessionStorage.setItem('userName', data.name);
        // sessionStorage.setItem('userId', data.userId);

        sessionStorage.setItem(
          "user",
          JSON.stringify({
            name: data.name,
            userId: data.userId,
            sessionId: data.sessionId,
          })
        );

        navigate("/dashboard");
      } else {
        setError(
          data.message || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Could not connect to the server. Please ensure the backend is running and accessible."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4 font-inter">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row min-h-[600px]">
        <div className="flex-1 bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 relative flex items-center justify-center overflow-hidden p-6 md:p-0">
          <div className="absolute inset-0">
            <div className="absolute top-12 left-12 text-white/30 text-2xl">
              <Sparkles />
            </div>
            <div className="absolute top-20 right-16 text-white/30 text-xl">
              <Sparkles />
            </div>
            <div className="absolute bottom-24 left-20 text-white/30 text-lg">
              <Sparkles />
            </div>
            <div className="absolute bottom-16 right-12 text-white/30 text-2xl">
              <Sparkles />
            </div>
            <div className="absolute top-1/3 right-8 text-white/30 text-sm">
              <Sparkles />
            </div>
            <div className="absolute bottom-1/3 left-8 text-white/30 text-sm">
              <Sparkles />
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-8 mb-4">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 12h3v8h14v-8h3L12 2zm0 15c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                </svg>
              </div>
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">XAVOR</h2>
            <p className="text-white/80 text-sm">Your Digital Partner</p>
          </div>
        </div>

        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Members Log in
              </h1>
              <p className="text-gray-600 text-sm">
                Welcome back! Please login to your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="username" // Changed name attribute to 'username'
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {message && (
                <p className="text-green-600 text-sm mt-2">{message}</p>
              )}

              <div className="flex justify-between items-center">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 accent-yellow-500" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a
                  href="#"
                  className="text-sm text-yellow-600 hover:text-yellow-700 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Log In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
