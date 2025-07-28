import styles from './home.module.css';
import AddIcon from '@mui/icons-material/Add';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import ModalHome from '../../components/modals/home/ModalHome';
import { useSelector, useDispatch } from 'react-redux';
import { setModalScreen } from '../../store/dbSlice';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import SelectProject from '../../components/modals/home/SelectProject';

const Home = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const modalScreen = useSelector((state) => state.dbms.modalScreen);
  const dispatch = useDispatch();
  const { authState } = useContext(AuthContext);

  const [projectDir, setProjectDir] = useState({});
  const [projectFolder, setProjectFolder] = useState({
    projectName: '',
    groupName: '',
    moduleName: '',
  });
  const [menuList, setMenu] = useState(false);

  const handleAddClick = () => {
    dispatch(setModalScreen(true));
  };

  const getProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/datasourceroute/getProjects`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
      });
      setProjectDir(response.data || {});
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    getProjects();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.iconBox} onClick={handleAddClick}>
        <AddIcon fontSize="large" />
        <span className={styles.tooltip}>New Project</span>
      </div>

      <div className={styles.iconBox} onClick={() => setMenu(!menuList)}>
        <BackupTableIcon fontSize="large" />
        <span className={styles.tooltip}>Select Projects</span>
      </div>
      {menuList && <SelectProject projectDir={projectDir} setMenu={setMenu} />}
      {modalScreen && <ModalHome projectFolder={projectFolder} setProjectFolder={setProjectFolder} />}
    </div>
  );
};

export default Home;