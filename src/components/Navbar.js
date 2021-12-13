import { Navbar, Nav, Container } from "react-bootstrap";
import "./Navbar.scss";

function Navbars() {
  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand className="Nabvar-Brand">
          OpenSea Bidding Bot
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default Navbars;
