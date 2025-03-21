import './connectModal.css';
import { AuthContext } from '../../context/AuthContext';
import SelectDatasource from '../../widgets/customWidgets/datasourceSelect/SelectDatasource';
import postgresIcon from '../../assets/db/icons8-postgresql.svg';
import mysqlIcon from '../../assets/db/icons8-mysql.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from "@mui/icons-material/Lock";
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';

const ConnectModal = ({ closeConnect }) => {
    const initialFormData = {
        datasource: "",
        dbtechnology: "",
        user: "",
        hostname: "",
        port: "",
        database: "",
        dbpassword: "",
    };
    const options = [
        { label: 'Postgres', icon: postgresIcon },
        { label: 'MySQL', icon: mysqlIcon }
    ];
    const [selectedDb, setSelectedDb] = useState(options[0].label);
    const API_URL = import.meta.env.VITE_API_URL;
    const [formData, setFormData] = useState(initialFormData);
    const [showPassword, setShowPassword] = useState(false);
    const [isConnecting, setConnect] = useState(false);
    const { authState } = useContext(AuthContext);
    const databaseDrivers = {
        MySQL: "mysql+pymysql",
        Postgres: "postgresql+psycopg2",
        sqlserver: "dialect+driver",
    };
    useEffect(() => {
        const dbDialect = databaseDrivers[selectedDb] || initialFormData.dbtechnology;

        setFormData((prev) =>
            prev.dbtechnology !== dbDialect
                ? { ...initialFormData, dbtechnology: dbDialect }
                : prev
        );
    }, [selectedDb]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setConnect(true);
        try {
            const response = await axios.post(`${API_URL}/api/datasourceroute/dbconnect`,
                JSON.stringify(formData),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authState.token}`,
                    },
                }
            );
            console.log("Saved successful:", response.data.message);
        } catch (error) {
            console.error("Connection error:", error);
            // alert("Connection error: " + (error.response?.data?.message || error.message));

            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        alert("Please fill all fields.");
                        break;
                    case 402:
                        alert("Unsupported database technology.");
                        break;
                    case 500:
                        alert("error: " + error.response.data.message);
                        break;
                    default:
                        alert("An unknown error occurred.");
                }
            } else {
                alert("Failed to connect to the server.");
            }
        } finally {
            setConnect(false);
        }
    }
    return (
        <div className="modalOverlay">
            <div className="connect-modal">
                <button onClick={() => closeConnect(false)} className="close">
                    X
                </button>
                <SelectDatasource
                    icon={options.find((opt) => opt.label === selectedDb)?.icon}
                    selectedValue={selectedDb}
                    options={options.map(opt => opt.label)}
                    onChange={(e) => setSelectedDb(e.target.value)}
                    customStyles={{container: { maxWidth: "270px", borderTop: "0", borderRadius: "40%", padding: "10px" },}}
                />

                {selectedDb &&
                    <form onSubmit={handleSubmit} className="db-details" >
                        <div className="db-input">
                            <label htmlFor="datasource">Datasource:</label>
                            <div className="input-wrapper">
                                <PersonIcon className="auth-icons" />
                                <input
                                    type="text"
                                    id="datasource"
                                    name="datasource"
                                    value={formData.datasource}
                                    onChange={handleInputChange}
                                    placeholder="Enter Datasource Name"
                                    className="input-field"
                                    autoComplete='off'
                                />
                            </div>

                        </div>
                        <div className="db-input">
                            <label htmlFor="dbtechnology">DB Technology:</label>
                            <div className="input-wrapper">
                                <PersonIcon className="auth-icons" />
                                <input
                                    type="text"
                                    id="dbtechnology"
                                    name="dbtechnology"
                                    value={formData.dbtechnology}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    readOnly
                                />
                            </div>

                        </div>
                        <div className="db-input">
                            <label htmlFor="user">User:</label>
                            <div className="input-wrapper">
                                <PersonIcon className="auth-icons" />
                                <input
                                    type="text"
                                    id="user"
                                    name="user"
                                    value={formData.user}
                                    onChange={handleInputChange}
                                    placeholder="Enter username"
                                    autoComplete='off'
                                    className="input-field"
                                />
                            </div>
                        </div>
                        <div className="db-input">
                            <label htmlFor="hostname">Hostname:</label>
                            <div className="input-wrapper">
                                <PersonIcon className="auth-icons" />
                                <input
                                    type="text"
                                    id="hostname"
                                    name="hostname"
                                    value={formData.hostname}
                                    onChange={handleInputChange}
                                    placeholder="Enter hostname"
                                    autoComplete='off'
                                    className="input-field"
                                />
                            </div>

                        </div>
                        <div className="db-input">
                            <label htmlFor="port">Port Number:</label>
                            <div className="input-wrapper">
                                <PersonIcon className="auth-icons" />
                                <input
                                    type="text"
                                    id="port"
                                    name="port"
                                    value={formData.port}
                                    onChange={handleInputChange}
                                    placeholder="Enter port number"
                                    autoComplete='off'
                                    className="input-field"
                                />
                            </div>

                        </div>
                        <div className="db-input">
                            <label htmlFor="database">Database Name:</label>
                            <div className="input-wrapper">
                                <PersonIcon className="auth-icons" />
                                <input
                                    type="text"
                                    id="database"
                                    name="database"
                                    value={formData.database}
                                    onChange={handleInputChange}
                                    placeholder="Enter database name"
                                    autoComplete='off'
                                    className="input-field"
                                />
                            </div>

                        </div>
                        <div className="db-input">
                            <label htmlFor="dbpassword">Password:</label>
                            <div className="input-wrapper">
                                <LockIcon className="auth-icons" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="dbpassword"
                                    name="dbpassword"
                                    value={formData.dbpassword}
                                    onChange={handleInputChange}
                                    placeholder="Enter password"
                                    className="input-field"
                                    autoComplete='off'
                                />
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} onClick={() => setShowPassword(!showPassword)} />
                            </div>
                        </div>
                        { isConnecting ? <div class="animate-bar">
                            <span className='dots'></span>
                            <span className='dots'></span>
                            <span className='dots'></span>
                        </div>
                        : 
                        <button type="submit" className='connect-btn'>
                            submit
                        </button>}
                    </form>
                }

            </div>
        </div>
    )
}

export default ConnectModal
