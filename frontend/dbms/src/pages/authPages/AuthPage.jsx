import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState, useContext } from 'react';
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import LockIcon from "@mui/icons-material/Lock";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import './authPage.css';

const AuthPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [switchArticle, setSwitch] = useState(false);
    const [loggingIn, setLogging] = useState(false);
    const [isRegistering, setRegister] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [authData, setAuthData] = useState({
        username: '',
        password: '',
        regUsername: '',
        regPassword: '',
        regEmail: '',
        email: ''
    });
    const [authErrors, setAuthErrors] = useState({
        username: "",
        password: "",
        loginError: "",
        regUsername: '',
        regPassword: '',
        registrationError: '',
        regEmail: "",
        email: '',
    });
    const handleBlur = (name) => {
        if (name === "username") validateUsername(authData.username, "username");
        if (name === "password") validatePassword(authData.password, "password");
        if (name === "regUsername") validateUsername(authData.regUsername, "regUsername");
        if (name === "regPassword") validatePassword(authData.regPassword, "regPassword");
        if (name === "regEmail") validateEmail(authData.regEmail, "regEmail");
        if (name === "email") validateEmail(authData.email, "email");
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setAuthData(prev => ({
            ...prev,
            [name]: value.trim()
        }));
    };
    const validateUsername = (username, field) => {
        const usernameValidation = /^[a-zA-Z]+([ \-']{0,1}[a-zA-Z]+){0,2}$/;
        if (username.trim() === "") {
            setAuthErrors((prevErrors) => ({
                ...prevErrors,
                [field]: "Username is required",
            }));
        } else if (!usernameValidation.test(username)) {
            setAuthErrors((prevErrors) => ({
                ...prevErrors,
                [field]: "Username must start with a letter and be 4-24 characters long",
            }));
        } else {
            setAuthErrors((prevErrors) => ({
                ...prevErrors,
                [field]: "",
            }));
        }
    };

    const validatePassword = (password, field) => {
        const passwordValidation = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
        if (password.trim() === "") {
            setAuthErrors((prevErrors) => ({
                ...prevErrors,
                [field]: "Password is required",
            }));
        } else if (!passwordValidation.test(password)) {
            setAuthErrors((prevErrors) => ({
                ...prevErrors,
                [field]: "Password must be 8-24 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
            }));
        } else {
            setAuthErrors((prevErrors) => ({
                ...prevErrors,
                [field]: "",
            }));
        }
    };

    const validateEmail = (email, field) => {
        const emailValidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.trim() === "") {
            setAuthErrors(prev => ({ ...prev, [field]: "Email is required" }));
        } else if (!emailValidation.test(email)) {
            setAuthErrors(prev => ({ ...prev, [field]: "Enter a valid email address" }));
        } else {
            setAuthErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        validateEmail(authData.email, "email");
        validatePassword(authData.password, "password");

        // if (Object.values(authErrors).some(error => error !== "")) {
        //     console.log("Fix validation errors before submitting");
        //     return;
        // }
        setLogging(true);
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`,
                { email: authData.email, password: authData.password },
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
            login(response?.data?.token);
            navigate('/home');
        } catch (error) {
            setAuthErrors(prevErrors => {
                let updatedErrors = { ...prevErrors };
                const status = error.response?.status;
                if (status === 401) {
                    updatedErrors.password = "Invalid Password";
                } else if (status === 404) {
                    updatedErrors.email = "User not found. Check email";
                } else {
                    updatedErrors.loginError = error.response?.data?.message || "Login failed. Try again.";
                }
                return updatedErrors;
            });
        } finally {
            setLogging(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        validateUsername(authData.regUsername, "regUsername");
        validatePassword(authData.regPassword, "regPassword");
        validateEmail(authData.regEmail, "regEmail");

        // if (Object.values(authErrors).some(error => error !== "")) {
        //     console.log("Fix validation errors before submitting");
        //     return;
        // }

        setRegister(true);
        try {
            await axios.post(`${API_URL}/api/auth/register`,
                { username: authData.regUsername, password: authData.regPassword, email: authData.regEmail },
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
            setSwitch(!switchArticle);
        } catch (error) {
            setAuthErrors(prevErrors => {
                let updatedErrors = { ...prevErrors };
                const status = error.response?.status;
                if (status === 409) {
                    updatedErrors.regEmail = "User already exists. Change email";
                } else {
                    updatedErrors.registrationError = error.response?.data?.message || "Registration failed. Try again.";
                }
                return updatedErrors;
            });
        } finally {
            setRegister(false);
        }
    };


    return (
        <main className="auth-wrapper">
            <section className="auth-section">
                <article className={`auth-container ${switchArticle ? "" : "switch"} login`}>
                    <h2>Login</h2>
                    <div className="auth-field">
                        <label htmlFor="email">Username</label>
                        <div className="input-wrapper">
                            <EmailIcon className="auth-icons" />
                            <input type="email" id="email" name='email' autoComplete='off' className="input-field" placeholder="Enter your email" required onChange={handleChange} onBlur={() => handleBlur("email")} />
                        </div>
                        <p className="error-message">{authErrors.email}</p>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <LockIcon className="auth-icons" />
                            <input type={showPassword ? "text" : "password"} id="password" name="password" autoComplete='off'
                                onChange={handleChange} onBlur={() => handleBlur("password")} className="input-field" placeholder="Enter your password" required />
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} onClick={() => setShowPassword(!showPassword)} />
                        </div>
                        <p className="error-message">{authErrors.password}</p>
                    </div>

                    {loggingIn ?
                        <div className="animate-bar">
                            <span className='dots'></span>
                            <span className='dots'></span>
                            <span className='dots'></span>
                        </div>
                        :
                        <button type="submit" className="blue-button" onClick={handleLogin}>Sign In</button>
                    }
                    <p className="switch-text" onClick={() => setSwitch(!switchArticle)}>Don't have an account? Register</p>
                </article>

                <article className={`auth-container ${switchArticle ? "switch" : ""} register`}>
                    <h2>Register</h2>
                    <div className="auth-field">
                        <label htmlFor="reg-username">Full Name</label>
                        <div className="input-wrapper">
                            <PersonIcon className="auth-icons" />
                            <input type="text" id="reg-username" autoComplete='off' name="regUsername" className="input-field" onChange={handleChange} placeholder="Enter your username" onBlur={() => handleBlur("regUsername")} required />
                        </div>
                        <p className="error-message">{authErrors.regUsername}</p>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="reg-email">Email</label>
                        <div className="input-wrapper">
                            <EmailIcon className="auth-icons" />
                            <input type="email" id="reg-email" name='regEmail' autoComplete='off' className="input-field" placeholder="Enter your email" required onChange={handleChange} onBlur={() => handleBlur("regEmail")} />
                        </div>
                        <p className="error-message">{authErrors.regEmail}</p>
                    </div>

                    {/* <div className="auth-field">
                        <label htmlFor="number">Mobile</label>
                        <div className="input-wrapper">
                            <PhoneIcon className="auth-icons" />
                            <input type="tel" id="number" className="input-field" placeholder="Enter your Mobile Number" required />
                        </div>
                        <p className="error-message">Password must be 8-24 characters long</p>
                    </div> */}

                    <div className="auth-field">
                        <label htmlFor="reg-password">Password</label>
                        <div className="input-wrapper">
                            <LockIcon className="auth-icons" />
                            <input type="text" id="reg-password" autoComplete='off' name="regPassword" placeholder='Enter your password' className="input-field" onChange={handleChange} onBlur={() => handleBlur("regPassword")} />
                            <FontAwesomeIcon
                                className="auth-icons"
                                icon={showRegPassword ? faEyeSlash : faEye}
                                onClick={() => setShowRegPassword(!showRegPassword)}
                                style={{ cursor: "pointer" }}
                            />
                        </div>
                        <p className="error-message">{authErrors.regPassword}</p>
                    </div>
                    {isRegistering ?
                        <div className="animate-bar">
                            <span className='dots'></span>
                            <span className='dots'></span>
                            <span className='dots'></span>
                        </div>
                        :
                        <button type="submit" className="blue-button" onClick={handleRegister}>Register</button>}
                    <p className="switch-text" onClick={() => setSwitch(!switchArticle)}>Already have an account? Login</p>
                </article>
            </section>
        </main>
    );
};

export default AuthPage;