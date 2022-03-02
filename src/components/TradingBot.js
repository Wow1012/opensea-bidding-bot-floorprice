import React from "react";

//import Web3, OpenSea
import * as Web3 from "web3";
import { OpenSeaPort, Network } from "opensea-js";
import HDWalletProvider from "@truffle/hdwallet-provider";
import { OrderSide } from "opensea-js/lib/types";
import { ethers } from "ethers";
import axios from "axios";
import { parse, stringify } from "flatted/cjs";

//import Component
import { Table, Container, Form, Button, Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactLoading from "react-loading";

//import CSS
import "./TradingBot.scss";

const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
const WALLET_ADDRESS = process.env.REACT_APP_WALLET_ADDRESS;
const PROVIDER_OR_URL = process.env.REACT_APP_PROVIDER_OR_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

class TradingBot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      duration: 2,
      step: 0.0000001,
      difference: 10,
      intervalTime: 60000,
      seaport: "",
      accountAddress: WALLET_ADDRESS,
      contractAddress: "",
      tokenid: "",
      data: [
        {
          title: "",
          listUrl: "",
          topListingPrice: 0,
          topOfferingPrice: 0,
          topOfferAddress: "",
          schemaName: "",
          bidPrice: 0,
          bidable: false,
          status: false,
        },
      ],
    };
  }

  onHandleChange = (e, index) => {
    let data = this.state.data;
    let temp = data[index];
    temp.listUrl = e.target.value;
    data[index] = temp;
    this.setState({ data: data });
  };

  onExpirationTimeChange = (e) => {
    this.setState({ duration: e.target.value });
  };

  onDifferenceChange = (e) => {
    this.setState({ difference: e.target.value });
  };

  onNewRow = () => {
    //insert new row
    let temp;
    temp = this.state.data;
    temp.push({
      title: "",
      listUrl: "",
      topListingPrice: 0,
      topOfferingPrice: 0,
      topOfferAddress: "",
      schemaName: "0",
      bidPrice: 0,
      bidable: false,
      status: false,
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

  setSchemaName = (schemaName, index) => {
    let temp;
    temp = this.state.data;
    temp[index].schemaName = schemaName;
    this.setState({
      data: temp,
    });
  };

  setBuyPrice = (sellOrders, index) => {
    let temp;
    temp = this.state.data;
    temp[index].topListingPrice = 0;

    let offerPrices,
      offerPricesArray = [];
    offerPrices = sellOrders;

    offerPrices.forEach((offerPrice) => {
      if (
        offerPrice.paymentTokenContract.symbol == "WETH" ||
        offerPrice.paymentTokenContract.symbol == "ETH"
      ) {
        let priceWETH = offerPrice.basePrice
          .div(Math.pow(10, 18) * offerPrice.quantity.toNumber())
          .toNumber();
        offerPricesArray.push(priceWETH);
      }
    });

    offerPricesArray.sort(function (a, b) {
      return a - b;
    });

    offerPricesArray.forEach((offerPrice, i) => {
      if (i == 0) temp[index].topListingPrice = offerPrice;
      else return;
    });

    this.setState({
      data: temp,
    });
  };

  setOfferPrice = (buyOrders, index) => {
    let temp;
    temp = this.state.data;
    temp[index].topOfferingPrice = 0;
    temp[index].topOfferAddress = "";

    let offerPrices,
      offerPricesArray = [];
    offerPrices = buyOrders;

    offerPrices.forEach((offerPrice) => {
      if (
        offerPrice.paymentTokenContract.symbol == "WETH" ||
        offerPrice.paymentTokenContract.symbol == "ETH"
      ) {
        let priceWETH = offerPrice.basePrice
          .div(Math.pow(10, 18) * offerPrice.quantity.toNumber())
          .toNumber();
        offerPricesArray.push({ price: priceWETH, address: offerPrice.maker });
      }
    });

    // offerPricesArray.sort((a, b) => (a.price > b.price ? -1 : 1));

    offerPricesArray.forEach((offerPrice, i) => {
      if (i == 0) {
        temp[index].topOfferingPrice = offerPrice.price;
        temp[index].topOfferAddress = offerPrice.address;
      } else return;
    });

    this.setState({
      data: temp,
    });
  };

  setBidPrice = (index) => {
    let temp;
    temp = this.state.data;
    temp[index].bidPrice = 0;
    temp[index].bidPrice =
      (temp[index].topOfferingPrice * 10000000 + 1) / 10000000.0;
    temp[index].bidable = true;

    console.log(temp[index].topOfferAddress, WALLET_ADDRESS);
    if (
      temp[index].bidPrice >=
        (temp[index].topListingPrice * (100 - this.state.difference)) / 100.0 ||
      temp[index].topOfferAddress.toLowerCase() == WALLET_ADDRESS.toLowerCase()
    ) {
      temp[index].bidPrice = 0;
      temp[index].bidable = false;
    } else {
      this.sendOffer(index);
    }

    if (temp[index].status == false) {
      temp[index].status = true;
      setInterval(() => {
        if (temp[index].listURL) this.onGetData(index);
      }, this.state.intervalTime);
    }

    this.setState({
      data: temp,
    });
  };

  sendOffer = async (index) => {
    try {
      const offer = await this.state.seaport.createBuyOrder({
        asset: {
          tokenId: this.state.tokenid,
          tokenAddress: this.state.contractAddress,
          schemaName: this.state.data[index].schemaName,
        },
        accountAddress: this.state.accountAddress,
        // Value of the offer, in units of the payment token (or wrapped ETH if none is specified):
        startAmount: this.state.data[index].bidPrice,
        expirationTime: Math.round(
          Date.now() / 1000 + 60 * 60 * this.state.duration
        ), // One day from now
      });
    } catch (err) {}
  };

  onGetData = async (index) => {
    try {
    } catch (err) {
      console.log(err);
      toast.error("Check OpenSea Listing", { theme: "dark" });
    }
  };

  onSubmit = async (index) => {
    try {
      await this.setContractAddressTokenId(this.state.data[index].listUrl);
    } catch (err) {}

    try {
      const asset = await this.state.seaport.api.getAsset({
        tokenAddress: this.state.contractAddress,
        tokenId: this.state.tokenid,
      });
      console.log(asset);

      await this.sendOffer(index);
    } catch (err) {
      console.log(err);
      toast.error("Check OpenSea Listing", { theme: "dark" });
    }
  };

  onSubmitAll = async () => {
    this.state.data.forEach(async (index) => {
      await setTimeout(() => {
        this.onSubmit(index);
      }, 1000);
    });
  };

  createSeaPort = () => {
    let provider = new HDWalletProvider(PRIVATE_KEY, PROVIDER_OR_URL);

    const seaport = new OpenSeaPort(provider, {
      networkName: Network.Main,
      apiKey: API_KEY,
    });

    this.setState({ seaport: seaport });
  };

  onWaiting = () => {
    this.state.data.forEach((data, index) => {
      setTimeout(() => {
        if (data[index].listUrl) this.onSubmit(index);
      }, 1000);
    });
  };

  connectWallet = () => {
    let web3;
    if (window.ethereum) {
      window.ethereum.enable();
      web3 = new Web3(window.ethereum);
    }
    //  else {
    //   toast.error(
    //     "You need an Ethereum wallet to interact with this marketplace. Unlock your wallet, get MetaMask.io or Portis on desktop, or get Trust Wallet or Coinbase Wallet on mobile.",
    //     { theme: "dark" }
    //   );
    // }
    // web3.eth.getAccounts().then(async (addr) => {
    //   this.setState({ accountAddress: addr[0] });
    // });
  };

  componentDidMount() {
    this.connectWallet();
    // this.createSeaPort();
  }

  render() {
    return (
      <Container>
        <Table striped bordered hover bg="dark" className="Sheet-Table">
          <thead>
            <tr>
              <th width="20%">Success Wallet Address</th>
              <th>Buy Transactions</th>
              <th>Selling Transactions</th>
              <th>My Buy Transactions</th>
              <th>My Selling Transactions</th>
            </tr>
          </thead>
          <tbody>
            {this.state.data.map((item, index) => {
              return (
                <tr background-color="#2c3034" key={index}>
                  <td word-break="all" width="*">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="listUrl"
                      onKeyDown={(e) => {
                        if (e.keyCode == 13) this.onGetData();
                      }}
                    />
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              );
            })}
          </tbody>
        </Table>
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

export default TradingBot;
