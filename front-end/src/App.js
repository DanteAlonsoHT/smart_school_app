import {
  Route,
  Routes,
} from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import NotMatch from './pages/NotMatch';
import Home from './pages/Home';
import NavBar from './components/NavBar';
import './App.css';
import SignUpPage from './pages/SignUp';
import LoginPage from './pages/Login';
import AuthContext from './context/Context';
import PrivateRoute from './routers/PrivateRoute';
import Attendance from './pages/Attendance';
import LogOutPage from './pages/LogOutPage';
import Classroom from './pages/Classroom';
import Student from './pages/Student';
import Profile from './pages/Profile';
import Alert from './components/Alert';

const iFrameIlegal = document.getElementsByTagName('iframe')[1];

const App = () => {
  const [token, setToken] = useState('');
  const [dataUser, setDataUser] = useState('');
  const [allClassroomsAvailables, setAllClassroomsAvailables] = useState('');
  const [alerts, setAlerts] = useState({
    alertType: '',
    alertMessage: '',
  });

  useEffect(() => {
    if (iFrameIlegal) {
      if (iFrameIlegal.style.width === '100%') {
        iFrameIlegal.style.width = '0';
      }
    }
  }, [iFrameIlegal]);

  const updateDataUser = (newDataUser) => {
    console.log(newDataUser);
    setDataUser(newDataUser);
  };

  const getClassroom = (tok) => {
    fetch('http://127.0.0.1:8000/api/classrooms/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${tok}`,
      },
    })
      .then((data) => data.json())
      .then((data) => setAllClassroomsAvailables(data))
      .catch((error) => console.error('Error', error));
  };

  const userLogin = (tok) => {
    setToken(tok);
    sessionStorage.setItem('userData', JSON.stringify({ token: tok }));
    fetch('http://127.0.0.1:8000/api/users/get_user_data_from_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${tok}`,
      },
      body: JSON.stringify({ token: tok }),
    })
      .then((data) => data.json())
      .then((data) => setDataUser(data))
      .catch((error) => console.error('Error', error));
    getClassroom(tok);
  };

  const userLogOut = () => {
    setToken('');
    sessionStorage.setItem('userData', JSON.stringify(null));
  };

  const createAlert = (alertType, alertMessage) => {
    setAlerts({
      alertType,
      alertMessage,
    });
  };

  useEffect(() => {
    if (JSON.parse(sessionStorage.getItem('userData'))) {
      setToken(JSON.parse(sessionStorage.getItem('userData')).token);
      userLogin(JSON.parse(sessionStorage.getItem('userData')).token);
    }
  }, []);

  useEffect(() => {
    if (alerts.alertMessage) {
      let timer = 0;
      timer = alerts.alertType === 'danger' ? 6000 : 2500;
      setTimeout(() => {
        setAlerts({
          alertType: '',
          alertMessage: '',
        });
      }, timer);
    }
  }, [alerts]);

  return (
    <AuthContext.Provider value={{
      token,
      dataUser,
      allClassroomsAvailables,
    }}
    >
      <NavBar />
      {alerts.alertMessage && (
        <Alert
          alertType={alerts.alertType}
          alertMessage={alerts.alertMessage}
        />
      )}
      <Routes>
        <Route
          path="/"
          element={
            token ? (<Home createAlert={createAlert} />)
              : (<LoginPage userLogin={userLogin} createAlert={createAlert} />)
          }
        />
        <Route
          path="/logout"
          element={
            <LogOutPage userLogOut={userLogOut} createAlert={createAlert} />
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage userLogin={userLogin} createAlert={createAlert} />
          }
        />
        <Route
          path="/signup"
          element={
            <SignUpPage createAlert={createAlert} />
          }
        />
        <Route
          path="/home"
          element={(
            <PrivateRoute>
              <Home createAlert={createAlert} />
            </PrivateRoute>
          )}
        />
        <Route
          path="/classrooms"
          element={(
            <PrivateRoute>
              <Classroom createAlert={createAlert} />
            </PrivateRoute>
          )}
        />
        <Route
          path="/students"
          element={(
            <PrivateRoute>
              <Student createAlert={createAlert} />
            </PrivateRoute>
          )}
        />
        <Route
          path="/profile"
          element={(
            <PrivateRoute>
              <Profile updateDataUser={updateDataUser} createAlert={createAlert} />
            </PrivateRoute>
          )}
        />
        <Route
          path="/attendance"
          element={(
            <PrivateRoute>
              <Attendance createAlert={createAlert} />
            </PrivateRoute>
          )}
        />
        <Route
          path="*"
          element={
            <NotMatch />
          }
        />
      </Routes>
    </AuthContext.Provider>
  );
};

export default App;
