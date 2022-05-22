/* eslint-disable no-console, jsx-a11y/media-has-caption */
import React, {
  useState, useEffect, useRef, useContext,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import CameraComponent from '../components/CameraComponent';
import AuthContext from '../context/Context';
import * as faceapi from '../face_recognition_js/face-api.min';
import './Attendance.css';
// import faceMatcherPreTrained from '../face_recognition_js/faceMatcher';
import ClassroomsOptions from '../components/ClassroomsOptions';

const Attendance = ({ createAlert }) => {
  let idTimer = null;
  // const URL_DJANGO_SERVER = 'http://127.0.0.1:8000';
  const videoWidth = 512;
  const videoHeight = 512;
  const [initializing, setInitializing] = useState(false);
  const [currentClassroom, setCurrentClassroom] = useState(null);
  const [labeledImages, setLabeledImages] = useState(null);
  const [allStudentFromClassroom, setAllStudentFromClassroom] = useState(null);
  const [gettingStudent, setGettingStudent] = useState(true);
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [faceMatcherPreTrained, setFaceMatcherPreTrained] = useState(null);
  const [listAttendance, setListAttendance] = useState(null);
  const [timer, setTimer] = useState(1000);
  const [tinyFaceDetector, setTinyFaceDetector] = useState(null);
  const [genderProportion, setGenderProportion] = useState(null);
  const [emotionList, setEmotionList] = useState([]);
  const { token, dataUser, allClassroomsAvailables } = useContext(AuthContext);
  let displaySize = null;
  const listAttendancePreview = [];
  const genderProportionPreview = [0, 0];
  const emotionListPreview = [];
  const videoRef = useRef();
  const canvasRef = useRef();
  const selectRef = useRef();
  const bodyTableRef = useRef();
  const closeModelRef = useRef();
  const history = useNavigate();

  const inputSelected = (event) => {
    if (event) {
      setCurrentClassroom({ classroom: event.target.value });
    }
  };

  const updateAttendanceList = (listAttendance) => {
    bodyTableRef.current.innerHTML = '';
    bodyTableRef.current.innerHTML += allStudentFromClassroom.map((student) => (
      `<tr key={"tr-key-${student.name}"}>
        <td key={"td-key-${student.name}"} class="px-5">${student.list_num}</td>
        <td key={"td-key-${student.name}""} class="px-5">${student.name}</td>
        <td key={"status-key-${student.name}"} class="px-5">`.concat(
        listAttendance.includes(student.name) ? (
          '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill" /></svg>'
        ) : (
          '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill" /></svg>'
          // eslint-disable-next-line
        ).concat('</td></tr>')
      )
    ));
  };

  // eslint-disable-next-line
  const uploadImagesFromServer = async () => {
    await fetch('http://127.0.0.1:8000/api/students/get_students_from_classroom/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(currentClassroom),
    })
      .then((data) => (data.json()))
      .then(
        (data) => {
          setAllStudentFromClassroom(data);
          createAlert('success', 'All Students from Classroom were obtained successfully!');
        },
      )
      .catch(
        (error) => {
          console.error('Error', error);
          createAlert('danger', `Error: ${error}`);
        },
      );
  };

  // eslint-disable-next-line
  const loadLabeledImages = () => {
    return Promise.all(
      faceMatcherPreTrained.map(async (label) => {
        const descriptions = [new Float32Array(label.descriptors[0])];
        return new faceapi.LabeledFaceDescriptors(label.label, descriptions);
      }),
    );
  };

  const handleVideoOnPlay = async () => {
    try {
      idTimer = setInterval(async () => {
        if (videoRef.current) {
          if (videoRef.current.srcObject) {
            canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
            displaySize = {
              width: videoWidth,
              height: videoHeight,
            };
            if (initializing) {
              setInitializing(false);
            }
            faceapi.matchDimensions(canvasRef.current, displaySize);
            // eslint-disable-next-line
            const detections = await faceapi.detectAllFaces(videoRef.current, tinyFaceDetector).withFaceLandmarks().withFaceDescriptors().withFaceExpressions().withAgeAndGender();
            const resizeDetections = faceapi.resizeResults(detections, displaySize);
            canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);

            faceapi.draw.drawDetections(canvasRef.current, resizeDetections);
            faceapi.draw.drawFaceLandmarks(canvasRef.current, resizeDetections);
            faceapi.draw.drawFaceExpressions(canvasRef.current, resizeDetections);
            // eslint-disable-next-line
            const resultsFaces = resizeDetections.map(res => {
              window.localStorage.setItem('faceMatcher', JSON.stringify(faceMatcher));
              return faceMatcher.findBestMatch(res.descriptor);
            });
            resultsFaces.forEach((result, i) => {
              // eslint-disable-next-line
              const box = resizeDetections[i].detection.box;
              if (box.area > 70000) {
                // eslint-disable-next-line
                const drawBox = new faceapi.draw.DrawBox(box, { label: 'Name: ' + result.toString() + '  Age: ' + Math.round(resizeDetections[0].age).toString() + ' years  Gender: ' + resizeDetections[0].gender });
                drawBox.draw(canvasRef.current);
                const nameDetected = result.toString().slice(0, result.toString().length - 6).replace(/\s+/g, ' ').trim();
                if (!listAttendancePreview.includes(nameDetected) && nameDetected !== 'unknown') {
                  listAttendancePreview.push(nameDetected);
                  if (resizeDetections[0].gender === 'male') {
                    genderProportionPreview[0] += 1;
                  } else {
                    genderProportionPreview[1] += 1;
                  }
                  setGenderProportion(genderProportionPreview);
                  console.log(resizeDetections[0].expressions);
                  let emotionsList = null;
                  const emotionsPreview = [];
                  // eslint-disable-next-line
                  Object.entries(resizeDetections[0].expressions).map((emotion) => {
                    if (!emotionsList) {
                      emotionsList = [];
                      emotionsList.push(emotion[1]);
                      emotionsPreview.push(emotion[0]);
                    }
                    if (emotion[1] > emotionsList[0]) {
                      emotionsList.pop();
                      emotionsList.push(emotion[1]);
                      emotionsPreview.pop();
                      emotionsPreview.push(emotion[0]);
                    }
                  });
                  console.log(emotionsList, emotionsPreview);
                  // eslint-disable-next-line
                  const id_student = allStudentFromClassroom.filter((student) => student.name === nameDetected)[0].id;
                  // eslint-disable-next-line
                  emotionListPreview.push({ id_student: id_student, emotion: emotionsPreview[0] });
                  setEmotionList(emotionListPreview);
                  emotionsList.pop();
                  emotionsPreview.pop();
                  if (listAttendance !== listAttendancePreview) {
                    updateAttendanceList(listAttendancePreview);
                    setListAttendance(listAttendancePreview);
                  }
                }
              }
            });
          }
        }
      }, timer);
    } catch (e) {
      // pass exception object to err handler
      clearInterval(idTimer);
      canvasRef.current.innerHTML = null;
      console.error(e.message, e.name);
    }
  };

  const loadModels = async () => {
    const MODEL_URL = `${process.env.PUBLIC_URL}/models`;
    // eslint-disable-next-line
    Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      setTinyFaceDetector(new faceapi.TinyFaceDetectorOptions()),
    ]).then(console.log(videoRef.current, 'VideoRef'));
  };

  const loadLabeledImagesAsync = async () => {
    setLabeledImages(await loadLabeledImages());
  };

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (allStudentFromClassroom !== null) {
      allStudentFromClassroom.map((student) => (
        emotionListPreview.push({ id_student: student.id, emotion: '' })
      ));
      fetch('http://127.0.0.1:8000/api/faces_encoding/get_face_encoding_from_classroom/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          classroom_id: allClassroomsAvailables.filter(
            (classroom) => classroom.name === currentClassroom.classroom,
          )[0].id,
        }),
      })
        .then((data) => data.json())
        .then((data) => {
          if (!data.error) {
            createAlert('success', 'Face Recognition Encoders were loaded successfully!');
            setFaceMatcherPreTrained(JSON.parse(data.faces_encoding));
          } else {
            createAlert('danger', data.error);
          }
        })
        .catch((error) => createAlert('danger', `Error: ${error}`));
    }
  }, [allStudentFromClassroom]);

  useEffect(() => {
    if (faceMatcherPreTrained !== null) {
      loadLabeledImagesAsync();
    }
  }, [faceMatcherPreTrained]);

  useEffect(() => {
    if (labeledImages !== null) {
      setFaceMatcher(new faceapi.FaceMatcher(labeledImages, 0.9));
      window.localStorage.setItem('labeledImages', JSON.stringify(labeledImages));
      setGettingStudent(false);
    }
  }, [labeledImages]);

  const sendAttendance = () => {
    const date = new Date();
    const today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const totalAttendes = genderProportion[0] + genderProportion[1];
    // eslint-disable-next-line
    const classroomId = allClassroomsAvailables.filter((classroom) => classroom.name === currentClassroom.classroom)[0].id;
    const genderProportions = [{ gender: 'male', proportion: ((genderProportion[0] * 100) / totalAttendes) }, { gender: 'female', proportion: ((genderProportion[1] * 100) / totalAttendes) }];
    const json = {
      date: today,
      attendance_list: JSON.stringify(listAttendance),
      attendance_number: listAttendance.length,
      teacher: dataUser[0].id,
      classroom: classroomId,
      emotions_list: JSON.stringify(emotionList),
      gender_proportion: JSON.stringify(genderProportions),
    };
    console.log(json);
    fetch('http://127.0.0.1:8000/api/attendances/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(json),
    })
      .then((data) => (data.json()))
      .then(
        (data) => {
          console.log(data);
          const stream3 = videoRef.current.srcObject;
          canvasRef.current.style.display = 'none';
          // eslint-disable-next-line
          stream3.getTracks().map(function (track) {
            track.stop();
            videoRef.current.pause();
            console.log('Grabación terminada');
          });
          canvasRef.current.innerHTML = null;
          videoRef.current.srcObject = null;
          closeModelRef.current.click();
          history('/home');
        },
      )
      .catch(
        (error) => (console.error('Error', error)),
      );
  };

  const loadSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
      <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
      </symbol>
      <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
      </symbol>
      <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
      </symbol>
    </svg>
  );

  const attendanceList = () => (
    <div id="attendanceModal" className="modal fade" tabIndex="-1" aria-labelledby="formModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header py-3 px-4">
            <h3 className="modal-title" id="formModalLabel">Classroom Form</h3>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              style={{ minWidth: 0 }}
              ref={closeModelRef}
            />
          </div>
          <div className="modal-body d-flex flex-column justify-content-center">
            <div style={allStudentFromClassroom === null ? { display: 'none' } : { display: 'block' }}>
              Attendance List:
              <table cellPadding={0} cellSpacing={0}>
                <thead>
                  <tr>
                    <th>Num List</th>
                    <th>Name</th>
                    <th>Present</th>
                  </tr>
                </thead>
                <tbody ref={bodyTableRef} />
              </table>
            </div>
          </div>
          <div className="modal-footer py-3 px-3 d-flex justify-content-evenly">
            <button type="button" onClick={sendAttendance}>Register Attendance</button>
            <button type="button" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="d-flex flex-column">
      <h1>Attendance</h1>
      {loadSVG()}
      <div className="container">
        {
          allStudentFromClassroom && (
            <div className={`alert alert-${gettingStudent ? 'primary' : 'success'} w-100 d-flex align-items-center`} role="alert">
              {
                gettingStudent ? (
                  <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlinkHref="#info-fill" /></svg>
                ) : (
                  <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlinkHref="#check-circle-fill" /></svg>
                )
              }
              {
                gettingStudent ? ('Loading students...') : ('Students ready for attendance')
              }
            </div>
          )
        }
      </div>
      <div style={allStudentFromClassroom !== null ? { display: 'none' } : { display: 'block' }}>
        <label htmlFor="classroom-list">
          Select Classroom:
          <select name="classroom-list" ref={selectRef} defaultValue="Loading data..." onChange={inputSelected}>
            { // eslint-disable-next-line
              allClassroomsAvailables ? ClassroomsOptions(allClassroomsAvailables) : <option value={''}>Loading...</option>
            }
          </select>
        </label>
        <br />
        {
          currentClassroom && <button type="button" onClick={uploadImagesFromServer}>Confirm and Start</button>
        }
      </div>
      <CameraComponent
        videoWidth={videoWidth}
        videoHeight={videoHeight}
        videoRef={videoRef}
        canvasRef={canvasRef}
        setTimer={setTimer}
        handleVideoOnPlay={handleVideoOnPlay}
        allStudentFromClassroom={allStudentFromClassroom}
      />
      {
        allStudentFromClassroom && (
          <button
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#attendanceModal"
            className="my-2"
          >
            See Attendance List
          </button>
        )
      }
      {
        allStudentFromClassroom && attendanceList()
      }
      {
        console.log(videoRef.current, 'VideoRef')
      }
    </section>
  );
};

Attendance.propTypes = {
  createAlert: PropTypes.func.isRequired,
};

export default Attendance;
