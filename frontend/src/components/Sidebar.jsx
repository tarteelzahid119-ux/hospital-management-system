import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊', roles: ['admin', 'doctor', 'receptionist'] },
  { to: '/doctors', label: 'Doctors', icon: '🩺', roles: ['admin', 'receptionist', 'doctor'] },
  { to: '/patients', label: 'Patients', icon: '🧑‍⚕️', roles: ['admin', 'receptionist', 'doctor'] },
  { to: '/appointments', label: 'Appointments', icon: '📅', roles: ['admin', 'receptionist', 'doctor'] },
  { to: '/billing', label: 'Billing', icon: '💵', roles: ['admin', 'receptionist'] },
  { to: '/reports', label: 'Reports', icon: '📈', roles: ['admin', 'doctor', 'receptionist'] },
];

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <aside className="sidebar">
      <nav>
        {NAV_ITEMS.filter((item) => item.roles.includes(user.role)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
