/* eslint-disable no-console, jsx-a11y/label-has-associated-control */
import {
  useState, useContext, useRef, useEffect,
} from 'react';
import { PropTypes } from 'prop-types';
import AuthContext from '../context/Context';
import * as faceapi from '../face_recognition_js/face-api.min';
import ClassroomsOptions from '../components/ClassroomsOptions';

const Student = ({ createAlert }) => {
  const [allStudentFromClassroom, setAllStudentFromClassroom] = useState(null);
  const [currentClassroom, setCurrentClassroom] = useState(null);
  const [currentClassroomId, setCurrentClassroomId] = useState(null);
  const [labeledImages, setLabeledImages] = useState(null);
  // const [tableUpdating, setTableUpdating] = useState(false);
  const [credentials, setCredentials] = useState({
    credentials: {
      name: null,
      classroom: null,
      image_profile: null,
      list_num: null,
      student_id: null,
    },
  });
  const { token, allClassroomsAvailables } = useContext(AuthContext);
  const nameRef = useRef();
  const classroomRef = useRef();
  const imageProfileRef = useRef();
  const listNumRef = useRef();
  const studentId = useRef();
  const closeModelRef = useRef();
  const URL_DJANGO_SERVER = 'http://127.0.0.1:8000';
  const regexText = /^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\s]+$/;
  const regexNumbers = /^\d+$/;
  const fileReader = new FileReader();

  const inputChanged = (event) => {
    const credentialMock = credentials.credentials;
    if (nameRef.current.name === event.target.name) {
      if (!regexText.test(nameRef.current.value)) {
        event.target.setCustomValidity('Only letters are accepted in this field');
      } else {
        event.target.setCustomValidity('');
        credentialMock.name = event.target.value;
        setCredentials({ credentials: credentialMock });
      }
    } else if (classroomRef.current.name === event.target.name) {
      const classroomIdPreview = allClassroomsAvailables.filter(
        (classroom) => classroom.name === event.target.value,
      )[0].id;
      credentialMock.classroom = classroomIdPreview;
      setCredentials({ credentials: credentialMock });
    } else if (imageProfileRef.current.name === event.target.name) {
      // eslint-disable-next-line
      fileReader.readAsDataURL(event.target.files[0]);
      fileReader.onloadend = () => {
        credentialMock.image_profile = fileReader.result;
        setCredentials({ credentials: credentialMock });
      };
    } else if (listNumRef.current.name === event.target.name) {
      credentialMock.list_num = parseInt(event.target.value, 10);
      setCredentials({ credentials: credentialMock });
    } else if (studentId.current.name === event.target.name) {
      if (!regexNumbers.test(studentId.current.value)) {
        event.target.setCustomValidity('Only numbers are accepted in this field');
      } else {
        event.target.setCustomValidity('');
        credentialMock.student_id = event.target.value;
        setCredentials({ credentials: credentialMock });
      }
    }
  };

  const createStudent = (event) => {
    event.preventDefault();
    closeModelRef.current.click();
    fetch('http://127.0.0.1:8000/api/students/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(credentials.credentials),
    })
      .then((data) => data.json())
      .then((data) => createAlert('success', `Student ${data.name} has been created successfully!`))
      .catch((error) => createAlert('danger', `Error: ${error}`));
  };

  // eslint-disable-next-line
  const formToCreateStudent = () => {
    return (
      <form
        onSubmit={createStudent}
        id="formModalStudents"
        className="modal fade"
        tabIndex="-1"
        aria-labelledby="formModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header py-3 px-4">
              <h3 className="modal-title" id="formModalLabel">Student Form</h3>
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
              <label htmlFor="name" className="d-block mx-auto">
                Name:
                <input
                  type="text"
                  name="name"
                  onChange={inputChanged}
                  ref={nameRef}
                  required
                />
              </label>
              <br />
              <label htmlFor="list_num" className="d-block mx-auto">
                List num:
                <input
                  type="number"
                  name="list_num"
                  onChange={inputChanged}
                  ref={listNumRef}
                  min={0}
                  max={100}
                  step={1}
                  required
                />
              </label>
              <br />
              <label htmlFor="classroom" className="d-block mx-auto">
                Classroom:
                <select name="classroom" onChange={inputChanged} ref={classroomRef} required>
                  {
                    allClassroomsAvailables && ClassroomsOptions(allClassroomsAvailables)
                  }
                </select>
              </label>
              <br />
              <label className="d-block mx-auto custom-file-upload">
                <input
                  type="file"
                  name="archivo"
                  accept="image/*"
                  id="FileUploaded"
                  onChange={inputChanged}
                  ref={imageProfileRef}
                  required
                  hidden
                />
                Select Image Profile
              </label>
              <br />
              <label htmlFor="student_id" className="d-block mx-auto">
                Student ID:
                <input
                  type="text"
                  name="student_id"
                  onChange={inputChanged}
                  ref={studentId}
                  required
                />
              </label>
              <br />
            </div>
            <div className="modal-footer py-3 px-3 d-flex justify-content-evenly">
              <button type="submit">Create Student</button>
              <button type="button" data-bs-dismiss="modal">Cancel</button>
            </div>
          </div>
        </div>
      </form>
    );
  };

  const showingStudents = () => {
    if (currentClassroom !== null) {
      fetch('http://127.0.0.1:8000/api/students/get_students_from_classroom/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(currentClassroom),
      })
        .then((data) => data.json())
        .then((data) => setAllStudentFromClassroom(data))
        .catch((error) => createAlert('danger', `Error: ${error}`));
    }
  };

  const tableSTudents = () => (
    <table
      cellPadding="0"
      cellSpacing="0"
    >
      <thead>
        <tr>
          <th>List Number</th>
          <th>Name</th>
          <th>Matricula</th>
          <th>Image Profile</th>
        </tr>
      </thead>
      <tbody>
        {
          allStudentFromClassroom.map((student) => (
            <tr key={student.id}>
              <td>{student.list_num}</td>
              <td>{student.name}</td>
              <td>{student.student_id}</td>
              <td>
                <img
                  src={URL_DJANGO_SERVER + student.image_profile}
                  alt={student.name}
                  height={64}
                  width={64}
                />
              </td>
            </tr>
          ))
        }
      </tbody>
    </table>

  );

  const inputSelected = (event) => {
    if (event.target.value.slice(0, 1) !== '-') {
      setCurrentClassroom({ classroom: event.target.value });
      setCurrentClassroomId({
        classroomId: allClassroomsAvailables.filter(
          (classroom) => (classroom.name === event.target.value),
        )[0].id,
      });
    } else {
      setCurrentClassroom(null);
      setCurrentClassroomId(null);
    }
  };

  // eslint-disable-next-line
  const loadLabeledImages = () => {
    const labels = [];
    const images = [];
    allStudentFromClassroom.map((student) => (
      // eslint-disable-next-line
      labels.push(student.name),
      images.push(student.image_profile)
    ));
    const imagesAmount = 1;
    if (labels.length === 0) {
      createAlert('danger', 'Error: Training not available due to there are not students registered yet!');
      return [];
    }
    return Promise.all(
      labels.map(async (label, index) => {
        const descriptions = [];
        // eslint-disable-next-line
        for (let i = 1; i <= imagesAmount; i++) {
          // eslint-disable-next-line
          const img = await faceapi.fetchImage(URL_DJANGO_SERVER + images[index]);
          // eslint-disable-next-line
          const facesRecognized = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
          descriptions.push(facesRecognized.descriptor);
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      }),
    );
  };

  const loadLabeledImagesAsync = async () => {
    setLabeledImages(await loadLabeledImages());
  };

  useEffect(() => {
    const date = new Date();
    const today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    if (JSON.stringify(labeledImages)[0] === '[') {
      const json = {
        faces_encoding: JSON.stringify(labeledImages),
        last_training_date: today,
        classroom_id: currentClassroomId.classroomId,
      };
      fetch('http://127.0.0.1:8000/api/faces_encoding/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(json),
      })
        .then((data) => data.json())
        .then((data) => {
          if (data.last_training_date) {
            createAlert('success', `Faces Encodes have been registered at ${data.last_training_date}`);
          }
        })
        .catch((error) => createAlert('danger', `Error: ${error}`));
    }
  }, [labeledImages]);

  const loadModels = async () => {
    const MODEL_URL = `${process.env.PUBLIC_URL}/models`;
    // eslint-disable-next-line
    Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]).then(createAlert('success', 'Machine Learning Models were loaded successfully!'));
  };

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <section>
      <h1>Students</h1>
      <br />
      <label htmlFor="classroom-list">
        Select Classroom:
        <select name="classroom-list" defaultValue={null} onChange={inputSelected}>
          {
            (allClassroomsAvailables && ClassroomsOptions(allClassroomsAvailables))
          }
        </select>
        {
          currentClassroom && (
            <button type="button" onClick={showingStudents}>Show students</button>
          )
        }
      </label>
      {
        allStudentFromClassroom && tableSTudents()
      }
      <div className="d-flex justify-content-evenly w-100">
        <button
          type="button"
          data-bs-toggle="modal"
          data-bs-target="#formModalStudents"
        >
          Create New Student
        </button>
        {
          allStudentFromClassroom && (
            <button type="button" onClick={loadLabeledImagesAsync}>
              Train Model For
              {
                ` ${currentClassroom.classroom}`
              }
            </button>
          )
        }
      </div>
      {
        formToCreateStudent()
      }
    </section>
  );
};

Student.propTypes = {
  createAlert: PropTypes.func.isRequired,
};

export default Student;
