import styles from './settings.module.css';
import EditIcon from '@mui/icons-material/Edit';
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const Settings = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const { authState } = useContext(AuthContext);
    const SECTION_NAMES = {
        DISTINCT_LEN: 'distinctLength',
        DISTINCT_VALS: 'distinctValues',
        SUBSTR_CONCAT_COLS: 'substrConcatColumns',
        SUBSTR_CONCAT_Ent: 'substrConcatAllEntities',
        EQUAL_COLS: 'equalColumns',
        CHAR_EACH: 'columnCharEachCount',
        UNIQUE_KEYS: 'uniqueKeys',
    };
    // initialFormData grouped by section
    const initialFormData = {
        /* ── Distinct column length ───────────────────────────── */
        [SECTION_NAMES.DISTINCT_LEN]: {
            distinctCount: 1000,
        },
        [SECTION_NAMES.DISTINCT_VALS]: {
            distinctCount: 1000,
        },
        [SECTION_NAMES.SUBSTR_CONCAT_COLS]: {
            distinctCount: 1000,
        },
        [SECTION_NAMES.EQUAL_COLS]: {
            distinctCount: 50,
        },

        /* ── Column‑char‑each‑count section ───────────────────── */
        [SECTION_NAMES.CHAR_EACH]: {
            distinctCount: 40,
            maxCharLoop: 50,
        },

        /* ── Substr & Concat (all entities) ───────────────────── */
        [SECTION_NAMES.SUBSTR_CONCAT_Ent]: {
            distinctCount: 50,
            nrowsSource: 60,
            nrowsOtherSource: 80,
        },

        /* ── Unique‑key settings ──────────────────────────────── */
        [SECTION_NAMES.UNIQUE_KEYS]: {
            maxUniqueKeys: 25,
            maxColumnsInKey: 25,
            maxKeyCombosCheck: 100000,
            maxKeyCombosIdentified: 100000,
        },
    };

    const [formData, setFormData] = useState(initialFormData);
    const [editingSection, setEditingSection] = useState(null);
    const initialDataRef = useRef(initialFormData);
    const handleChange = (event, section) => {
        const { name, value } = event.target;
        if (!formData[section]) return;
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: Number(value)
            }
        }));
    };

    const fetchValues = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/datasourceroute/getSettingsData`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authState.token}`,
                },
            });
            const data = response.data.settings;
            if (data && Object.keys(data).length > 0) {
                setFormData(data);
                initialDataRef.current = data;
            }

        }
        catch (error) {
            console.error('Error fetching settings values:', error);
        }
    }

    useEffect(() => {
        fetchValues();
    }, [authState.token])


    const handleCancel = () => {
        setFormData(initialDataRef.current);
        setEditingSection(null);
    };

    const handleSave = async (section) => {
        // Submit or persist form here
        setEditingSection(null);
        const updatedData = { [section]: { ...formData[section] } };
        try {
            const response = await axios.post(`${API_URL}/api/datasourceroute/saveSettings`, { formData: updatedData }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authState.token}`,
                },
            });
        } catch (error) {
            console.error('Error Saving settings values:', error);
        }
    };
    const LegendActions = ({ section }) =>
        editingSection === section ? (
            <span className={styles.settings__actions}>
                <button
                    type="button"
                    className={styles.settings__cancel}
                    onClick={() => handleCancel(section)}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className={styles.settings__save}
                    onClick={() => handleSave(section)}
                >
                    Save
                </button>
            </span>
        ) : (
            <EditIcon
                className={styles.settings__editIcon}
                onClick={() => setEditingSection(section)}
            />
        );
    return (
        <section className={styles.settings}>
            <form className={styles.settings__form}>
                {/* ========= DISTINCT LENGTH ========= */}
                <fieldset
                    className={styles.settings__fieldset}
                    disabled={editingSection !== SECTION_NAMES.DISTINCT_LEN}
                >
                    <legend className={styles.settings__legend}>
                        Distinct Column Length <LegendActions section={SECTION_NAMES.DISTINCT_LEN} />
                    </legend>
                    <div className={styles.settings__inputGroup}>
                        <label htmlFor="distinctCount1">Count of distinct values per column</label>
                        <input
                            type="number"
                            id="distinctCount1"
                            name="distinctCount"
                            value={formData[SECTION_NAMES.DISTINCT_LEN].distinctCount}
                            onChange={(e) => handleChange(e, SECTION_NAMES.DISTINCT_LEN)}
                        />
                    </div>
                </fieldset>

                {/* ========= DISTINCT VALUES ========= */}
                <fieldset
                    className={styles.settings__fieldset}
                    disabled={editingSection !== SECTION_NAMES.DISTINCT_VALS}
                >
                    <legend className={styles.settings__legend}>
                        Distinct Column Values <LegendActions section={SECTION_NAMES.DISTINCT_VALS} />
                    </legend>
                    <div className={styles.settings__inputGroup}>
                        <label htmlFor="distinctCount2">Count of distinct values per column</label>
                        <input
                            type="number"
                            id="distinctCount2"
                            name="distinctCount"
                            value={formData[SECTION_NAMES.DISTINCT_VALS].distinctCount}
                            onChange={(e) => handleChange(e, SECTION_NAMES.DISTINCT_VALS)}
                        />
                    </div>
                </fieldset>

                {/* ========= SUBSTR & CONCAT COLUMNS ========= */}
                <fieldset
                    className={styles.settings__fieldset}
                    disabled={editingSection !== SECTION_NAMES.SUBSTR_CONCAT_COLS}
                >
                    <legend className={styles.settings__legend}>
                        Substr &amp; Concat Columns{' '}
                        <LegendActions section={SECTION_NAMES.SUBSTR_CONCAT_COLS} />
                    </legend>
                    <div className={styles.settings__inputGroup}>
                        <label htmlFor="distinctCount3">Count of distinct values per column</label>
                        <input
                            type="number"
                            id="distinctCount3"
                            name="distinctCount"
                            value={formData[SECTION_NAMES.SUBSTR_CONCAT_COLS].distinctCount}
                            onChange={(e) => handleChange(e, SECTION_NAMES.SUBSTR_CONCAT_COLS)}
                        />
                    </div>
                </fieldset>

                {/* ========= EQUAL COLUMNS ========= */}
                <fieldset
                    className={styles.settings__fieldset}
                    disabled={editingSection !== SECTION_NAMES.EQUAL_COLS}
                >
                    <legend className={styles.settings__legend}>
                        Equal Columns <LegendActions section={SECTION_NAMES.EQUAL_COLS} />
                    </legend>
                    <div className={styles.settings__inputGroup}>
                        <label htmlFor="distinctCount4">Count of distinct values per column</label>
                        <input
                            type="number"
                            id="distinctCount4"
                            name="distinctCount"
                            value={formData[SECTION_NAMES.EQUAL_COLS].distinctCount}
                            onChange={(e) => handleChange(e, SECTION_NAMES.EQUAL_COLS)}
                        />
                    </div>
                </fieldset>

                {/* ========= COLUMN CHAR EACH COUNT ========= */}
                <fieldset
                    className={styles.settings__fieldset}
                    disabled={editingSection !== SECTION_NAMES.CHAR_EACH}
                >
                    <legend className={styles.settings__legend}>
                        Column Char Each Count <LegendActions section={SECTION_NAMES.CHAR_EACH} />
                    </legend>
                    <div className={styles.settings__inputGroup}>
                        <label htmlFor="distinctCount5">Count of distinct values per column</label>
                        <input
                            type="number"
                            id="distinctCount5"
                            name="distinctCount"
                            value={formData[SECTION_NAMES.CHAR_EACH].distinctCount}
                            onChange={(e) => handleChange(e, SECTION_NAMES.CHAR_EACH)}
                        />
                    </div>
                    <div className={styles.settings__inputGroup}>
                        <label htmlFor="maxCharLoop">Max char loop per column</label>
                        <input
                            type="number"
                            id="maxCharLoop"
                            name="maxCharLoop"
                            value={formData[SECTION_NAMES.CHAR_EACH].maxCharLoop}
                            onChange={(e) => handleChange(e, SECTION_NAMES.CHAR_EACH)}
                        />
                    </div>
                </fieldset>

                {/* ========= ROW LIMITS (SUBSTR & CONCAT ALL ENTITIES) ========= */}
                <fieldset
                    className={styles.settings__fieldset}
                    disabled={editingSection !== SECTION_NAMES.SUBSTR_CONCAT_Ent}
                >
                    <legend className={styles.settings__legend}>
                        Substr &amp; Concat All Entities{' '}
                        <LegendActions section={SECTION_NAMES.SUBSTR_CONCAT_Ent} />
                    </legend>
                    <div className={styles.settings__inputGroup}>
                        <label htmlFor="distinctCount6">Count of distinct values per column</label>
                        <input
                            type="number"
                            id="distinctCount6"
                            name="distinctCount"
                            value={formData[SECTION_NAMES.SUBSTR_CONCAT_Ent].distinctCount}
                            onChange={(e) => handleChange(e, SECTION_NAMES.SUBSTR_CONCAT_Ent)}
                        />
                    </div>
                    <div className={styles.settings__inputGroup}>
                        <label htmlFor="nrowsSource">nrows_source_var</label>
                        <input
                            type="number"
                            id="nrowsSource"
                            name="nrowsSource"
                            value={formData[SECTION_NAMES.SUBSTR_CONCAT_Ent].nrowsSource}
                            onChange={(e) => handleChange(e, SECTION_NAMES.SUBSTR_CONCAT_Ent)}
                        />
                    </div>
                    <div className={styles.settings__inputGroup}>
                        <label htmlFor="nrowsOtherSource">nrows_other_source_var</label>
                        <input
                            type="number"
                            id="nrowsOtherSource"
                            name="nrowsOtherSource"
                            value={formData[SECTION_NAMES.SUBSTR_CONCAT_Ent].nrowsOtherSource}
                            onChange={(e) => handleChange(e, SECTION_NAMES.SUBSTR_CONCAT_Ent)}
                        />
                    </div>
                </fieldset>

                {/* ========= UNIQUE KEY SETTINGS ========= */}
                <fieldset
                    className={styles.settings__fieldset}
                    disabled={editingSection !== SECTION_NAMES.UNIQUE_KEYS}
                >
                    <legend className={styles.settings__legend}>
                        Unique Key Settings <LegendActions section={SECTION_NAMES.UNIQUE_KEYS} />
                    </legend>
                    <div className={styles.settings__inputGroup}>
                        <label htmlFor="maxUniqueKeys">max_no_of_unique_keys_required</label>
                        <input
                            type="number"
                            id="maxUniqueKeys"
                            name="maxUniqueKeys"
                            value={formData[SECTION_NAMES.UNIQUE_KEYS].maxUniqueKeys}
                            onChange={(e) => handleChange(e, SECTION_NAMES.UNIQUE_KEYS)}
                        />
                    </div>
                    <div className={styles.settings__inputGroup}>
                        <label htmlFor="maxColumnsInKey">max_no_of_columns_in_unique_key</label>
                        <input
                            type="number"
                            id="maxColumnsInKey"
                            name="maxColumnsInKey"
                            value={formData[SECTION_NAMES.UNIQUE_KEYS].maxColumnsInKey}
                            onChange={(e) => handleChange(e, SECTION_NAMES.UNIQUE_KEYS)}
                        />
                    </div>
                    <div className={styles.settings__inputGroup}>
                        <label htmlFor="maxKeyCombosCheck">max_key_combinations_to_be_checked</label>
                        <input
                            type="number"
                            id="maxKeyCombosCheck"
                            name="maxKeyCombosCheck"
                            value={formData[SECTION_NAMES.UNIQUE_KEYS].maxKeyCombosCheck}
                            onChange={(e) => handleChange(e, SECTION_NAMES.UNIQUE_KEYS)}
                        />
                    </div>
                    <div className={styles.settings__inputGroup}>
                        <label htmlFor="maxKeyCombosIdentified">max_key_combinations_identified</label>
                        <input
                            type="number"
                            id="maxKeyCombosIdentified"
                            name="maxKeyCombosIdentified"
                            value={formData[SECTION_NAMES.UNIQUE_KEYS].maxKeyCombosIdentified}
                            onChange={(e) => handleChange(e, SECTION_NAMES.UNIQUE_KEYS)}
                        />
                    </div>
                </fieldset>
            </form>
        </section >
    )
}

export default Settings