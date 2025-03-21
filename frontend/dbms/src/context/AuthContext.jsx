import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {jwtDecode} from 'jwt-decode'; 

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        token: localStorage.getItem('token'),
        user: null,
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const isExpired = decodedToken.exp * 1000 < Date.now();

                if (!isExpired) {
                    setAuthState({ token, user: decodedToken });
                } else {
                    logout(); 
                }
            } catch (error) {
                console.error("Token decoding failed:", error);
                logout();
            }
        }
    }, []);

    const login = (token) => {
        try {
            localStorage.setItem('token', token);
            const decodedToken = jwtDecode(token);
            setAuthState({ token, user: decodedToken });
        } catch (error) {
            console.error("Error logging in:", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setAuthState({ token: null, user: null });
    };

    return (
        <AuthContext.Provider value={{ authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { AuthContext, AuthProvider };