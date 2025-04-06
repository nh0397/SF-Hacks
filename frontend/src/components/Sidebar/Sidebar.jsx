import React from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  File, 
  AlertTriangle, 
  Shield, 
  UserCheck, 
  ChevronLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import './Sidebar.css';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => {
  return (
    <li 
      className={`sidebar-item ${active ? 'sidebar-item-active' : ''}`}
      onClick={onClick}
    >
      <div className="sidebar-item-content">
        <div className="sidebar-item-icon-label">
          <Icon 
            size={20} 
            className={`sidebar-item-icon ${active ? 'sidebar-item-icon-active' : ''}`} 
          />
          <span className="sidebar-item-label">{label}</span>
        </div>
      </div>
    </li>
  );
};

const Sidebar = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [activeItem, setActiveItem] = React.useState('dashboard');
  const navigate = useNavigate();

  const handleNavigation = (path, item) => {
    setActiveItem(item);
    navigate(path);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Collapse Button */}
      <div className='collapse-button-div'>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="collapse-button"
        >
          <ChevronLeft 
            size={16} 
            className={`collapse-button-icon ${isCollapsed ? 'collapse-button-icon-collapsed' : ''}`} 
          />
        </button>
      </div>

      {/* Navigation */}
      <div className="sidebar-container">
        <div className="sidebar-nav">
          <ul className="sidebar-nav-list">
            <SidebarItem 
              icon={LayoutDashboard} 
              label={isCollapsed ? '' : 'Dashboard'} 
              active={activeItem === 'dashboard'} 
              onClick={() => handleNavigation('/dashboard', 'dashboard')} 
            />
            <SidebarItem 
              icon={ShieldCheck} 
              label={isCollapsed ? '' : 'Detectors'} 
              active={activeItem === 'detectors'} 
              onClick={() => handleNavigation('/detectors', 'detectors')} 
            />
            <SidebarItem 
              icon={File} 
              label={isCollapsed ? '' : 'Policies'} 
              active={activeItem === 'policies'} 
              onClick={() => handleNavigation('/policies', 'policies')} 
            />
            <SidebarItem 
              icon={AlertTriangle} 
              label={isCollapsed ? '' : 'Violations'} 
              active={activeItem === 'violations'} 
              onClick={() => handleNavigation('/violations', 'violations')} 
            />
            <SidebarItem 
              icon={Shield} 
              label={isCollapsed ? '' : 'Firewall'} 
              active={activeItem === 'firewall'} 
              onClick={() => handleNavigation('/firewall', 'firewall')} 
            />
            <SidebarItem 
              icon={UserCheck} 
              label={isCollapsed ? '' : 'RBAC'} 
              active={activeItem === 'rbac'} 
              onClick={() => handleNavigation('/rbac', 'rbac')} 
            />
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
