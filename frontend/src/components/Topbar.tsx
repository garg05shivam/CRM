import { useAuth } from "../context/AuthContext";

export const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div>
        <span className="topbar-title">
          CRM
        </span>
      </div>

      <div className="topbar-user">
        <div>
          <strong>{user?.name}</strong>
          <span>{user?.role}</span>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </header>
  );
};