import { useState, useEffect, useRef } from 'react';
import './databaseAnalytics.css';
import { Link, useLocation } from "react-router-dom";


const DatabaseAnalytics = () => {

    const location = useLocation();

    return (
        <div className="navigation-link-buttons">
            <Link to="/basicdetails" className="link-button">Basic Details</Link>
            <Link to="#" className="link-button">Distinct Column Values</Link>
            <Link to="#" className="link-button">Distinct Column Lengths</Link>
            <Link to="#" className="link-button">Column Each Char Count</Link>
            <Link to="#" className="link-button">Unique Indexes</Link>
            <Link to="#" className="link-button">Subset Relation</Link>
            <Link to="#" className="link-button">Cardinality</Link>
            <Link to="#" className="link-button">Substr and Concat Columns</Link>
            <Link to="#" className="link-button">Substr and Concat All Entities</Link>
        </div>
    )
}

export default DatabaseAnalytics