import { useState, useEffect, useRef, useContext } from 'react';
import styles from './headers.module.css';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import SearchIcon from '@mui/icons-material/Search';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const Navbar = ({ category, items, components, onItemClick }) => {

    const [showDropdown, setDropdown] = useState(false);
    const projectDetails = useSelector((state) => state.dbms.projectDetails);
    const location = useLocation();
    const selectRef = useRef(null);

    const handleDropdown = () => {
        setDropdown(prevState => !prevState);
    }
    const handleClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
            setDropdown(false);
        }
    };
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const handleItemClick = (item) => {
        onItemClick(item);
        setDropdown(false);
        window.location.reload();
    }


    return (
        <header className={styles.header}>
            <div className={styles.mainLogo}>
                <h2>DBMS</h2>
            </div>
            <nav className={styles.navBar}>
                <div className={styles.navLinks}>
                    <Link to="/dashboard" className={styles['breadcrumb-link']}>Dashboard</Link>
                    <span>&gt;</span>
                    <Link className={styles['breadcrumb-current']} reloadDocument>{category}</Link>
                </div>
                <div className={styles.navLinks}>
                    <Link className={styles['breadcrumb-current']}>{projectDetails.projectName}</Link>
                    <span>&gt;</span>
                    <Link className={styles['breadcrumb-current']}>{projectDetails.groupName}</Link>
                </div>
                <div className={styles["search-modules-wrapper"]} ref={selectRef} >
                    <div className={styles.searchBar} onClick={handleDropdown}>
                        <SearchIcon className={styles.searchIcon} />
                        <input type="text" placeholder='Select Modules' value={components} className={styles["search-bar-module-input-box"]} readOnly />
                    </div>
                    {showDropdown && <ul className={styles["module-search-list"]}>
                        {items.map((item, index) => (
                            <li key={index} className={`${styles["module-searchList-item"]} ${components === item ? styles.active : ""}`} onClick={() => handleItemClick(item)} >{item}</li>
                        ))}
                    </ul>}
                </div>
            </nav>
        </header>
    )
}

export default Navbar