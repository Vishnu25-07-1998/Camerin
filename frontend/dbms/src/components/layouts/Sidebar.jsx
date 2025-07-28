import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import StorageIcon from '@mui/icons-material/Storage';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';
import styles from './sidebar.module.css';

const Sidebar = () => {
    const location = useLocation();
    const [active, setActive] = useState(location.pathname);
    const { authState, logout } = useContext(AuthContext);
    const navigate = useNavigate();


    return (
        <aside className={styles['primary-sidebar']}>
            <ul className={styles["primary-sidebar-menu"]}>
                <li className={`${styles['primary-sidebar-item']} ${location.pathname.includes("/home") ? styles.active : ""}`}>
                    <Link to="/home" className={styles["primary-sidebar-link"]}>
                        <HomeIcon className={styles["primary-sidebar-icon"]} />
                        <p className={styles["menu-text"]}>Home</p>
                    </Link>
                </li>
                <li className={`${styles['primary-sidebar-item']} ${location.pathname.includes("/dashboard") ? styles.active : ""}`}>
                    <Link to="/dashboard" className={styles["primary-sidebar-link"]}>
                        <SpaceDashboardIcon className={styles["primary-sidebar-icon"]} />
                        <p className={styles["menu-text"]}>Dashboard</p>
                    </Link>
                </li>
                <li className={`${styles['primary-sidebar-item']} ${location.pathname === "/connections" ? styles.active : ""}`}>
                    <Link to="/connections" className={styles["primary-sidebar-link"]}>
                        <StorageIcon className={styles["primary-sidebar-icon"]} />
                        <p className={styles["menu-text"]}>Connections</p>
                    </Link>
                </li>
                <li className={`${styles['primary-sidebar-item']} ${location.pathname === "/settings" ? styles.active : ""}`}>
                    <Link to="/settings" className={styles["primary-sidebar-link"]}>
                        <SettingsIcon className={styles["primary-sidebar-icon"]} />
                        <p className={styles["menu-text"]}>Settings</p>
                    </Link>
                </li>
            </ul>
        </aside>
    )
}

export default Sidebar