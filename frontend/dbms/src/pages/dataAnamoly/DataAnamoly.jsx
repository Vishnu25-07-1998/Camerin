import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from '../../components/layouts/Navbar';
import { Outlet } from "react-router-dom";

const DataAnamoly = () => {
    const items = [
        'DB Scan',
        'Auto Encoder',
    ];
    const [components, setComponents] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const category = 'Data Anomaly';
    const onItemClick = async (item) => {
        setComponents(item);
        switch (item) {
            case "DB Scan":
                navigate("dbScan");
                break;
            default:
                break;
        }
    }
    useEffect(() => {
        const path = location.pathname.split('/').pop();
        switch (path) {
            case "dbScan":
                setComponents("DB Scan");
                break;
            default:
                setComponents('');
                break;
        }
    }, [location.pathname]);
    return (
        <div className="module-wrapper">
            <Navbar category={category} items={items} components={components} onItemClick={onItemClick} />
            <Outlet key={location.pathname} />
        </div>
    )
}

export default DataAnamoly