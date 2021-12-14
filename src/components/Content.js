import React from "react";
import {
  Table,
  Container,
  Form,
  FormControl,
  InputGroup,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import "./Content.scss";
import * as Web3 from "web3";
import { OpenSeaPort, Network } from "opensea-js";
import { OrderSide } from "opensea-js/lib/types";

function Content() {
  const [formData, setFormData] = React.useState({
    contractaddress: "0x60e4d786628fea6478f785a6d7e704777c86a7c6",
    tokenid: "2127",
    offerprice1: 0,
    offerprice2: 0,
    offerprice3: 0,
    duration1: 0,
    duration2: 0,
    duration3: 0,
  });

  const [nowPrice1st, setNowPrice1st] = React.useState(0);
  const [nowPrice2nd, setNowPrice2nd] = React.useState(0);
  const [offeringPrice1st, setOfferingPrice1st] = React.useState(0);
  const [offeringPrice2nd, setOfferingPrice2nd] = React.useState(0);
  const [offeringPrice3rd, setOfferingPrice3rd] = React.useState(0);

  const [provider, setProvider] = React.useState();
  const [seaport, setSeaport] = React.useState();
  const [accountAddress, setAccountAddress] = React.useState(
    "0x60155080dfF547D9505281ECa95CC7b5619D4f98"
  );

  async function connectWallet() {
    if (window.ethereum) {
      window.ethereum.enable();
    } else {
      const errorMessage =
        "You need an Ethereum wallet to interact with this marketplace. Unlock your wallet, get MetaMask.io or Portis on desktop, or get Trust Wallet or Coinbase Wallet on mobile.";
      alert(errorMessage);
      throw new Error(errorMessage);
    }
  }

  React.useEffect(() => {
    const provider = new Web3.providers.HttpProvider(
      "https://mainnet.infura.io"
    );
    const seaport = new OpenSeaPort(provider, {
      networkName: Network.Main,
      apiKey: "",
    });

    connectWallet();

    setProvider(provider);
    setSeaport(seaport);
  }, []);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    const asset = await seaport.api.getAsset({
      tokenAddress: formData.contractaddress,
      tokenId: formData.tokenid,
    });

    console.log(asset);

    // const { orders, count } = await seaport.api.getOrders({
    //   asset_contract_address: formData.contractaddress,
    //   token_id: formData.tokenid,
    //   side: OrderSide.Buy,
    // });

    // console.log(orders);

    const offer = await seaport.createBuyOrder({
      asset: {
        tokenId: formData.tokenid,
        tokenAddress: formData.contractaddress,
      },
      accountAddress,
      // Value of the offer, in units of the payment token (or wrapped ETH if none is specified):
      startAmount: 0.0001,
    });

    console.log(offer);
  };

  return (
    <Container>
      <Form className="Content-Form">
        <Form.Label htmlFor="basic-url">OpenSea Listing</Form.Label>
        <InputGroup className="mb-3">
          <InputGroup.Text>https://opensea.io/assets/</InputGroup.Text>
          <FormControl
            aria-label="Contract Address"
            placeholder="Contract Address"
            name="contractaddress"
            value={formData.contractaddress}
            onChange={onChange}
          />
          <InputGroup.Text>/</InputGroup.Text>
          <FormControl
            aria-label="Tocken ID"
            placeholder="Tocken ID"
            name="tokenid"
            value={formData.tokenid}
            onChange={onChange}
          />
        </InputGroup>
      </Form>
      <Table striped bordered hover variant="dark" className="Content-Table">
        <thead>
          <tr>
            <th>Buy Now Price 1st</th>
            <th>Buy Now Price 2nd</th>
            <th>Offering Price 1st</th>
            <th>Offering Price 2nd</th>
            <th>Offering Price 3rd</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{nowPrice1st}</td>
            <td>{nowPrice2nd}</td>
            <td>{offeringPrice1st}</td>
            <td>{offeringPrice2nd}</td>
            <td>{offeringPrice3rd}</td>
          </tr>
        </tbody>
      </Table>

      <Form className="Content-Form">
        <Row className="mb-3">
          <Form.Group as={Col}>
            <Form.Label>My Offer Price 1</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                type="number"
                placeholder="My Offer Price 1"
                min="0"
                name="offerprice1"
                value={formData.offerprice1}
                onChange={onChange}
              />
              <InputGroup.Text>ETH</InputGroup.Text>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Duration</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                type="number"
                placeholder="Duration"
                min="0"
                name="duration1"
                value={formData.duration1}
                onChange={onChange}
              />
              <InputGroup.Text>hour</InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col}>
            <Form.Label>My Offer Price 2</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                type="number"
                placeholder="My Offer Price 2"
                min="0"
                name="offerprice2"
                value={formData.offerprice2}
                onChange={onChange}
              />
              <InputGroup.Text>ETH</InputGroup.Text>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Duration</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                type="number"
                placeholder="Duration"
                min="0"
                name="duration2"
                value={formData.duration2}
                onChange={onChange}
              />
              <InputGroup.Text>hour</InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col}>
            <Form.Label>My Offer Price 3</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                type="number"
                placeholder="My Offer Price 3"
                value={formData.offerprice3}
                min="0"
                name="offerprice3"
                onChange={onChange}
              />
              <InputGroup.Text>ETH</InputGroup.Text>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Duration</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                type="number"
                placeholder="Duration"
                min="0"
                name="duration3"
                value={formData.duration3}
                onChange={onChange}
              />
              <InputGroup.Text>hour</InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Row>

        <Button variant="primary" onClick={onSubmit}>
          Submit
        </Button>
      </Form>
    </Container>
  );
}

export default Content;
