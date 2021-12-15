import React from "react";

//import Web3, OpenSea
import * as Web3 from "web3";
import { OpenSeaPort, Network } from "opensea-js";
import HDWalletProvider from "@truffle/hdwallet-provider";

//import Component
import {
  Table,
  Container,
  Form,
  FormControl,
  InputGroup,
  Row,
  Col,
  Button,
  Image,
  Badge,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//import CSS
import "./BidTable.scss";

const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
const WALLET_ADDRESS = process.env.REACT_APP_WALLET_ADDRESS;
const PROVIDER_OR_URL = process.env.REACT_APP_PROVIDER_OR_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

class BidTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      intervalTime: 3000,
      seaport: "",
      accountAddress: WALLET_ADDRESS,
      contractAddress: "",
      tokenId: "",
      data: [
        {
          title: "",
          listUrl: "",
          nowPrice1st: 0,
          nowPrice2nd: 0,
          offeringPrice1st: 0,
          offeringPrice2nd: 0,
          offeringPrice3rd: 0,
          formData: {
            myofferprice1: 0,
            duration1: 0,
            myofferprice2: 0,
            duration2: 0,
            myofferprice3: 0,
            duration3: 0,
          },
        },
      ],
    };
  }

  onHandleChange = (e, index) => {
    let data = this.state.data;
    let temp = data[index];
    if (e.target.name === "listUrl") {
      temp.listUrl = e.target.value;
    } else {
      temp.formData[e.target.name] = e.target.value;
    }
    data[index] = temp;
    this.setState({ data: data });
  };

  onNewRow = () => {
    //insert new row
    let temp;
    temp = this.state.data;
    temp.push({
      title: "",
      listUrl: "",
      nowPrice1st: 0,
      nowPrice2nd: 0,
      offeringPrice1st: 0,
      offeringPrice2nd: 0,
      offeringPrice3rd: 0,
      formData: {
        myofferprice1: 0,
        duration1: 0,
        myofferprice2: 0,
        duration2: 0,
        myofferprice3: 0,
        duration3: 0,
      },
    });
    this.setState({
      data: temp,
    });
  };

  onDeleteRow = (index) => {
    if (this.state.data.length === 1) {
      return;
    }
    let temp = this.state.data.filter((item, i) => i !== index);
    this.setState({ data: temp });
  };

  setContractAddressTokenId = (listURL) => {
    let URL = listURL.replace("https://opensea.io/assets/", "");
    let URLArray = URL.split("/");
    if (URLArray.length == 2) {
      this.setState({ contractAddress: URLArray[0] });
      this.setState({ tokenid: URLArray[1] });
    } else {
      this.setState({ contractAddress: "" });
      this.setState({ tokenid: "" });
    }
  };

  setTitle = (title, index) => {
    let temp;
    temp = this.state.data;
    temp[index].title = title;
    this.setState({
      data: temp,
    });
  };

  setBuyPrice = (sellOrders, index) => {
    let temp;
    temp = this.state.data;
    temp[index].nowPrice1st = 0;
    temp[index].nowPrice2nd = 0;

    let offerPrices,
      offerPricesArray = [];
    offerPrices = sellOrders;

    offerPrices.forEach((offerPrice) => {
      let priceWETH = offerPrice.basePrice
        .div(Math.pow(10, 18) * offerPrice.quantity.toNumber())
        .toNumber();
      offerPricesArray.push(priceWETH);
    });

    offerPricesArray.sort(function (a, b) {
      return a - b;
    });

    offerPricesArray.forEach((offerPrice, i) => {
      if (i == 0) temp[index].nowPrice1st = offerPrice;
      if (i == 1) temp[index].nowPrice2nd = offerPrice;
      if (i >= 2) return;
    });

    this.setState({
      data: temp,
    });
  };

  setOfferPrice = (buyOrders, index) => {
    let temp;
    temp = this.state.data;
    temp[index].offeringPrice1st = 0;
    temp[index].offeringPrice2nd = 0;
    temp[index].offeringPrice3rd = 0;

    let offerPrices,
      offerPricesArray = [];
    offerPrices = buyOrders;

    offerPrices.forEach((offerPrice) => {
      let priceWETH = offerPrice.basePrice
        .div(Math.pow(10, 18) * offerPrice.quantity.toNumber())
        .toNumber();
      offerPricesArray.push(priceWETH);
    });

    offerPricesArray.sort(function (a, b) {
      return b - a;
    });

    offerPricesArray.forEach((offerPrice, i) => {
      if (i == 0) temp[index].offeringPrice1st = offerPrice.toFixed(5);
      if (i == 1) temp[index].offeringPrice2nd = offerPrice.toFixed(5);
      if (i == 2) temp[index].offeringPrice3rd = offerPrice.toFixed(5);
      if (i >= 3) return;
    });

    this.setState({
      data: temp,
    });
  };

  sendOffer1 = async (index) => {
    // Offer 1
    try {
      const offer = await this.state.seaport.createBuyOrder({
        asset: {
          tokenId: this.state.tokenid,
          tokenAddress: this.state.contractAddress,
        },
        accountAddress: this.state.accountAddress,
        // Value of the offer, in units of the payment token (or wrapped ETH if none is specified):
        startAmount: this.state.data[index].formData.myofferprice1,
        expirationTime: Math.round(
          Date.now() / 1000 +
            60 * 60 * this.state.data[index].formData.duration1
        ), // One day from now
      });

      toast.success(`Offer ${index + 1} - 1 : Bid Successfully`, {
        theme: "dark",
      });
    } catch (err) {
      toast.error(`Offer ${index + 1} - 1 : ${err.toString()}`, {
        theme: "dark",
      });
    }
  };

  sendOffer2 = async (index) => {
    // Offer 2
    try {
      const offer = await this.state.seaport.createBuyOrder({
        asset: {
          tokenId: this.state.tokenid,
          tokenAddress: this.state.contractAddress,
        },
        accountAddress: this.state.accountAddress,
        // Value of the offer, in units of the payment token (or wrapped ETH if none is specified):
        startAmount: this.state.data[index].formData.myofferprice2,
        expirationTime: Math.round(
          Date.now() / 1000 +
            60 * 60 * this.state.data[index].formData.duration2
        ), // One day from now
      });

      toast.success(`Offer ${index + 1} - 2 : Bid Successfully`, {
        theme: "dark",
      });
    } catch (err) {
      toast.error(`Offer ${index + 1} - 2 : ${err.toString()}`, {
        theme: "dark",
      });
    }
  };

  sendOffer3 = async (index) => {
    // Offer 3
    try {
      const offer = await this.state.seaport.createBuyOrder({
        asset: {
          tokenId: this.state.tokenid,
          tokenAddress: this.state.contractAddress,
        },
        accountAddress: this.state.accountAddress,
        // Value of the offer, in units of the payment token (or wrapped ETH if none is specified):
        startAmount: this.state.data[index].formData.myofferprice3,
        expirationTime: Math.round(
          Date.now() / 1000 +
            60 * 60 * this.state.data[index].formData.duration3
        ), // One day from now
      });

      toast.success(`Offer ${index + 1} - 3 : Bid Successfully`, {
        theme: "dark",
      });
    } catch (err) {
      toast.error(`Offer ${index + 1} - 3 : ${err.toString()}`, {
        theme: "dark",
      });
    }
  };
  sendOffer = async (index) => {
    await this.sendOffer1(index);
    await setTimeout(() => {
      this.sendOffer2(index);
    }, this.state.intervalTime * 1);
    await setTimeout(() => {
      this.sendOffer3(index);
    }, this.state.intervalTime * 2);
  };

  onSubmit = async (index) => {
    console.log(this.state.data[index]);

    await this.setContractAddressTokenId(this.state.data[index].listUrl);

    try {
      const asset = await this.state.seaport.api.getAsset({
        tokenAddress: this.state.contractAddress,
        tokenId: this.state.tokenid,
      });
      console.log(asset);

      await this.setTitle(asset.assetContract.name, index);
      await this.setOfferPrice(asset.buyOrders, index);
      await this.setBuyPrice(asset.sellOrders, index);
      await this.sendOffer(index);
    } catch (err) {
      console.log(err);
      toast.error("Check OpenSea Listing", { theme: "dark" });
    }
  };

  onSubmitAll = async () => {
    this.state.data.forEach(async (data, index) => {
      await setTimeout(() => {
        this.onSubmit(index);
      }, this.state.intervalTime * 3 * index);
    });
  };

  connectWallet = () => {
    let web3;
    if (window.ethereum) {
      window.ethereum.enable();
      web3 = new Web3(window.ethereum);
    } else {
      toast.error(
        "You need an Ethereum wallet to interact with this marketplace. Unlock your wallet, get MetaMask.io or Portis on desktop, or get Trust Wallet or Coinbase Wallet on mobile.",
        { theme: "dark" }
      );
    }
    web3.eth.getAccounts().then(async (addr) => {
      this.setState({ accountAddress: addr[0] });
    });
  };

  createSeaPort = () => {
    // const provider = new Web3.providers.HttpProvider(
    //   "https://mainnet.infura.io/v3/b628b615b18a4736b508c45cf641bbeb"
    // );

    let provider = new HDWalletProvider(PRIVATE_KEY, PROVIDER_OR_URL);

    const seaport = new OpenSeaPort(provider, {
      networkName: Network.Main,
      apiKey: API_KEY,
    });

    this.setState({ seaport: seaport });
  };

  componentDidMount() {
    this.createSeaPort();
    // this.connectWallet();
  }

  render() {
    return (
      <Container>
        <Table striped bordered hover variant="dark" className="Sheet-Table">
          <thead>
            <tr>
              <th width="30%">OpenSea Listing</th>
              <th width="*">Title</th>
              <th>Listing Price 1st</th>
              <th>Listing Price 2nd</th>
              <th>Offering Price 1st</th>
              <th>Offering Price 2nd</th>
              <th>Offering Price 3rd</th>
              <th>My Offering Price 1st</th>
              <th>During (hours)</th>
              <th>My Offering Price 2nd</th>
              <th>During (hours)</th>
              <th>My Offering Price 3rd</th>
              <th>During (hours)</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.state.data.map((item, index) => {
              return (
                <tr background-color="#2c3034" key={index}>
                  <td word-break="all" width="*">
                    <Form.Control
                      as="textarea"
                      value={item.listUrl}
                      rows={3}
                      name="listUrl"
                      onChange={(e) => this.onHandleChange(e, index)}
                    />
                  </td>
                  <td width="10%">{item.title}</td>
                  <td>{item.nowPrice1st}</td>
                  <td>{item.nowPrice2nd}</td>
                  <td>{item.offeringPrice1st}</td>
                  <td>{item.offeringPrice2nd}</td>
                  <td>{item.offeringPrice3rd}</td>
                  <td>
                    <Form.Control
                      value={item.formData.myofferprice1}
                      name="myofferprice1"
                      onChange={(e) => this.onHandleChange(e, index)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      value={item.formData.duration1}
                      name="duration1"
                      onChange={(e) => this.onHandleChange(e, index)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      value={item.formData.myofferprice2}
                      name="myofferprice2"
                      onChange={(e) => this.onHandleChange(e, index)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      value={item.formData.duration2}
                      name="duration2"
                      onChange={(e) => this.onHandleChange(e, index)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      value={item.formData.myofferprice3}
                      name="myofferprice3"
                      onChange={(e) => this.onHandleChange(e, index)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      value={item.formData.duration3}
                      name="duration3"
                      onChange={(e) => this.onHandleChange(e, index)}
                    />
                  </td>
                  <td>
                    <Button onClick={(e) => this.onSubmit(index)}>
                      Submit
                    </Button>
                  </td>
                  <td>
                    {index + 1 === this.state.data.length ? (
                      <>
                        <Button onClick={() => this.onNewRow()}>Add </Button>
                        {this.state.data.length > 1 && (
                          <Button onClick={() => this.onDeleteRow(index)}>
                            Delete{" "}
                          </Button>
                        )}
                      </>
                    ) : (
                      this.state.data.length > 1 && (
                        <Button onClick={() => this.onDeleteRow(index)}>
                          Delete{" "}
                        </Button>
                      )
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <Button style={{ float: "right" }} onClick={this.onSubmitAll}>
          Submit All
        </Button>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Container>
    );
  }
}

export default BidTable;
