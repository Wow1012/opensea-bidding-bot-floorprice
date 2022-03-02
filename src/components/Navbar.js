import { Navbar, Nav, Container } from "react-bootstrap";
import "./Navbar.scss";

function Navbars() {
  return (
    <Navbar bg="primary" variant="dark">
      <Container>
        <Navbar.Brand className="Nabvar-Brand">
          <img src="opensea.svg" />
          &nbsp; OpenSea Buying Bot v1.0.1
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default Navbars;
