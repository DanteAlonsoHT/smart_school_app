import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const history = useNavigate();

  const regexText = /^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\s]+$/;
  const regexNumbers = /^\d+$/;
  const textList = ['first_name', 'last_name', 'country', 'state', 'city'];

  const inputRef = React.useRef(null);

  const namesMaxLimit = 115;
  const charMaxLimit = 80;
  const phoneLimit = 10;

  const [credenciales, setCredenciales] = useState({
    credentials: {
      first_name: '',
      last_name: '',
      email: '',
      born_date: '',
      country: '',
      state: '',
      city: '',
      phone_number: '',
      password: '',
    },
  });

  const [validaciones, setValidaciones] = useState({
    validations: {
      repetead_password: '',
    },
  });

  const register = (event) => {
    event.preventDefault();
    console.log('Realizando POST');
    fetch('http://127.0.0.1:8000/api/users/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credenciales.credentials),
    })
      .then((data) => data.json())
      .then(
        (data) => {
          history('/login');
          console.log(data);
        },
      )
      .catch((error) => {
        history('/signup');
        console.log(error);
      });
  };

  const inputChanged = (event) => {
    if (event) {
      const cred = credenciales.credentials;
      cred[event.target.name] = event.target.value;
      if (textList.includes(event.target.name)) {
        if (!regexText.test(event.target.value)) {
          event.target.setCustomValidity('Only letters are accepted in this field');
        } else {
          event.target.setCustomValidity('');
        }
      } else if (event.target.name === 'phone_number') {
        if (!regexNumbers.test(event.target.value)) {
          event.target.setCustomValidity('Only numbers are accepted in this field');
        } else {
          event.target.setCustomValidity('');
        }
      }
      setCredenciales({ credentials: cred });
    }
  };

  const password2Changed = (event) => {
    if (event) {
      const cred = validaciones.validations;
      cred[event.target.name] = event.target.value;
      setValidaciones({ validations: cred });
      if (credenciales.credentials.password !== validaciones.validations.repetead_password) {
        inputRef.current.setCustomValidity('The password are not equals');
      } else {
        inputRef.current.setCustomValidity('');
      }
    }
  };

  return (
    <section>
      <h1>Sign up today!</h1>

      <form onSubmit={register}>
        <label htmlFor="first_name">
          First name:
          <input
            type="text"
            name="first_name"
            value={credenciales.credentials.first_name}
            onChange={inputChanged}
            minLength={5}
            maxLength={namesMaxLimit}
            required
          />
        </label>

        <br />

        <label htmlFor="last_name">
          Last name:
          <input
            type="text"
            name="last_name"
            value={credenciales.credentials.last_name}
            onChange={inputChanged}
            minLength={5}
            maxLength={namesMaxLimit}
            required
          />
        </label>

        <br />

        <label htmlFor="email">
          Email:
          <input
            type="email"
            name="email"
            value={credenciales.credentials.email}
            onChange={inputChanged}
            maxLength={namesMaxLimit}
            required
          />
        </label>

        <br />

        <label htmlFor="born_date">
          Born date:
          <input
            type="date"
            name="born_date"
            value={credenciales.credentials.born_date}
            onChange={inputChanged}
            required
          />
        </label>

        <br />

        <label htmlFor="country">
          Country:
          <input
            type="text"
            name="country"
            value={credenciales.credentials.country}
            onChange={inputChanged}
            minLength={4}
            maxLength={charMaxLimit}
            required
          />
        </label>

        <br />

        <label htmlFor="state">
          State or Department:
          <input
            type="text"
            name="state"
            value={credenciales.credentials.state}
            onChange={inputChanged}
            minLength={5}
            maxLength={charMaxLimit}
            required
          />
        </label>

        <br />

        <label htmlFor="city">
          City:
          <input
            type="text"
            name="city"
            value={credenciales.credentials.city}
            onChange={inputChanged}
            minLength={3}
            maxLength={charMaxLimit}
            required
          />
        </label>

        <br />

        <label htmlFor="phone_number">
          Phone number:
          <input
            type="text"
            name="phone_number"
            value={credenciales.credentials.phone_number}
            onChange={inputChanged}
            minLength={phoneLimit}
            maxLength={phoneLimit}
            required
          />
        </label>

        <br />

        <label htmlFor="password">
          Password:
          <input
            type="password"
            name="password"
            id="password"
            value={credenciales.credentials.password}
            minLength={8}
            maxLength={32}
            onChange={inputChanged}
            required
          />
        </label>

        <br />

        <label htmlFor="repetead_password">
          Repeat password:
          <input
            type="password"
            name="repetead_password"
            id="repetead_password"
            ref={inputRef}
            value={validaciones.validations.repetead_password}
            minLength={8}
            maxLength={32}
            onChange={password2Changed}
            required
          />
        </label>
        <br />
        <button type="submit" value="send">Sign up</button>
      </form>
    </section>
  );
};

export default SignUpPage;
