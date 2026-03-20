import React, { useCallback, useContext, useEffect, useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { currentUser, authLoading } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = useCallback(
    async event => {
      event.preventDefault();
      const { email, password } = event.target.elements;

      try {
        setIsSubmitting(true);
        setErrorMessage('');
        const auth = getAuth();
        await signInWithEmailAndPassword(auth, email.value, password.value);
        navigate('/');
      } catch (error) {
        setErrorMessage('Não foi possível entrar. Confira e-mail e senha.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  return (
    <div className="login-page">
      <div className="login-panel">
        <section className="login-hero">
          <span className="eyebrow">Mobile first</span>
          <h1>Passagem de plantão sem dor.</h1>
          <p>
            Organize pacientes, evoluções e produção em uma interface pensada para funcionar primeiro no celular.
          </p>
          <div className="hero-points">
            <span>Fluxo objetivo</span>
            <span>Leitura clínica rápida</span>
            <span>Atualização em tempo real</span>
          </div>
        </section>

        <section className="login-card">
          <div className="section-heading">
            <span className="eyebrow">Acesso</span>
            <h2>Entrar no sistema</h2>
            <p>Use suas credenciais para abrir a central de pacientes.</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" placeholder="voce@hospital.com" autoComplete="email" required />
            </label>

            <label className="field">
              <span>Senha</span>
              <input
                name="password"
                type="password"
                placeholder="Sua senha"
                autoComplete="current-password"
                required
              />
            </label>

            {errorMessage && <div className="form-alert">{errorMessage}</div>}

            <button type="submit" className="button button-primary button-block" disabled={isSubmitting || authLoading}>
              {isSubmitting || authLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Login;
