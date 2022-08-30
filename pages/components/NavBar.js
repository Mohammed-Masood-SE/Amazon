import styles from "../../styles/NavBar.module.css";
import Image from "next/image";
import Link from "next/Link";
import { useRef, useState } from "react";
import { useRouter } from "next/router";

function NavBar({ isAuthenticated, authenticate, account }) {
  const [showSettings, setShowSettings] = useState(false);
  const searchRef = useRef();
  const router = useRouter();
  function handleSearch() {
    const url = searchRef.current.value;
    window.location.href = `http://localhost:3000/search/${url}`;
  }
  return (
    <nav className={styles.nav}>
      <Link href="/">
        <img className={styles.logo} src="/Amazon_logo.png" alt="" />
      </Link>
      <div className={styles.searchContainer}>
        <input ref={searchRef} />
        <button onClick={handleSearch}>
          <Image src="/SearchIcon.jpg" height={26} width={26} alt="" />
        </button>
      </div>

      <div className={styles.accountHolder}>
        {account && isAuthenticated && showSettings ? (
          <div className={styles.floatingBox}>
            <Link href="/FBA">
              <h1
                onClick={() => {
                  setShowSettings(!showSettings);
                }}
                className={styles.settings}
              >
                Amazon FBA
              </h1>
            </Link>
            <Link href="/Cart">
              <h1
                onClick={() => {
                  setShowSettings(!showSettings);
                }}
                className={styles.settings}
              >
                My Cart
              </h1>
            </Link>
            <Link href="/OrderHistory">
              <h1
                onClick={() => {
                  setShowSettings(!showSettings);
                }}
                className={styles.settings}
              >
                Order History
              </h1>
            </Link>
            <h1
              className={styles.settings}
              onClick={() => {
                authenticate({
                  signingMessage: "Authorize linking of your wallet",
                });
                setShowSettings(!showSettings);
              }}
            >
              Logout
            </h1>
          </div>
        ) : (
          ""
        )}

        <button
          className={
            account && isAuthenticated ? styles.loggedIn : styles.login
          }
          onClick={() =>
            account && isAuthenticated
              ? setShowSettings(!showSettings)
              : authenticate({
                  signingMessage: "Authorize linking of your wallet",
                })
          }
        >
          {account && isAuthenticated
            ? account.slice(0, 7) + " ......"
            : "Login | MetaMask"}
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
