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
import "./BuyTable.scss";

const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
const WALLET_ADDRESS = process.env.REACT_APP_WALLET_ADDRESS;
const PROVIDER_OR_URL = process.env.REACT_APP_PROVIDER_OR_URL;
const API_KEY = process.env.REACT_APP_API_KEY;
const INTERVAL_TIME = 10000;

export default function BuyTable() {
  const [flag, setFlag] = React.useState(true);
  const [listUrl, setlistURL] = React.useState("");
  const [listingPrice, setlistingPrice] = React.useState(0);
  const [buyPrice, setBuyPrice] = React.useState(0);
  const [working, setWorking] = React.useState(false);
  const [seaport, setSeaport] = React.useState("");
  const [accountAddress, setAccountAddress] = React.useState(WALLET_ADDRESS);
  const [contractAddress, setContractAddress] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [tokenId, setTokenId] = React.useState("");
  const [schemaName, setSchemaName] = React.useState("");
  React.useEffect(() => {
    let provider = new HDWalletProvider(PRIVATE_KEY, PROVIDER_OR_URL);

    const seaport = new OpenSeaPort(provider, {
      networkName: Network.Main,
      apiKey: API_KEY,
    });

    setSeaport(seaport);
  }, []);

  const createSeaport = () => {};

  const setContractAddressTokenId = (listUrl1) => {
    console.log(listUrl1);
    let URL = listUrl1.replace("https://opensea.io/assets/", "");
    let URLArray = URL.split("/");
    if (URL.split("/").length == 2) {
      console.log(URL.split("/"));
      setContractAddress(URL.split("/")[0]);
      setTokenId(URL.split("/")[1]);
    } else {
      setContractAddress("");
      setTokenId("");
    }

    // console.log(URLArray[0], URLArray[1]);
  };

  const onHandleChange = (e) => {
    setlistURL(e.target.value);
    // console.log(listUrl);

    setFlag(!flag);
  };

  const onStartWork = async () => {
    await setContractAddressTokenId(listUrl);
    try {
      // Set Title, SchemaName
      await seaport.api
        .getAsset({
          tokenAddress: contractAddress,
          tokenId: tokenId,
        })
        .then(async (asset) => {
          await setTitle(asset.name);
          await setSchemaName(asset.assetContract.schemaName);
          console.log(asset);

          //   setInterval(() => {
          //     onIntervalCall();
          //   }, INTERVAL_TIME);
        });
    } catch (err) {
      console.log(err);
    }
  };

  const onIntervalCall = async () => {
    // Set Listing Price
    try {
      await seaport.api
        .getOrders({
          asset_contract_address: contractAddress,
          token_id: tokenId,
          side: OrderSide.Sell,
        })
        .then(async (sellOrders, count) => {
          await setListingPrice(sellOrders.orders, count);
        });
    } catch (err) {
      console.log(err);
    }
  };

  const setListingPrice = (listingOrders, count) => {
    console.log(count);
    console.log("I am working.");
    if (count > 0) {
      setListingPrice(
        listingOrders[0].basePrice
          .div(Math.pow(10, 18) * listingOrders[0].quantity.toNumber())
          .toNumber()
      );
    }
  };

  return (
    <>
      <Container>
        <Table striped bordered hover className="Sheet-Table">
          <thead>
            <tr>
              <th>OpenSea NFT URL</th>
              <th>Title</th>
              <th>Top Listing Price</th>
              <th>Buy Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr background-color="#2c3034">
              <td word-break="all" width="*">
                <Form.Control
                  as="textarea"
                  value={listUrl}
                  rows={3}
                  name="listUrl"
                  onChange={onHandleChange}
                  onKeyDown={(e) => {
                    if (e.keyCode == 13) onStartWork();
                  }}
                />
              </td>
              <td>{title}</td>
              <td>{listingPrice}</td>
              <td>{buyPrice}</td>
              <td>{working}</td>
            </tr>
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
    </>
  );
}
