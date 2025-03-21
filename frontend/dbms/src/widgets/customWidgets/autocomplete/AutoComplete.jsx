import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import './autocomplete.css';
import PropTypes from "prop-types";

const AutoComplete = ({ selectedValue, options, onChange, placeholder, customStyles }) => {

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
    };
    useEffect(() => {
        if (dropRef.current) {
            const rect = dropRef.current.getBoundingClientRect();
            setStyle({
                top: rect.bottom,
                left: rect.left,
                width: rect.width,
                overflowX: "hidden",
            });
        }
    }, [isDropdown, selectedValue, options]);
    const handleInputChange = (e) => {
        onChange(e);
    };
    const handleOptionSelect = (selectedValue) => {
        onChange({ target: { value: selectedValue } });
        setIsDropdown(false);
    };

    return (
        <div className="autocomplete-container" ref={dropRef} style={customStyles?.container}>
            <div
                className={`table-autocomplete ${isDropdown ? "active" : ""}`}
                onClick={handleDropdown}
                style={customStyles?.dropdown}
            >
                <textarea
                    type="text"
                    placeholder={placeholder}
                    value={selectedValue}
                    onChange={handleInputChange}
                    className="table-drop-textarea"
                    style={customStyles?.input}
                ></textarea>
                {isDropdown ? (
                    <FontAwesomeIcon icon={faCaretUp} className="dropdown-icon" style={customStyles?.icon} />
                ) : (
                    <FontAwesomeIcon icon={faCaretDown} className="dropdown-icon" style={customStyles?.icon} />
                )}
            </div>
            <ul style={{ ...styles, ...customStyles?.list }} className={`auto-dropdown-list ${isDropdown ? "active" : ""}`}>
                {options.map((item, index) => (
                    <li
                        key={`${item}_${index}`}
                        className="auto-dropdown-list-item"
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

AutoComplete.propTypes = {
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

export default AutoComplete