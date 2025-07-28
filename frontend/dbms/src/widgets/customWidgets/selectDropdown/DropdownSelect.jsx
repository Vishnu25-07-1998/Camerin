import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import styles from './dropdown.module.css';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';

const DropdownSelect = ({ selectedValue, options, onChange, customStyles }) => {

    const API_URL = import.meta.env.VITE_API_URL;
    const { authState } = useContext(AuthContext);
    const [isDropdown, setIsDropdown] = useState(false);
    const dropRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropRef.current && !dropRef.current.contains(event.target)) {
                setIsDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    useEffect(() => {
        if (isDropdown) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }

        return () => {
            document.body.classList.remove("no-scroll");
        };
    }, [isDropdown]);

    const handleDropdown = () => {
        setIsDropdown(!isDropdown);
    };
    const handleOptionSelect = (selectedValue) => {
        onChange({ target: { value: selectedValue } });
        setIsDropdown(false);
    };
    const onDelete = async (e, selectedItem) => {
        e.stopPropagation();
        console.log('header', authState.token);
        try {
            const response = await axios.delete(
                `${API_URL}/api/databaseAnalyticsRoute/delEntity`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authState.token}`,
                    },
                    data: { selectedItem },
                }
            );
            console.log('Delete response:', response.data);
        } catch (error) {
            console.error('Error in fetching Outs:', error.response?.data || error.message);
        }

    }
    return (
        <div ref={dropRef} className={`${styles['custom-dropdown-container']} ${isDropdown ? styles.active : ''}`} style={customStyles?.container} onClick={handleDropdown}>
            <span className={styles.selectedText}>{selectedValue || 'Select output files'}</span>
            {isDropdown ? (
                <FontAwesomeIcon icon={faCaretUp} className={styles["dropdown-icon"]} style={customStyles?.icon} />
            ) : (
                <FontAwesomeIcon icon={faCaretDown} className="dropdown-icon" style={customStyles?.icon} />
            )}
            <ul style={customStyles?.list} className={`${styles['custom-dropdown-list']} ${isDropdown ? styles.active : ""}`}>
                {options.map((item, index) => (
                    <li
                        key={`${item}_${index}`}
                        className={`${styles['custom-dropdown-list-item']} ${selectedValue === item ? styles.active : ''}`}
                        style={customStyles?.listItem}
                    >
                        <DeleteIcon className={styles.DeleteIcon} onClick={(e) => onDelete(e, item)} />
                        <span className={styles.listText} onClick={() => handleOptionSelect(item)}>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default DropdownSelect