import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect } from "react";
import './customSelect.css';
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
        <div ref={dropRef} className={`custom-dropdown-container ${isDropdown ? "active" : ""}`} style={customStyles?.container}>
            <div
                className="custom-drop"
                onClick={handleDropdown}
                style={customStyles?.dropdown}
            >
                <input
                    type="text"
                    placeholder={placeholder}
                    value={selectedValue}
                    readOnly
                    className="custom-drop-input"
                    style={customStyles?.input}
                />
                {isDropdown ? (
                    <FontAwesomeIcon icon={faCaretUp} className="dropdown-icon" style={customStyles?.icon} />
                ) : (
                    <FontAwesomeIcon icon={faCaretDown} className="dropdown-icon" style={customStyles?.icon} />
                )}
            </div>
            <ul style={customStyles?.list} className={`custom-dropdown-list ${isDropdown ? "active" : ""}`}>
                {options.map((item, index) => (
                    <li
                        key={`${item}_${index}`}
                        className="custom-dropdown-list-item"
                        onClick={() => handleOptionSelect(item)}
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