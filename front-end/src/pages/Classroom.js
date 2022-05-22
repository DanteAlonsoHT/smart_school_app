/* eslint-disable no-console, jsx-a11y/label-has-associated-control */
import {
  useState, useContext, useRef,
} from 'react';
import { PropTypes } from 'prop-types';
import AuthContext from '../context/Context';

const Classroom = ({ createAlert }) => {
  const [credentials, setCredentials] = useState({
    credentials: {
      name: null,
      grade: null,
      shift: null,
      generation: null,
    },
  });
  const { token } = useContext(AuthContext);
  const { allClassroomsAvailables } = useContext(AuthContext);
  const [classrooms, setClassrooms] = useState(allClassroomsAvailables);
  const [grades, setGrades] = useState([]);

  const textInput = useRef();
  const text2Input = useRef();
  const selectInput = useRef();
  const numberInput = useRef();
  const tableBody = useRef();
  const closeModelRef = useRef();
  const dropDownRef = useRef();

  const inputChanged = (event) => {
    const credentialMock = credentials.credentials;
    if (selectInput.current.name === event.target.name) {
      const valueTarget = parseInt(event.target.value, 10);
      console.log(parseInt(valueTarget, 10));
      if (valueTarget !== 0 && valueTarget !== 1 && valueTarget !== 2) {
        event.target.setCustomValidity('Must select a valid value');
      } else {
        event.target.setCustomValidity('');
        credentialMock.shift = valueTarget;
        setCredentials({ credentials: credentialMock });
      }
    } else if (text2Input.current.name === event.target.name) {
      const valueTarget = event.target.value;
      if (valueTarget.length !== 9) {
        event.target.setCustomValidity('Type a valid generation format');
      } else {
        event.target.setCustomValidity('');
        credentialMock.generation = valueTarget;
        setCredentials({ credentials: credentialMock });
      }
    } else if (textInput.current.name === event.target.name) {
      credentialMock.name = event.target.value;
      setCredentials({ credentials: credentialMock });
    } else if (numberInput.current.name === event.target.name) {
      credentialMock.grade = parseInt(event.target.value, 10);
      setCredentials({ credentials: credentialMock });
    }
  };

  const createClassroom = (event) => {
    event.preventDefault();
    closeModelRef.current.click();
    fetch('http://127.0.0.1:8000/api/classrooms/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(credentials.credentials),
    })
      .then((data) => data.json())
      .then((data) => {
        createAlert('success', 'Classroom has been created successfully!');
        console.log(data);
      })
      .catch((error) => {
        createAlert('danger', error.toString());
        closeModelRef.current.click();
      });
  };

  // eslint-disable-next-line
  const formToCreateClassroom = () => {
    return (
      <form
        onSubmit={createClassroom}
        id="formModal"
        className="modal fade"
        tabIndex="-1"
        aria-labelledby="formModalLabel"
        aria-hidden="true"
      >
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
              <label htmlFor="name" className="d-block mx-auto">
                Name:
                <input
                  type="text"
                  name="name"
                  onChange={inputChanged}
                  ref={textInput}
                  required
                />
              </label>
              <br />
              <label htmlFor="grade" className="d-block mx-auto">
                Grade (1-11):
                <input
                  type="number"
                  name="grade"
                  onChange={inputChanged}
                  ref={numberInput}
                  min={0}
                  max={11}
                  step={1}
                  required
                />
              </label>
              <br />
              <label htmlFor="shift" className="d-block mx-auto">
                Shift:
                <select name="shift" required onChange={inputChanged} ref={selectInput}>
                  <option value selected>---------</option>
                  <option value={0}>Morning Shift</option>
                  <option value={1}>Afternoon Shift</option>
                  <option value={2}>Double Shift</option>
                </select>
              </label>
              <br />
              <label htmlFor="generation" className="d-block mx-auto">
                Generation (sample 2018-2022):
                <input
                  type="text"
                  name="generation"
                  onChange={inputChanged}
                  ref={text2Input}
                  required
                />
              </label>
            </div>
            <div className="modal-footer py-3 px-3 d-flex justify-content-evenly">
              <button type="submit">Create classroom</button>
              <button type="button" data-bs-dismiss="modal">Cancel</button>
            </div>
          </div>
        </div>
      </form>
    );
  };

  const bodyTableClassrooms = (classrooms) => (
    classrooms ? (
      classrooms.map((classroom) => (
        <tr key={`tr-key-${classroom.name}`}>
          <td key={classroom.name} className="px-5">
            {
              classroom.name
            }
          </td>
          <td className="px-5">
            {
              classroom.grade
            }
          </td>
          <td className="px-5">
            {
              classroom.shift === 0 && ('Morning')
            }
            {
              classroom.shift === 1 && ('Afternoon')
            }
            {
              classroom.shift === 2 && ('Double')
            }
          </td>
          <td className="px-5">
            {
              classroom.generation
            }
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td>
          Loading clasrooms...
        </td>
      </tr>
    )
  );

  const arrayRemove = (arr, value) => (
    arr.filter((ele) => (
      ele !== value
    ))
  );

  const searchByName = (event) => {
    let classroomFiltered = allClassroomsAvailables;
    if (event.target.name === 'searcher') {
      classroomFiltered = allClassroomsAvailables.filter(
        (classroom) => classroom.name.includes(event.target.value),
      );
    } else if (event.target.id.includes('btncheck')) {
      let allGrades = grades;
      if (event.target.checked === true) {
        allGrades = allGrades.concat(parseInt(event.target.id.replace('btncheck', ''), 10));
        setGrades(allGrades);
      } else {
        allGrades = arrayRemove(allGrades, parseInt(event.target.id.replace('btncheck', ''), 10));
        setGrades(allGrades);
      }
      classroomFiltered = classroomFiltered.filter(
        (classroom) => allGrades.includes(parseInt(classroom.grade, 10)),
      );
    }
    setClassrooms(classroomFiltered);
  };

  const filterClassroomsButtons = () => (
    <div className="container">
      <label htmlFor="searcher" className="col-6 col-md-3 my-1">
        <input name="searcher" placeholder="Search by name" className="btn btn-outline-secondary text-center width-fit rounded-pill" onChange={searchByName} />
      </label>
      <div className="btn-group col-6 col-md-3 my-1" role="group">
        <button id="btnGroupDrop1" type="button" className="btn btn-outline-secondary dropdown-toggle width-fit rounded-pill" data-bs-toggle="dropdown" aria-expanded="false" ref={dropDownRef}>
          Grade
        </button>
        <ul className="dropdown-menu ps-4" aria-labelledby="btnGroupDrop1">
          {
            [...Array(4).keys()].map((i) => (
              <div className="btn-group-vertical position-relative" key={`vertical-group-${i}`}>
                {
                  [...Array(3).keys()].map((j) => (
                    <>
                      <input type="checkbox" className="btn-check w-100" id={'btncheck'.concat((3) * (i) + (j + 1))} autoComplete="off" onClick={() => dropDownRef.current.click()} onChange={searchByName} />
                      <label className="btn btn-outline-secondary p-1 px-2" htmlFor={'btncheck'.concat((3) * (i) + (j + 1))}>{(3) * (i) + (j + 1)}</label>
                    </>
                  ))
                }
              </div>
            ))
          }
        </ul>
      </div>
      <div className="btn-group col-6 col-md-3 my-1" role="group">
        <button id="btnGroupDrop2" type="button" className="btn btn-outline-secondary dropdown-toggle width-fit rounded-pill" data-bs-toggle="dropdown" aria-expanded="false">
          Shift
        </button>
        <ul className="dropdown-menu border-none ps-5" aria-labelledby="btnGroupDrop2">
          <div className="btn-group-vertical position-relative" key="vertical-group-shift">
            <input type="checkbox" className="btn-check w-100" id="btncheck-morning" autoComplete="off" />
            <label className="btn btn-outline-secondary" htmlFor="btncheck-morning">Morning</label>
            <input type="checkbox" className="btn-check w-100" id="btncheck-afternoon" autoComplete="off" />
            <label className="btn btn-outline-secondary" htmlFor="btncheck-afternoon">Afternoon</label>
            <input type="checkbox" className="btn-check w-100" id="btncheck-double" autoComplete="off" />
            <label className="btn btn-outline-secondary" htmlFor="btncheck-double">Double</label>
          </div>
        </ul>
      </div>
      <div className="btn-group col-6 col-md-3 my-1" role="group">
        <button id="btnGroupDrop3" type="button" className="btn btn-outline-secondary dropdown-toggle width-fit rounded-pill" data-bs-toggle="dropdown" aria-expanded="false">
          Generation
        </button>
        <ul className="dropdown-menu" aria-labelledby="btnGroupDrop3">
          <div className="btn-group-vertical position-relative" key="vertical-group-generation">
            <div className="input-group input-group-sm mb-3">
              <span className="input-group-text py-1" id="inputGroup-sizing-sm" style={{ margin: '0.5rem 0' }}>From</span>
              <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" />
            </div>
            <div className="input-group input-group-sm mb-3">
              <span className="input-group-text py-1" id="inputGroup-sizing-sm2" style={{ margin: '0.5rem 0' }}>To</span>
              <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" />
            </div>
          </div>
        </ul>
      </div>
    </div>
  );

  return (
    <section>
      <h1>Classrooms</h1>
      {
        filterClassroomsButtons()
      }
      <table cellPadding={0} cellSpacing={0}>
        <thead>
          <tr>
            <th>Classroom</th>
            <th>Grade</th>
            <th>Shift</th>
            <th>Generation</th>
          </tr>
        </thead>
        <tbody ref={tableBody}>
          {
            bodyTableClassrooms(classrooms)
          }
        </tbody>
      </table>
      <button
        type="button"
        data-bs-toggle="modal"
        data-bs-target="#formModal"
      >
        Create New Classroom
      </button>
      {
        formToCreateClassroom()
      }
    </section>
  );
};

Classroom.propTypes = {
  createAlert: PropTypes.func.isRequired,
};

export default Classroom;
