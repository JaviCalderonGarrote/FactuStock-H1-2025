import { Link } from "react-router-dom";

const Sidebar = ({ username }) => {
  return (
    <aside id="sidebar">
      <div className="d-flex">
        <button className="toggle-btn" type="button">
          <i className="lni lni-grid-alt"></i>
        </button>
        <div className="sidebar-logo">
          <Link to="/">FactuStock</Link>
        </div>
      </div>
      <ul className="sidebar-nav">
        <li className="sidebar-item">
          <Link to="/profile" className="sidebar-link">
            <i className="lni lni-user"></i>
            <span>Profile</span>
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/task" className="sidebar-link">
            <i className="lni lni-agenda"></i>
            <span>Task</span>
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="#" className="sidebar-link collapsed has-dropdown" data-bs-toggle="collapse" data-bs-target="#auth" aria-expanded="false" aria-controls="auth">
            <i className="lni lni-protection"></i>
            <span>Auth</span>
          </Link>
          <ul id="auth" className="sidebar-dropdown list-unstyled collapse" data-bs-parent="#sidebar">
            <li className="sidebar-item">
              <Link to="/login" className="sidebar-link">Login</Link>
            </li>
            <li className="sidebar-item">
              <Link to="/register" className="sidebar-link">Register</Link>
            </li>
          </ul>
        </li>
        <li className="sidebar-item">
          <Link to="#" className="sidebar-link">
            <i className="lni lni-popup"></i>
            <span>Notification</span>
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/settings" className="sidebar-link">
            <i className="lni lni-cog"></i>
            <span>Setting</span>
          </Link>
        </li>
      </ul>
      <div className="sidebar-footer">
        <Link to="/logout" className="sidebar-link">
          <i className="lni lni-exit"></i>
          <span>Logout</span>
        </Link>
      </div>
      {/* Navbar con el nombre de usuario */}
      <div className="navbar-user">
        <span className="username">{username}</span>
      </div>
    </aside>
  );
};

export default Sidebar;
