import { Navbar, Nav, Container } from "react-bootstrap";
import "./Navbar.scss";

function Navbars1() {
  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand className="Nabvar-Brand">&nbsp; Trading Bot</Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default Navbars1;
