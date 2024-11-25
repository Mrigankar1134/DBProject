import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

const CustomNavbar = () => {
  const location = useLocation(); // Get the current route path

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        {/* Brand Name */}
        <Navbar.Brand as={Link} to="/">
          <strong>Supermarket Dashboard</strong>
        </Navbar.Brand>

        {/* Toggler for Mobile */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        {/* Navbar Links */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={location.pathname === "/" ? "active" : ""}
            >
              Dashboard
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/data-management" 
              className={location.pathname === "/data-management" ? "active" : ""}
            >
              Data Management
            </Nav.Link>

            {/* Dropdown Example */}
            {/* <NavDropdown title="More" id="basic-nav-dropdown" align="end">
              <NavDropdown.Item as={Link} to="/settings">
                Settings
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/profile">
                Profile
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#logout">Logout</NavDropdown.Item>
            </NavDropdown> */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;