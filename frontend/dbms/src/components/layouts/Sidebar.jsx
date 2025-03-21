import './sidebar.css';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import StorageIcon from '@mui/icons-material/Storage';
import { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const [active, setActive] = useState(location.pathname);
    const { authState, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleItemClick = (item) => {
        setSearchQuery(item);
        setDropdown(false);
        switch (item) {
            case "Database Analytics":
                navigate("/dashboard/db-analytics");
                break;
            case "High Level Design/Mapping":
                navigate("/dashboard/highLevel");
                break;
            default:
                break;
        }
    }

    const handleLogout = () => {
        logout();
        navigate('/sign');
    }

    return (
        <aside className="module-sidebar">
            <ul className="sidebar-menu">
                <li className={`sidebar-item ${location.pathname.includes("/dashboard") ? "active" : ""}`}>
                    <Link to="/dashboard" className="sidebar-link">
                        <SpaceDashboardIcon className="sidebar-icon" />
                        <p className="menu-text">Dashboard</p>
                    </Link>
                </li>
                <li className={`sidebar-item ${location.pathname === "/connections" ? "active" : ""}`}>
                    <Link to="/connections" className="sidebar-link">
                        <StorageIcon className="sidebar-icon" />
                        <p className="menu-text">Connections</p>
                    </Link>
                </li>
            </ul>
            <button className='module-btn' onClick={handleLogout}>Log Out</button>
        </aside>
    )
}

export default Sidebar