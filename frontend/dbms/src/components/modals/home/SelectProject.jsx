import styles from '../modal.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { updateProjectDetails } from '../../../store/dbSlice';
import { useContext, useState } from 'react';

const SelectProject = ({ setMenu, projectDir }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const projectDetails = useSelector((state) => state.dbms.projectDetails);
    const dispatch = useDispatch();
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(updateProjectDetails({ field: 'projectName', value: selectedProject }));
        dispatch(updateProjectDetails({ field: 'groupName', value: selectedGroup }));
        setMenu(false);
    };
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.homeContent}>
                <button onClick={() => setMenu(false)} className={styles.closeModal}>
                    X
                </button>
                <div className={styles.formGroup}>
                    <label htmlFor="moduleName" className={styles.formLabel}>Project Name</label>
                    <select
                        id="projectName"
                        name="projectName"
                        className={styles.selectField}
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                    >
                        <option value="" disabled>Select Project</option>
                        {Object.keys(projectDir).map((projectName) => (
                            <option key={projectName} value={projectName}>
                                {projectName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="moduleName" className={styles.formLabel}>Goup Name</label>
                    <select
                        id="groupName"
                        name="groupName"
                        className={styles.selectField}
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                    >
                        <option value="" disabled>Select Group</option>
                        {selectedProject && projectDir[selectedProject].map((groupName, idx) => (
                            <option key={idx} value={groupName}>
                                {groupName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}><button className={styles.primarybtn} onClick={handleSubmit}>Submit</button></div>

            </div>
        </div>
    )
}

export default SelectProject