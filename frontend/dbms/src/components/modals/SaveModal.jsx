import React, { useState } from 'react';
import styles from './SaveModal.module.css'; // Make sure this CSS module exists

const SaveModal = () => {
    const [selectedOption, setSelectedOption] = useState('');

    const handleChange = (e) => {
        setSelectedOption(e.target.value);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.processingModal}>
                <span>Do you want to save it?</span>
                <div className={styles.radioGroup}>
                    <label>
                        <input
                            type="radio"
                            name="saveOption"
                            value="yes"
                            checked={selectedOption === 'yes'}
                            onChange={handleChange}
                        />
                        Yes
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="saveOption"
                            value="no"
                            checked={selectedOption === 'no'}
                            onChange={handleChange}
                        />
                        No
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SaveModal;