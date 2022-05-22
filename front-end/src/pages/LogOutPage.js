import React from 'react';
import { PropTypes } from 'prop-types';
import { useNavigate } from 'react-router-dom';

const LogOutPage = (props) => {
  const history = useNavigate();
  // eslint-disable-next-line
  props.userLogOut();
  history('/');

  return (
    <section>
      <h1>LogOutPage</h1>
    </section>
  );
};

LogOutPage.propTypes = {
  userLogOut: PropTypes.func.isRequired,
};

export default LogOutPage;
