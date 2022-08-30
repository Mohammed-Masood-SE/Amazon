import axios from "axios";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import styles from "../styles/OrderHistory.module.css";
import OrderHolder from "./components/OrderHolder";

function OrderHistory() {
  const { isAuthenticated, authenticate, account } = useMoralis();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  useEffect(() => {
    if (account && isAuthenticated) {
      getOrders();
    }
  }, [account, isAuthenticated]);

  async function getOrders() {
    if (account && isAuthenticated) {
      const { data } = await axios.get(`/api/orders/${account}`);
      if (data.orders) {
        setOrders(data.orders.reverse());
      } else {
        setOrders([]);
      }
    }
  }

  return (
    <div className={styles.pageContainer}>
      {isAuthenticated && account ? (
        <div>
          <h1>Order History</h1>
          <div className={styles.ordersContainer}>
            {orders.map((order, i) => (
              <OrderHolder order={order} i={i} />
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.logIn}>
          <h1>Log In To View Your Order History</h1>
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
