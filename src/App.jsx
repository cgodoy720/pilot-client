import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import GPT from './pages/GPT/GPT';
import Calendar from './pages/Calendar/Calendar';
import './App.css';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gpt" element={<GPT />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
