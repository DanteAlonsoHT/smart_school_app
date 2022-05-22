import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import AuthContext from '../context/Context';

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return (
    token ? children : <Navigate to="/" />
  );
};

PrivateRoute.propTypes = {
  children: PropTypes.element.isRequired,
};

export default PrivateRoute;
