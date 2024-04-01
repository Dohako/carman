import './App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const client = axios.create({
  baseURL: "http://127.0.0.1:8000"
});

function App() {

  const [currentUser, setCurrentUser] = useState();
  const [registrationToggle, setRegistrationToggle] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cars, setCars] = useState([]);
  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [carColor, setCarColor] = useState('');
  const [carLicensePlate, setCarLicensePlate] = useState('');
  const [carVIN, setCarVIN] = useState('');


  const handleSubmit = (event) => {
    const token = localStorage.getItem('access_token');
    console.log(token);
    if (token && currentUser) {
      event.preventDefault();
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      client.post(
        '/api/add_car', 
        {
          id: currentUser.id, 
          make: carMake, 
          model: carModel, 
          year: carYear,
          color: carColor,
          license_plate: carLicensePlate,
          vin: carVIN
        }
      )
      .then(function(res) {
        console.log(res.data);
        setCars([...cars, res.data]);
      })
      .catch(function(error) {
        console.error(error);
      });
    } 
    else {
      alert("Please log in to add a car");
    }
  };


  useEffect(() => {
    console.log(currentUser);
    const token = localStorage.getItem('access_token');
    console.log(token);
    if (token && currentUser) {
      console.log()
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      client.get(`/api/cars/${currentUser.id}`)
      .then(function(res) {
        console.log("/api/cars/")
        console.log(res.data);
        setCars(res.data);
      })
      .catch(function(error) {
        console.error(error);
      });
    }
  }, [currentUser]);

  function update_form_btn() {
    if (registrationToggle) {
      document.getElementById("form_btn").innerHTML = "Register";
      setRegistrationToggle(false);
    } else {
      document.getElementById("form_btn").innerHTML = "Log in";
      setRegistrationToggle(true);
    }
  }

  function submitRegistration(e) {
    e.preventDefault();
    client.post(
      "/api/register",
      {
        email: email,
        username: username,
        password: password
      }
    ).then(function(res) {
      client.post(
        "/api/login",
        {
          email: email,
          password: password
        }
      ).then(function(res) {
        localStorage.setItem('access_token', res.data.access);
        setCurrentUser(res.data);
      }).catch(function(error) {
        console.error(error);
      });
    });
  }

  function submitLogin(e) {
    e.preventDefault();
    console.log('Logging in');
    client.post(
      "/api/login",
      {
        email: email,
        password: password
      },
    ).then(function(res) {
      console.log('Logged in');
      console.log(res.data);
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh)
      setCurrentUser(res.data);
    }).catch(function(error) {
      console.error(error);
    });
  }

  function submitLogout(e) {
    e.preventDefault();
    client.post(
      "/api/logout",
    ).then(function(res) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token')
      setCurrentUser(null);
    });
  }

  function refreshToken() {
    client.post(
      "/api/token/refresh",
      {
        refresh: localStorage.getItem('refresh_token')
      }
    ).then(function(res) {
      localStorage.setItem('access_token', res.data.access);
    }).catch(function(error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      console.error(error);
    });
  }

  if (localStorage.getItem('access_token')) {

    if (!currentUser) {
      const token = localStorage.getItem('access_token');
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      client.get("/api/user")
      .then(function(res) {
        console.log('/api/user');
        console.log(res.data);
        setCurrentUser(res.data.user);
        setCars(res.data.cars);
      })
      .catch(function(error) {
        if (error.response.status === 401) {
          refreshToken();
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          console.error(error);
        }
      });
    }
    return (
      <div>
        <div>
          <Navbar bg="dark" variant="dark">
            <Container>
              <Navbar.Brand>Carman</Navbar.Brand>
              <Navbar.Toggle />
              <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                  <div className="navbar-text-container">
                    <p className="navbar-username">Hello, {currentUser ? currentUser.username : ''}</p>
                    <form onSubmit={e => submitLogout(e)}>
                      <Button type="submit" variant="light">Log out</Button>
                    </form>
                  </div>
                </Navbar.Text>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </div>
        <div className='container'>
          <div>
            <Form onSubmit={handleSubmit} className='car-form'>
              <Form.Control type="text" placeholder="make" value={carMake} onChange={e => setCarMake(e.target.value)} required/>
              <Form.Control type="text" placeholder="model" value={carModel} onChange={e => setCarModel(e.target.value)} required/>
              <Form.Select onChange={e => setCarYear(e.target.value)} required>
                <option value="">Select Year</option>
                {Array.from({length: 2022 - 1885}, (_, i) => 2022 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Form.Select>
              <Form.Control type="text" placeholder="color" value={carColor} onChange={e => setCarColor(e.target.value)} required/>
              <Form.Control type="text" placeholder="license plate" value={carLicensePlate} onChange={e => setCarLicensePlate(e.target.value)} required/>
              <Form.Control type="text" placeholder="VIN" value={carVIN} onChange={e => setCarVIN(e.target.value)} required/>
              <Button variant="primary" type="submit">
                Add car
              </Button>
            </Form>
          </div>
          <table>
            <thead>
              <tr>
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {console.log("cars in table: ")}
              {console.log(cars)}
              {console.log(Array.isArray(cars))}
              {Array.isArray(cars) ? cars.map((car, index) => (
                <tr key={index}>
                  <td>{car.make}</td>
                  <td>{car.model}</td>
                  <td>{car.year}</td>
                  <td>
                    <button>Delete</button>
                    <button>Edit</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4">No cars available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  return (
    <div>
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand>Carman</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            <Button id="form_btn" onClick={update_form_btn} variant="light">Register</Button>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    {
      registrationToggle ? (
        <div className="center">
          <Form onSubmit={e => submitRegistration(e)} className='login-form'>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} />
              <Form.Text className="text-muted">
                We'll never share your email with anyone else.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </div>        
      ) : (
        <div className="center">
          <Form onSubmit={e => submitLogin(e)} className='login-form'>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} />
              <Form.Text className="text-muted">
                We'll never share your email with anyone else.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </div>
      )
    }
    </div>
  );
}

export default App;
