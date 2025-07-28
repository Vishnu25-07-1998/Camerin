import { Link, useLocation } from "react-router-dom";
import styles from './dashboard.module.css';

const Dashboard = () => {

    const location = useLocation();

    return (
        <div className={styles["navigation-link-buttons"]}>
            <Link to="/db-analytics/basicDetails" className={styles["link-button"]}>Database Analytics</Link>
            <Link to="/dataAnomaly" className={styles["link-button"]}>Data Anomaly</Link>
            <Link to="#" className={styles["link-button"]}>Data Cleansing</Link>
            <Link to="/dbCompare" className={styles["link-button"]}>DB Compare</Link>
            <Link to="/highLevel" className={styles["link-button"]}>High Level Design/Mapping</Link>
            <Link to="" className={styles["link-button"]}>Low Level Design</Link>
            <Link to="/dataflowDiagram" className={styles["link-button"]}>Data Flow Diagram</Link>
            <Link to="" className={styles["link-button"]}>Code Development</Link>
            <Link to="/create-test-data" className={styles["link-button"]}>Create Test Data</Link>
            <Link to="" className={styles["link-button"]}>Create Test Cases</Link>
            <Link to="/recon" className={styles["link-button"]}>Reconciliation</Link>
        </div>
    )
}

export default Dashboard