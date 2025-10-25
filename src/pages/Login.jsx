// src/pages/Login.jsx
import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Lock, Mail, Shield, AlertTriangle } from "lucide-react";

// Security utility functions
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[;]/g, '') // Remove semicolons
    .trim();
};

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6 && password.length <= 128;
};

const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaValue, setCaptchaValue] = useState("");
  const formRef = useRef(null);
  const lastAttemptTime = useRef(0);

  const BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5003";

  // Initialize security measures
  useEffect(() => {
    // Generate CSRF token
    setCsrfToken(generateCSRFToken());
    
    // Check for existing lockout
    const lockoutData = localStorage.getItem('loginLockout');
    if (lockoutData) {
      const { attempts, lockedUntil } = JSON.parse(lockoutData);
      setAttempts(attempts);
      if (lockedUntil && new Date(lockedUntil) > new Date()) {
        setLockedUntil(lockedUntil);
        setCaptchaRequired(attempts >= 3);
      }
    }

    // Set up form security
    if (formRef.current) {
      formRef.current.setAttribute('autocomplete', 'on');
      formRef.current.setAttribute('novalidate', 'false');
    }
  }, []);

  // Rate limiting check
  const checkRateLimit = () => {
    const now = Date.now();
    const timeDiff = now - lastAttemptTime.current;
    
    // Minimum 2 seconds between attempts
    if (timeDiff < 2000) {
      setError("Please wait before trying again");
      return false;
    }
    lastAttemptTime.current = now;
    return true;
  };

  // Check if account is locked
  const isAccountLocked = () => {
    if (lockedUntil && new Date(lockedUntil) > new Date()) {
      const remainingTime = Math.ceil((new Date(lockedUntil) - new Date()) / 1000);
      setError(`Account locked. Try again in ${remainingTime} seconds`);
      return true;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Security checks
    if (isAccountLocked()) return;
    if (!checkRateLimit()) return;

    // Clear any previous errors
    setError("");

    // Input validation and sanitization
    const sanitizedEmail = sanitizeInput(formData.email);
    const sanitizedPassword = sanitizeInput(formData.password);

    if (!validateEmail(sanitizedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!validatePassword(sanitizedPassword)) {
      setError("Password must be between 6 and 128 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare secure request
      const requestBody = {
        email: sanitizedEmail,
        password: sanitizedPassword,
        csrfToken: csrfToken,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        captcha: captchaRequired ? captchaValue : undefined
      };

      const response = await fetch(`${BASE_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-Token": csrfToken,
          "X-Forwarded-For": "127.0.0.1", // Will be overridden by server
        },
        credentials: 'same-origin',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!data.ok) {
        // Handle failed attempts
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          const lockoutTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
          setLockedUntil(lockoutTime);
          localStorage.setItem('loginLockout', JSON.stringify({
            attempts: newAttempts,
            lockedUntil: lockoutTime.toISOString()
          }));
          setError("Too many failed attempts. Account locked for 15 minutes.");
          return;
        }
        
        if (newAttempts >= 3) {
          setCaptchaRequired(true);
        }
        
        localStorage.setItem('loginLockout', JSON.stringify({
          attempts: newAttempts,
          lockedUntil: null
        }));
        
        // Show specific error message
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      // Successful login - clear security measures
      localStorage.removeItem('loginLockout');
      setAttempts(0);
      setCaptchaRequired(false);
      setLockedUntil(null);

      // Store admin info securely
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminInfo", JSON.stringify(data.admin));
      
      // Force redirect to admin dashboard
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Sanitize input in real-time
    const sanitizedValue = sanitizeInput(value);
    
    setFormData({
      ...formData,
      [name]: sanitizedValue
    });
  };

  // Generate simple CAPTCHA
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [captchaText, setCaptchaText] = useState("");

  useEffect(() => {
    if (captchaRequired) {
      setCaptchaText(generateCaptcha());
    }
  }, [captchaRequired]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/favicon-32x32.png" alt="Zuperior" className="h-12 w-12 rounded-full" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Zuperior Admin</h1>
          <p className="text-gray-600 mt-2">Sign in to your admin account</p>
        </div>

        {/* Security Warning */}
        {attempts > 0 && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span className="text-sm">
              {attempts} failed attempt{attempts > 1 ? 's' : ''}. 
              {attempts >= 3 && " CAPTCHA required."}
              {attempts >= 5 && " Account locked."}
            </span>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" autoComplete="on">
            {/* CSRF Token (hidden) */}
            <input type="hidden" name="csrfToken" value={csrfToken} />
            
            {/* Security Headers */}
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-green-600 font-medium">Secure Login</span>
            </div>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  maxLength={254}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="admin@zuperior.io"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  maxLength={128}
                  minLength={6}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* CAPTCHA Field */}
            {captchaRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Verification
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <div className="text-2xl font-mono font-bold text-gray-800 tracking-wider">
                        {captchaText}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCaptchaText(generateCaptcha())}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Refresh
                  </button>
                </div>
                <input
                  type="text"
                  value={captchaValue}
                  onChange={(e) => setCaptchaValue(sanitizeInput(e.target.value))}
                  placeholder="Enter the code above"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  maxLength={10}
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (captchaRequired && captchaValue.toLowerCase() !== captchaText.toLowerCase())}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Security Features Info */}
            <div className="text-xs text-gray-500 text-center space-y-1">
              <div className="flex items-center justify-center">
                <Shield className="h-3 w-3 mr-1" />
                <span>Fully Protected </span>
              </div>
          
            </div>
          </form>

          {/* Footer */}
          
        </div>

        
      </div>
    </div>
  );
}
