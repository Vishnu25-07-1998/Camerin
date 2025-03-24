import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState, useEffect, useRef, useContext } from 'react';
import ProfileAvatar from '../../assets/profile/ProfileAvatar.jpg';
import SearchIcon from '@mui/icons-material/Search';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { AuthContext } from '../../context/AuthContext';
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";

const Headers = () => {
    const [showDropdown, setDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const location = useLocation();
    const [active, setActive] = useState(location.pathname);
    const selectRef = useRef(null);
    const { authState, logout } = useContext(AuthContext);
    const navigate = useNavigate();

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


    return (
        <header className="header">
            <div className="main-logo">
                <h2>DBMS</h2>
            </div>
            <nav className="nav-bar">
                <div className="search-wrapper" ref={selectRef}>
                    <div className="search-bar" onClick={handleDropdown}>
                        <SearchIcon className='search-icon' />
                        <input type="text" placeholder='Google Your DB Menu' value={searchQuery} onChange={handleChange} />
                    </div>
                    {showDropdown && <ul className="search-list">
                        {filteredItems.map((item, index) => (
                            <li key={index} className='searchList-item' onClick={() => handleItemClick(item)} >{item}</li>
                        ))}
                    </ul>}
                </div>
                <div className="nav-links">
                    <NotificationsIcon />
                    <div className="profile-container">
                        <img src={ProfileAvatar} alt="Profile" className="avatar" />
                        <div className="welcome-text">
                            <span>Welcome</span>
                            <strong>{authState?.user?.username}</strong>
                        </div>
                        <UnfoldMoreIcon style={{ cursor: "pointer" }} />
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Headers