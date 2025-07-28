import styles from '../modal.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { updateProjectDetails, setModalScreen } from '../../../store/dbSlice';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { useContext } from 'react';
import { useNavigate } from "react-router-dom";

const ModalHome = ({ projectFolder, setProjectFolder }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const { authState } = useContext(AuthContext);
    const navigate = useNavigate();
    const projectDetails = useSelector((state) => state.dbms.projectDetails);
    const dispatch = useDispatch();
    // const handleChange = (e) => {
    //     dispatch(updateProjectDetails({ field: e.target.name, value: e.target.value }));
    // };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProjectFolder((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const options = [
        'Database Analytics', 'User Story', 'DB Compare', 'High Level Design/Mapping', 'Low Level Design',
        'Data Flow Diagram', 'Code Development', 'Create Test Data', 'Create Test Cases', 'Reconciliation'
    ];
    const navigateModule = () => {
        switch (projectFolder.moduleName) {
            case "Database Analytics":
                navigate("/db-analytics");
                break;
            case "DB Compare":
                navigate("/dbCompare");
                break;
            case "High Level Design/Mapping":
                navigate("/highLevel");
                break;
            default:
                console.warn("No route found for selected module");
                break;
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        Object.keys(projectFolder).forEach((key) => {
            dispatch(updateProjectDetails({ field: key, value: projectFolder[key] }));
        });
        dispatch(setModalScreen(false));
        navigateModule();
        // try {
        //     const response = await axios.post(
        //         `${API_URL}/datasourceroute/projectDetails`,
        //         projectDetails,
        //         {
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 Authorization: `Bearer ${authState.token}`,
        //             },
        //         }
        //     );
        //     dispatch(setModalScreen(false));
        //     navigateModule();
        // } catch (error) {
        //     console.error('Submission failed:', error);
        // }
    };
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.homeContent}>
                <button onClick={() => dispatch(setModalScreen(false))} className={styles.closeModal}>
                    X
                </button>
                <div className={styles.formGroup}>
                    <label htmlFor="projectName" className={styles.formLabel}>Project Name</label>
                    <input
                        type="text"
                        id="projectName"
                        name="projectName"
                        className={styles.inputField}
                        placeholder="Enter project name"
                        value={projectFolder['projectName']}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="groupName" className={styles.formLabel}>Group Name</label>
                    <input
                        type="text"
                        id="groupName"
                        name="groupName"
                        className={styles.inputField}
                        placeholder="Enter group name"
                        value={projectFolder['groupName']}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="moduleName" className={styles.formLabel}>Module Name</label>
                    <select
                        id="moduleName"
                        name="moduleName"
                        className={styles.selectField}
                        value={projectFolder['moduleName']}
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select a module</option>
                        {options.map((item, index) => (
                            <option key={index} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}><button className={styles.primarybtn} onClick={handleSubmit}>Submit</button></div>

            </div>
        </div>
    )
}

export default ModalHome