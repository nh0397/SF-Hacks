import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav>
      {user ? (
        <button onClick={() => logout(navigate)}>Logout</button>  // ✅ Pass navigate()
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
}
