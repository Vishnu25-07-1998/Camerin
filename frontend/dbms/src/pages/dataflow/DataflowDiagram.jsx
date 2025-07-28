import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from '../../components/layouts/Navbar';
import { Outlet } from "react-router-dom";


const DataflowDiagram = () => {
    const items = [
        'Dataflow',
    ];
    const [components, setComponents] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const category = 'Dataflow Diagram';
    const onItemClick = async (item) => {
        setComponents(item);
        switch (item) {
            case "Dataflow":
                navigate("dataflow");
                break;
            default:
                break;
        }
    }
    useEffect(() => {
        const path = location.pathname.split('/').pop();
        switch (path) {
            case "dataflow":
                setComponents("Dataflow");
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

export default DataflowDiagram