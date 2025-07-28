import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from '../../components/layouts/Navbar';
import { Outlet } from "react-router-dom";

const DatabaseAnalytics = () => {
    const items = [
        'Basic Details',
        'Cardinality',
        'Distinct Column Length',
        'Distinct Column Values',
        'Column Each Char Count',
        'Unique Indexes',
        'Subset Relations',
        'Substr and Concat Columns',
        'Substr and Concat All Entities',
        'Equal Columns',
        'Distinct POS',
        'Table Names Gaps Filled',
        'Table Names as is Meaning'
    ];
    const [components, setComponents] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const category = 'Database Analytics';
    const onItemClick = async (item) => {
        setComponents(item);
        switch (item) {
            case "Basic Details":
                navigate("basicDetails");
                break;
            case "Cardinality":
                navigate("cardinality");
                break;
            case "Unique Indexes":
                navigate("uniqueIndexes");
                break;
            case "Distinct Column Length":
                navigate("distinctColumnLength");
                break;
            case "Distinct Column Values":
                navigate("distinctColumnValues");
                break;
            case "Column Each Char Count":
                navigate("columnEachCharCount");
                break;
            case "Substr and Concat Columns":
                navigate("substrConcatColumns");
                break;
            case "Substr and Concat All Entities":
                navigate("substrConcatEntities");
                break;
            case "Equal Columns":
                navigate("equalcolumns");
                break;
            default:
                break;
        }
    }
    useEffect(() => {
        const path = location.pathname.split('/').pop();
        switch (path) {
            case "basicDetails":
                setComponents("Basic Details");
                break;
            case "cardinality":
                setComponents("Cardinality");
                break;
            case "uniqueIndexes":
                setComponents("Unique Indexes");
                break;
            case "distinctColumnLength":
                setComponents("Distinct Column Length");
                break;
            case "distinctColumnValues":
                setComponents("Distinct Column Values");
                break;
            case "columnEachCharCount":
                setComponents("Column Each Char Count");
                break;
            case "substrConcatColumns":
                setComponents("Substr and Concat Columns");
                break;
            case "substrConcatEntities":
                setComponents("Substr and Concat All Entities");
                break;
            case "equalcolumns":
                setComponents("Equal Columns");
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

export default DatabaseAnalytics