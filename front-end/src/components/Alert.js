import { PropTypes } from 'prop-types';

const Alert = ({ alertType, alertMessage }) => (
  <div className="container d-flex justify-content-center mt-2">
    <div className={`container alert alert-${alertType} alert-dismissible fade show position-fixed w-100 mx-auto px-5`} role="alert">
      {alertMessage}
    </div>
  </div>
);

Alert.propTypes = {
  alertType: PropTypes.string.isRequired,
  alertMessage: PropTypes.string.isRequired,
};

export default Alert;
