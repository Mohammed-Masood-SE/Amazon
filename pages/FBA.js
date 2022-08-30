import styles from "../styles/FBA.module.css";
import { useMoralis } from "react-moralis";
import NewProduct from "./components/NewProduct";
import { useEffect, useState, useRef } from "react";
import ViewListing from "./components/ViewListing";
function FBA() {
  const { isAuthenticated, authenticate, account } = useMoralis();
  const [productScreen, setProductScreen] = useState(true);
  const [viewListing, setViewListing] = useState(false);
  return (
    <>
      {account && isAuthenticated ? (
        <div className={styles.container}>
          <div className={styles.nav}>
            <button
              onClick={() => {
                setProductScreen(true);
                setViewListing(false);
              }}
            >
              Sell A New Product
            </button>
            <button
              onClick={() => {
                setProductScreen(false);
                setViewListing(true);
              }}
            >
              View Your Listing
            </button>
          </div>
          <div className={styles.display}>
            {productScreen ? <NewProduct /> : ""}
            {viewListing ? <ViewListing /> : ""}
          </div>
        </div>
      ) : (
        <div className={styles.notLogged}>
          <h1>Please Log In To Proceed</h1>
        </div>
      )}
    </>
  );
}

export default FBA;
