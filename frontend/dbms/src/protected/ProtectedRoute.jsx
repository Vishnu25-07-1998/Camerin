import { AuthContext } from "../context/AuthContext";
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';


const ProtectedRoute = ({ children }) => {
    const { authState } = useContext(AuthContext);
    if (!authState.token) {
        return <Navigate to="/sign" replace />;
    }
    return children;
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ProtectedRoute