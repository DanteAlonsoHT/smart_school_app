/* eslint-disable no-console, jsx-a11y/media-has-caption */
import {
  useState,
} from 'react';
import { PropTypes } from 'prop-types';
import './CameraComponent.css';

const CameraComponent = (props) => {
  const {
    setTimer, videoWidth, videoHeight, handleVideoOnPlay,
    canvasRef, videoRef, allStudentFromClassroom,
  } = props;
  const [recording, setRecording] = useState(false);

  const startVideo = () => {
    setTimer(100);
    canvasRef.current.style.display = 'block';
    navigator.getUserMedia(
      {
        video: {},
      },
      // eslint-disable-next-line
      (stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setRecording(true);
      },
      (err) => console.log(err),
    );
  };

  const stopCamera = () => {
    setTimer(20000);
    const stream2 = videoRef.current.srcObject;
    canvasRef.current.style.display = 'none';
    // eslint-disable-next-line
    stream2.getTracks().map(function (track) {
      setRecording(false);
      track.stop();
      videoRef.current.pause();
      console.log('Grabación terminada');
    });
    videoRef.current.srcObject = null;
  };

  // eslint-disable-next-line
  const renderBotons = () => (
    <div>
      <button type="button" onClick={startVideo}>Comenzar a grabar</button>
      {
        videoRef.current && <button type="button" onClick={stopCamera}>Parar video</button>
      }
    </div>
  );

  return (
    <div className="App container" style={allStudentFromClassroom === null ? { display: 'none' } : { display: 'block' }}>
      <div className={`alert alert-${recording ? 'success' : 'warning'} w-100 d-flex align-items-center`} role="alert">
        {
          recording ? (
            <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlinkHref="#check-circle-fill" /></svg>
          ) : (
            <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlinkHref="#exclamation-triangle-fill" /></svg>
          )
        }
        {
          recording ? ('Grabando') : ('NO Grabando')
        }
      </div>
      <div className="display-flex justify-content-center">
        <video
          ref={videoRef}
          id="video"
          width={videoWidth}
          height={videoHeight}
          muted
          onPlay={handleVideoOnPlay}
          style={{ backgroundColor: '#2e304771', borderRadius: '0 1rem 0 1rem' }}
        />
        <canvas ref={canvasRef} className="position-absolute" />
      </div>
      {
        allStudentFromClassroom ? renderBotons() : 'Student have not read yet...'
      }
    </div>
  );
};

CameraComponent.propTypes = {
  videoWidth: PropTypes.number.isRequired,
  videoHeight: PropTypes.number.isRequired,
  // eslint-disable-next-line
  videoRef: PropTypes.any.isRequired,
  // eslint-disable-next-line
  canvasRef: PropTypes.any.isRequired,
  handleVideoOnPlay: PropTypes.func.isRequired,
  setTimer: PropTypes.func.isRequired,
  // eslint-disable-next-line
  allStudentFromClassroom: PropTypes.any.isRequired,
};

export default CameraComponent;
