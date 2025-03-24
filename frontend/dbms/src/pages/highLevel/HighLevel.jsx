import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from "react-router-dom";


const HighLevel = () => {

    const location = useLocation();

    return (
        <div className="navigation-link-buttons">
            <Link to="/ETLSheet" className="link-button">Create ETL Mapping Sheet</Link>
            <Link to="#" className="link-button">Undefined</Link>
            <Link to="#" className="link-button">Undefined</Link>
            <Link to="#" className="link-button">Undefined</Link>
            <Link to="#" className="link-button">Undefined</Link>
            <Link to="#" className="link-button">Undefined</Link>
            <Link to="#" className="link-button">Undefined</Link>
            <Link to="#" className="link-button">Undefined</Link>
            <Link to="#" className="link-button">Undefined</Link>
        </div>
    )
}

export default HighLevel