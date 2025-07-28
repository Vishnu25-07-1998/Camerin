import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect } from "react";
import styles from './customSelect.module.css';
import PropTypes from "prop-types";

const CustomSelect = ({ selectedValue, options, onChange, placeholder, customStyles }) => {
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
    return (
        <div className={`${styles.dropDownContainer} ${isDropdown ? styles.active : ""}`}  ref={dropRef} style={customStyles?.container}>
            <span className={styles.selectedText} onClick={handleDropdown} >{selectedValue || placeholder}</span>
            {isDropdown ? (
                <FontAwesomeIcon icon={faCaretUp} className={styles.dropDownIcon} style={customStyles?.icon} />
            ) : (
                <FontAwesomeIcon icon={faCaretDown} className={styles.dropDownIcon} style={customStyles?.icon} />
            )}
            <ul style={customStyles?.list} className={`${styles.dropDownLists} ${isDropdown ? styles.active : ""}`}>
                {options.map((item, index) => (
                    <li
                        key={`${item}_${index}`}
                        className={`${styles.listItem} ${selectedValue === item ? styles.active : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOptionSelect(item);
                        }}
                        style={customStyles?.listItem}
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default CustomSelect