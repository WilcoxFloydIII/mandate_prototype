import { Routes, Route } from 'react-router-dom';
import { RoleSelector } from './pages/RoleSelector';
import { AppShell } from './components/layout/AppShell';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelector />} />
      <Route path="/:role/*" element={<AppShell />} />
    </Routes>
  );
}
