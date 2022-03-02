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
import ReactLoading from "react-loading";
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
      tokenid: "",
      data: [
        {
          title: "",
          floorprice: 1,
          listUrl: "",
          nowPrice1st: 0,
          schemaName: "ERC721",
          working: false,
          timer: "",
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
      temp[e.target.name] = e.target.value;
    }
    data[index] = temp;
    this.setState({ data: data });

    // this.onSaveData();
  };

  onNewRow = () => {
    //insert new row
    let temp;
    temp = this.state.data;
    temp.push({
      title: "",
      floorprice: 1,
      listUrl: "",
      nowPrice1st: 0,
      schemaName: "ERC721",
      working: false,
    });
    this.setState({
      data: temp,
    });

    // this.onSaveData();
  };

  onDeleteRow = (index) => {
    if (this.state.data.length === 1) {
      return;
    }
    let temp = this.state.data.filter((item, i) => i !== index);
    this.setState({ data: temp });

    // this.onSaveData();
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

  setBuyPrice = async (sellOrders, index) => {
    let temp;
    temp = this.state.data;
    temp[index].nowPrice1st = 0;
    temp[index].nowPrice2nd = 0;
    temp[index].working = true;

    let offerPrices,
      offerPricesArray = [];
    offerPrices = sellOrders;

    offerPrices.forEach((offerPrice) => {
      let priceWETH = offerPrice.basePrice
        .div(Math.pow(10, 18) * offerPrice.quantity.toNumber())
        .toNumber();
      offerPricesArray.push(priceWETH);
    });

    // offerPricesArray.sort(function (a, b) {
    //   return a - b;
    // });

    offerPrices.sort((a, b) => (a.price > b.price ? -1 : 1));

    offerPricesArray.forEach((offerPrice, i) => {
      if (i == 0) temp[index].nowPrice1st = offerPrice;
      if (i == 1) temp[index].nowPrice2nd = offerPrice;
      if (i >= 2) return;
    });

    this.setState({
      data: temp,
    });

    if (
      offerPrices.length >= 1 &&
      offerPrices[0].basePrice
        .div(Math.pow(10, 18) * offerPrices[0].quantity.toNumber())
        .toNumber() < this.state.data[0].floorprice
    ) {
      let order = offerPrices[0];
      const accountAddress = WALLET_ADDRESS;
      await this.state.seaport
        .fulfillOrder({
          order,
          accountAddress,
        })
        .then((transaction) => {
          console.log(transaction);
        })
        .catch((err) => toast.error(err.message, { theme: "dark" }));

      clearInterval(this.state.data[index].timer);
      temp[index].working = false;
      this.setState({
        data: temp,
      });
    }
  };

  onGetData = async (index) => {
    await this.setContractAddressTokenId(this.state.data[index].listUrl);

    try {
      //LAST METHOD - FAST SPEED
      const asset = await this.state.seaport.api.getAsset({
        tokenAddress: this.state.contractAddress,
        tokenId: this.state.tokenid,
      });
      console.log(asset);

      await this.setTitle(asset.name, index);
      await this.setBuyPrice(asset.sellOrders, index);

      let temp;
      temp = this.state.data;

      temp[index].timer = setInterval(async () => {
        const asset = await this.state.seaport.api.getAsset({
          tokenAddress: this.state.contractAddress,
          tokenId: this.state.tokenid,
        });
        console.log(asset);

        await this.setTitle(asset.name, index);
        await this.setBuyPrice(asset.sellOrders, index);
        this.setState({ working: true });
      }, 3000);

      this.setState({
        data: temp,
      });
    } catch (err) {
      console.log(err);
      toast.error("Check OpenSea Listing", { theme: "dark" });
    }
  };

  createSeaPort = () => {
    let provider = new HDWalletProvider(PRIVATE_KEY, PROVIDER_OR_URL);

    const seaport = new OpenSeaPort(provider, {
      networkName: Network.Main,
      apiKey: API_KEY,
    });

    this.setState({ seaport: seaport });
  };

  componentDidMount() {
    this.createSeaPort();
  }

  render() {
    return (
      <Container>
        <Table striped bordered hover className="Sheet-Table">
          <thead>
            <tr>
              <th width="30%">OpenSea NFT URL</th>
              <th width="*">Title</th>
              <th>Floor Price</th>
              <th>Listing Price</th>
              <th>Working Status</th>
            </tr>
          </thead>
          <tbody>
            {this.state.data.map((item, index) => {
              return (
                <tr background-color="#2c3034" key={index}>
                  <td word-break="all" width="*">
                    <Form.Control
                      value={item.listUrl}
                      name="listUrl"
                      onChange={(e) => this.onHandleChange(e, index)}
                      onKeyDown={(e) => {
                        if (e.keyCode == 13) this.onGetData(index);
                      }}
                    />
                  </td>
                  <td>{item.title}</td>
                  <td>
                    <Form.Control
                      value={item.floorprice}
                      name="floorprice"
                      onChange={(e) => this.onHandleChange(e, index)}
                    />
                  </td>
                  <td>{item.nowPrice1st}</td>
                  <td>
                    <center>
                      {item.working ? (
                        <ReactLoading
                          type={"spinningBubbles"}
                          color="#0d6efd"
                        />
                      ) : (
                        <></>
                      )}
                    </center>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {/* <Button style={{ float: "right" }} onClick={this.onSubmitAll}>
          Submit All
        </Button> */}
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
