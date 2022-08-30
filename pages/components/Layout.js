import styles from "../../styles/Layout.module.css";
import NavBar from "./NavBar";
import Head from "next/head";

import { useMoralis } from "react-moralis";
function Layout({ children }) {
  const { isAuthenticated, authenticate, account } = useMoralis();
  return (
    <div>
      <Head>
        <title>Amazon 3.0</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@300&display=swap"
          rel="stylesheet"
        />
      </Head>
      <NavBar
        isAuthenticated={isAuthenticated}
        authenticate={authenticate}
        account={account}
      />
      <main>{children}</main>
    </div>
  );
}

export default Layout;
