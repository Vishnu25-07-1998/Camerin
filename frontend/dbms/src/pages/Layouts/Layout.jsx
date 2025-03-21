import Sidebar from '../../components/layouts/Sidebar';
import Headers from '../../components/layouts/Headers';
import { Outlet } from "react-router-dom";
import './layout.css';

const Layout = () => {

    return (
        <div className="module-wrapper">
            <Headers />
            <Sidebar />
            <main className='module-content'>
                <Outlet />
            </main>
        </div>
    )
}

export default Layout
