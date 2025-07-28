import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect } from "react";
import CheckIcon from '@mui/icons-material/Check';
import PropTypes from "prop-types";
import styles from './multiselect.module.css';

const MultiSelect = ({ selectedValue, options, onChange, placeholder, customStyles }) => {
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
    const handleOptionSelect = (value) => {
        const isAlreadySelected = selectedValue.includes(value);
        const updatedSelection = isAlreadySelected
            ? selectedValue.filter((item) => item !== value)
            : [...selectedValue, value];
        onChange({ target: { value: updatedSelection } });
    };
    const displayText = selectedValue.length > 0 ? selectedValue.join(', ') : "";
    return (
        <div ref={dropRef} className={`${styles['multi-dropdown-container']} ${isDropdown ? styles.active : ""}`} style={customStyles?.container}>
            <span className={styles.selectedText} onClick={handleDropdown} >{displayText || placeholder}</span>
            {isDropdown ? (
                <FontAwesomeIcon icon={faCaretUp} className={styles.dropdownIcon} style={customStyles?.icon} />
            ) : (
                <FontAwesomeIcon icon={faCaretDown} className={styles.dropdownIcon} style={customStyles?.icon} />
            )}
            <ul style={customStyles?.list} className={`${styles.dropdownList} ${isDropdown ? styles.active : ""}`}>
                {options.map((item, index) => {
                    const isSelected = selectedValue.includes(item);
                    return (
                        <li
                            key={`${item}_${index}`}
                            className={`${styles.listItem} ${isSelected ? styles.active : ''}`}
                            onClick={() => handleOptionSelect(item)}
                            style={customStyles?.listItem}
                        >
                            <span className={styles.checkBox}>{isSelected && <CheckIcon className={styles.checkIcon} />}</span>
                            <span className="listText">{item}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    )
}

export default MultiSelect