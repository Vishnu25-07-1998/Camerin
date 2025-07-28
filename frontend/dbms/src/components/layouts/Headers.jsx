import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState, useEffect, useRef, useContext } from 'react';
import ProfileAvatar from '../../assets/profile/ProfileAvatar.jpg';
import SearchIcon from '@mui/icons-material/Search';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { AuthContext } from '../../context/AuthContext';
import styles from './headers.module.css';
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { resetState } from '../../store/dbSlice';

const Headers = () => {
    const [showDropdown, setDropdown] = useState(false);
    const projectDetails = useSelector((state) => state.dbms.projectDetails);
    const [searchQuery, setSearchQuery] = useState("");
    const [menuList, setMenu] = useState(false);
    const location = useLocation();
    const [active, setActive] = useState(location.pathname);
    const selectRef = useRef(null);
    const { authState, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const items = [
        'Database Analytics',
        'User Story',
        'High Level Design/Mapping',
        'Low Level Design',
        'Data Flow Diagram',
        'Code Development',
        'Create Test Data',
        'Create Test Cases'
    ];
    const filteredItems = items.filter(item =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const handleChange = (e) => {
        setSearchQuery(e.target.value);
        setDropdown(true);
    }
    const handleDropdown = () => {
        setDropdown(prevState => !prevState);
    }
    const handleClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
            setDropdown(false);
        }
    };

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
            case "User Story":
                navigate("/dashboard/userStory");
                break;
            case "Create Test Data":
                navigate("/create-test-data");
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        dispatch(resetState());
        logout();
        navigate('/sign');
    }


    return (
        <header className={styles.header}>
            <div className={styles.mainLogo}>
                <h2>DBMS</h2>
            </div>
            <nav className={styles.navBar}>
                <div className={styles.navLinks}>
                    <Link className={styles['breadcrumb-current']}>{projectDetails.projectName}</Link>
                    <span>&gt;</span>
                    <Link className={styles['breadcrumb-current']}>{projectDetails.groupName}</Link>
                </div>
                <div className={styles.navLinks}>
                    <NotificationsIcon />
                    <div className={styles.profileContainer}>
                        <img src={ProfileAvatar} alt="Profile" className={styles.profileAvatar} />
                        <div className={styles.welcomeText}>
                            <span>Welcome</span>
                            <strong style={{ fontSize: "16px" }}>{authState?.user?.username}</strong>
                            {menuList && (
                                <ul className={styles.menuList}>
                                    <li className={styles.listItem}>Profile</li>
                                    <li className={styles.listItem} onClick={handleLogout}>Log Out</li>
                                </ul>
                            )}
                        </div>
                        <UnfoldMoreIcon style={{ cursor: "pointer" }} onClick={() => setMenu(!menuList)} />
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Headers