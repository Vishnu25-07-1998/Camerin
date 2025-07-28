import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './protected/ProtectedRoute';
import AuthPage from './pages/authPages/AuthPage';
import TestData from './pages/testData/TestData';
import DatabaseAnalytics from './pages/databaseAnalytics/DatabaseAnalytics';
import Connections from './pages/connections/Connections';
import Layout from './pages/Layouts/Layout';
import HighLevel from './pages/highLevel/HighLevel';
import Dashboard from './pages/dashboard/Dashboard';
import DBCompare from './pages/dbCompare/DBCompare';
import ETLTab from './pages/tabs/ETLTab';
import Recon from './pages/reconciliation/Recon';
import Home from './pages/home/Home';
import BasicDetails from './pages/databaseAnalytics/submodules/BasicDetails';
import Cardinality from './pages/databaseAnalytics/submodules/Cardinality';
import UniqueIndexes from './pages/databaseAnalytics/submodules/UniqueIndexes';
import DistinctColumnLength from './pages/databaseAnalytics/submodules/DistinctColumnLength';
import DistinctColumnValues from './pages/databaseAnalytics/submodules/DistinctColumnValues';
import ColumnCharEachCount from './pages/databaseAnalytics/submodules/ColumnCharEachCount';
import SubstrAndConcatColumn from './pages/databaseAnalytics/submodules/SubstrAndConcatColumn';
import SubstrAndConcatEntities from './pages/databaseAnalytics/submodules/SubstrAndConcatEntities';
import EqualColumns from './pages/databaseAnalytics/submodules/EqualColumns';
import Settings from './pages/settings/Settings';
import DataAnamoly from './pages/dataAnamoly/DataAnamoly';
import DBScan from './pages/dataAnamoly/submodules/DBScan';
import DataflowDiagram from './pages/dataflow/DataflowDiagram';
import Dataflow from './pages/dataflow/submodules/Dataflow';


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
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Route>
          {/* <Route path="" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="highLevel" element={<ProtectedRoute><HighLevel /></ProtectedRoute>} />
            <Route path="userStory" element={<ProtectedRoute><UserStory /></ProtectedRoute>} />
          </Route> */}
          <Route path="/db-analytics" element={<ProtectedRoute><DatabaseAnalytics /></ProtectedRoute>}>
            <Route path="basicDetails" element={<ProtectedRoute><BasicDetails /></ProtectedRoute>} />
            <Route path="cardinality" element={<ProtectedRoute><Cardinality /></ProtectedRoute>} />
            <Route path="uniqueIndexes" element={<ProtectedRoute><UniqueIndexes /></ProtectedRoute>} />
            <Route path="distinctColumnLength" element={<ProtectedRoute><DistinctColumnLength /></ProtectedRoute>} />
            <Route path="distinctColumnValues" element={<ProtectedRoute><DistinctColumnValues /></ProtectedRoute>} />
            <Route path="columnEachCharCount" element={<ProtectedRoute><ColumnCharEachCount /></ProtectedRoute>} />
            <Route path="substrConcatColumns" element={<ProtectedRoute><SubstrAndConcatColumn /></ProtectedRoute>} />
            <Route path="substrConcatEntities" element={<ProtectedRoute><SubstrAndConcatEntities /></ProtectedRoute>} />
            <Route path="equalcolumns" element={<ProtectedRoute><EqualColumns /></ProtectedRoute>} />
          </Route>
          <Route path="/dataAnomaly" element={<ProtectedRoute><DataAnamoly /></ProtectedRoute>}>
            <Route path="dbScan" element={<ProtectedRoute><DBScan /></ProtectedRoute>} />
          </Route>
          <Route path="/dataflowDiagram" element={<ProtectedRoute><DataflowDiagram /></ProtectedRoute>}>
            <Route path="dataflow" element={<ProtectedRoute><Dataflow /></ProtectedRoute>} />
          </Route>
          <Route path="/create-test-data" element={<ProtectedRoute><TestData /></ProtectedRoute>} />
          <Route path="/highLevel" element={<ProtectedRoute><HighLevel /></ProtectedRoute>} />
          <Route path='/dbCompare' element={<ProtectedRoute><DBCompare /></ProtectedRoute>} />
          <Route path='/etlTab' element={<ProtectedRoute><ETLTab /></ProtectedRoute>} />
          <Route path='/recon' element={<ProtectedRoute><Recon /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;