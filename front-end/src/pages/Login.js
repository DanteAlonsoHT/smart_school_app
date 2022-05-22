import React, { useState, useRef } from 'react';
import { PropTypes } from 'prop-types';
import { useNavigate } from 'react-router-dom';

const Login = ({ createAlert, userLogin }) => {
  const history = useNavigate();
  const [credenciales, setCredenciales] = useState({
    credentials: { username: '', password: '' },
  });

  const passwordRef = useRef(null);

  const login = (event) => {
    event.preventDefault();
    fetch('http://127.0.0.1:8000/auth/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credenciales.credentials),
    })
      .then((res) => {
        if (res.status === 400) {
          createAlert('danger', 'Username and/or Password is/are incorrect');
        }
        return res.json();
      })
      .then((data) => {
        if (data.token) {
          createAlert('success', 'Log in was done successfully!');
          // eslint-disable-next-line
          userLogin(data.token);
          history('/home');
        } else {
          createAlert('danger', 'Username and/or Password is/are incorrect');
        }
      })
      .catch((error) => {
        history('/login');
        passwordRef.current.setCustomValidity(error);
        console.error('Error', error);
      });
  };

  const inputChanged = (event) => {
    if (event) {
      const cred = credenciales.credentials;
      cred[event.target.name] = event.target.value;
      setCredenciales({ credentials: cred });
    }
  };

  return (
    <section>
      <h1>Login</h1>
      <form onSubmit={login}>
        <br />
        <label htmlFor="username">
          Email:
          <input
            type="email"
            name="username"
            value={credenciales.credentials.username}
            onChange={inputChanged}
            required
          />
        </label>
        <br />
        <label htmlFor="password">
          Password:
          <input
            type="password"
            name="password"
            ref={passwordRef}
            value={credenciales.credentials.password}
            onChange={inputChanged}
            required
          />
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
    </section>
  );
};

Login.propTypes = {
  userLogin: PropTypes.func.isRequired,
  createAlert: PropTypes.func.isRequired,
};

export default Login;
