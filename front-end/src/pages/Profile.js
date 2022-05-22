/* eslint-disable no-console, camelcase */
/* eslint-disable no-console, object-shorthand */
import React, { useState, useContext } from 'react';
import { PropTypes } from 'prop-types';
import AuthContext from '../context/Context';

const Profile = ({ updateDataUser, createAlert }) => {
  const regexText = /^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\s]+$/;
  const regexNumbers = /^\d+$/;
  const textList = ['first_name', 'last_name', 'country', 'state', 'city'];
  const { token, dataUser } = useContext(AuthContext);

  const namesMaxLimit = 115;
  const charMaxLimit = 80;
  const phoneLimit = 10;

  const [credenciales, setCredenciales] = useState({
    credentials: {
      first_name: dataUser[0].first_name,
      last_name: dataUser[0].last_name,
      email: dataUser[0].email,
      born_date: dataUser[0].born_date,
      country: dataUser[0].country,
      state: dataUser[0].state,
      city: dataUser[0].city,
      phone_number: dataUser[0].phone_number,
    },
  });

  const register = async (event) => {
    event.preventDefault();
    console.log('Realizando POST');
    const userId = dataUser[0].id;
    await fetch(`http://127.0.0.1:8000/api/users/${userId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(credenciales.credentials),
    })
      .then((data) => data.json())
      .then((data) => {
        createAlert('success', 'Your data profile was updated successfully!');
        const jsonData = [];
        jsonData.push(data);
        updateDataUser(jsonData);
      })
      .catch((error) => createAlert('danger', error.toString()));
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

  return (
    <section>
      <h1>My Profile</h1>
      <br />
      <form autoComplete="off" onSubmit={register}>
        <label htmlFor="first_name">
          First name:
          <input
            type="text"
            name="first_name"
            value={credenciales.credentials.first_name}
            onChange={inputChanged}
            minLength={5}
            maxLength={namesMaxLimit}
            autoComplete="off"
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
            autoComplete="off"
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
            autoComplete="off"
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
            autoComplete="off"
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
            autoComplete="off"
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
            autoComplete="off"
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
            autoComplete="off"
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
            autoComplete="off"
            required
          />
        </label>
        <br />
        <button type="submit" value="send">Actualizar perfil</button>
      </form>
    </section>
  );
};

Profile.propTypes = {
  updateDataUser: PropTypes.func.isRequired,
  createAlert: PropTypes.func.isRequired,
};

export default Profile;
