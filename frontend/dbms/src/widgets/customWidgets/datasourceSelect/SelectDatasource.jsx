import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect } from "react";
import PropTypes from 'prop-types';
import './selectDatasource.css';

const SelectDatasource = ({icon, selectedValue, placeholder, options, onChange, customStyles}) => {
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
        <div ref={dropRef} className="select-datasources" style={customStyles?.container}>
            <div
                className={`selected-box ${isDropdown ? "active" : ""}`}
                onClick={handleDropdown}
            >
                <img src={icon} alt="datasources" className='dbIcon' />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={selectedValue}
                    readOnly
                    className="box-input"
                />
                {isDropdown ? (
                    <FontAwesomeIcon icon={faCaretUp} className='arrow-icon' />
                ) : (
                    <FontAwesomeIcon icon={faCaretDown} className='arrow-icon' />
                )}
            </div>
            <ul style={styles} className={`dropdown-list ${isDropdown ? "active" : ""}`}>
                {options.map((item, index) => (
                    <li
                        key={`${item}_${index}`}
                        className="dropdown-list-item"
                        onClick={() => handleOptionSelect(item)}
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}

SelectDatasource.propTypes = {
    icon: PropTypes.string.isRequired,
    selectedValue: PropTypes.string.isRequired, 
    placeholder: PropTypes.string, 
    options: PropTypes.arrayOf(PropTypes.string).isRequired, 
    onChange: PropTypes.func.isRequired,
}

export default SelectDatasource
