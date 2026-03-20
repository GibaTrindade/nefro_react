import React, { useContext, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { AuthContext } from '../AuthContext';
import { auth } from '../firebase';

const AppNavbar = () => {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (location.pathname === '/login') {
    return null;
  }

  const handleLogout = async () => {
    try {
      setIsSigningOut(true);
      await signOut(auth);
      navigate('/login');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Navbar expand="lg" className="app-navbar">
      <Container className="container-app navbar-inner">
        <Navbar.Brand as={Link} to="/" className="navbar-brand-custom">
          <span className="brand-mark">NR</span>
          <span>
            <strong>Nefro React</strong>
            <small>Controle clínico e produção</small>
          </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="app-navbar-nav" className="navbar-toggle-custom" />
        <Navbar.Collapse id="app-navbar-nav">
          <Nav className="me-auto nav-links-custom">
            <Nav.Link as={Link} to="/" active={location.pathname === '/'}>
              Pacientes
            </Nav.Link>
            <Nav.Link as={Link} to="/producao" active={location.pathname === '/producao'}>
              Produção
            </Nav.Link>
          </Nav>
          {currentUser && (
            <div className="navbar-actions">
              <div className="user-pill">
                <span className="user-pill__label">Logado como</span>
                <strong>{currentUser.email}</strong>
              </div>
              <button
                type="button"
                className="button button-secondary button-small"
                onClick={handleLogout}
                disabled={isSigningOut}
              >
                {isSigningOut ? 'Saindo...' : 'Sair'}
              </button>
            </div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
