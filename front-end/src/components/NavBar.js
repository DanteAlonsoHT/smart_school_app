import React, { useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NavLink } from 'react-router-dom';
// import NavBarStyle from './NavBar.module.css';
import AuthContext from '../context/Context';

const NavBar = () => {
  const { token } = useContext(AuthContext);

  const NavBarNotAuthenticated = () => (
    <div className="container">
      <nav className="navbar fixed-top navbar-expand-md navbar-dark" style={{ backgroundColor: '#2E3047' }}>
        <div className="container">
          <a className="navbar-brand text-light" href="/">SMART SCHOOL</a>
          <button className="navbar-toggler me-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNavAltMarkup">
            <div className="navbar-nav d-flex justify-content-end">
              <NavLink key={uuidv4()} to="/login" className="nav-link" aria-current="page">Login</NavLink>
              <NavLink key={uuidv4()} to="/signup" className="nav-link">Sign up</NavLink>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );

  const NavBarAuthenticated = () => (
    <div className="container">
      <nav className="navbar fixed-top navbar-expand-md navbar-dark" style={{ backgroundColor: '#2E3047' }}>
        <div className="container">
          <a className="navbar-brand text-light" href="/">SMART SCHOOL</a>
          <button className="navbar-toggler me-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNavAltMarkup">
            <div className="navbar-nav d-flex justify-content-end">
              <NavLink key={uuidv4()} to="/home" className="nav-link" aria-current="page">Home</NavLink>
              <NavLink key={uuidv4()} to="/classrooms" className="nav-link">Classrooms</NavLink>
              <NavLink key={uuidv4()} to="/students" className="nav-link">Students</NavLink>
              <NavLink key={uuidv4()} to="/profile" className="nav-link">Profile</NavLink>
              <NavLink key={uuidv4()} to="/attendance" className="nav-link">Attendance</NavLink>
              <NavLink key={uuidv4()} to="/logout" className="nav-link">Log out</NavLink>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    token ? NavBarAuthenticated() : NavBarNotAuthenticated()
  );
};

export default NavBar;
