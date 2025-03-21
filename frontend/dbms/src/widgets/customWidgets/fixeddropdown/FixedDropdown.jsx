import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect } from "react";
import './FixedDropdown.css';
import PropTypes from "prop-types";

const FixedDropdown = ({ selectedValue, options, onChange, placeholder, customStyles }) => {
    const [styles, setStyle] = useState({});
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
        if (!isDropdown && dropRef.current) {
            const rect = dropRef.current.getBoundingClientRect();
            setStyle({
                top: rect.bottom + 3,
                left: rect.left,
                width: rect.width,
                overflowX: "hidden",
            });
        }
    };
    const handleOptionSelect = (selectedValue) => {
        onChange({ target: { value: selectedValue } });
        setIsDropdown(false);
    };

    return (
        <div ref={dropRef} className={`fixed-dropdown-container ${isDropdown ? "active" : ""}`} style={customStyles?.container}>
            <div
                className="fixed-drop" 
                onClick={handleDropdown}
                style={customStyles?.dropdown}
            >
                <input
                    type="text"
                    placeholder={placeholder}
                    value={selectedValue}
                    readOnly
                    className="fixed-drop-input"
                    style={customStyles?.input}
                />
                {isDropdown ? (
                    <FontAwesomeIcon icon={faCaretUp} className="dropdown-icon" style={customStyles?.icon} />
                ) : (
                    <FontAwesomeIcon icon={faCaretDown} className="dropdown-icon" style={customStyles?.icon} />
                )}
            </div>
            <ul style={{ ...styles, ...customStyles?.list }} className={`fixed-dropdown-list ${isDropdown ? "active" : ""}`}>
                {options.map((item, index) => (
                    <li
                        key={`${item}_${index}`}
                        className="fixed-dropdown-list-item"
                        onClick={() => handleOptionSelect(item)}
                        style={customStyles?.listItem}
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
};

FixedDropdown.propTypes = {
    selectedValue: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
    customStyles: PropTypes.shape({
        container: PropTypes.object,
        dropdown: PropTypes.object,
        input: PropTypes.object,
        icon: PropTypes.object,
        list: PropTypes.object,
        listItem: PropTypes.object,
    }),
};

export default FixedDropdown;