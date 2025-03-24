import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './protected/ProtectedRoute';
import AuthPage from './pages/authPages/AuthPage';
import BasicDetails from './pages/databaseAnalytics/basicDetails/BasicDetails';
import TestData from './pages/testData/TestData';
import EtlSheet from './pages/highLevel/EtlSheet';
import DatabaseAnalytics from './pages/databaseAnalytics/DatabaseAnalytics';
import Connections from './pages/connections/Connections';
import Layout from './pages/Layouts/Layout';
import HighLevel from './pages/highLevel/HighLevel';


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/sign' element={<AuthPage />} />
          {/* <Route path="/">
            <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="ETLSheet" element={<ProtectedRoute><EtlSheet /></ProtectedRoute>} />
          </Route> */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
          </Route>
          <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="db-analytics" element={<ProtectedRoute><DatabaseAnalytics /></ProtectedRoute>} />
            <Route path="highLevel" element={<ProtectedRoute><HighLevel /></ProtectedRoute>} />
          </Route>
          <Route path="/basicDetails" element={<ProtectedRoute><BasicDetails /></ProtectedRoute>} />
          <Route path="/create-test-data" element={<ProtectedRoute><TestData /></ProtectedRoute>} />
          <Route path="/ETLSheet" element={<ProtectedRoute><EtlSheet /></ProtectedRoute>} />

          {/* <Route path="/distinctcolumnvalues" element={<ProtectedRoute><DistinctColumnValues /></ProtectedRoute>} />
          <Route path="/distinctcolumnlength" element={<ProtectedRoute><DistinctColumnLength /></ProtectedRoute>} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;