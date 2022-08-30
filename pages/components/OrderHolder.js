import { useState, useEffect } from "react";
import styles from "../../styles/OrderHolder.module.css";
import { useMoralis } from "react-moralis";
import axios from "axios";
import { useRouter } from "next/router";
function OrderHolder({ order, i }) {
  const router = useRouter();
  const { isAuthenticated, authenticate, account, Moralis } = useMoralis();
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState([]);
  useEffect(() => {
    if (order) {
      if (order.userCart.length > 0) {
        getProducts();
      }
    }
  }, [order]);

  function handleClick(link) {
    router.push(`/products/${link}`);
  }

  async function getProducts() {
    let temp = { prod: [] };
    if (account && isAuthenticated) {
      for (let i = 0; i < order.userCart.length; i++) {
        const { data } = await axios.get(
          `/api/products/${order.userCart[i].productID}`
        );
        temp.prod.push(data);
      }
    }
    setProducts(temp.prod);
  }

  return (
    <div
      className={`${styles.order} ${
        order.Delivered ? styles.delivered : styles.pending
      }`}
      key={i}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className={styles.header}>
        <h1>{order.date}</h1>
        {isOpen ? (
          <p>{order.Delivered ? <h3>Delivered</h3> : <h3>In Progress</h3>}</p>
        ) : (
          <p>
            ( View Details )
            {order.Delivered ? <h3>Delivered</h3> : <h3>In Progress</h3>}
          </p>
        )}
      </div>
      {isOpen ? (
        <div className={styles.details}>
          <div className={styles.cartContainer}>
            <table className={styles.contentTable}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod, i) => (
                  <tr key={i} className={styles.productContainer}>
                    <img
                      onClick={() => handleClick(prod.productID)}
                      src={`${prod.img}`}
                    />
                    <td onClick={() => handleClick(prod.productID)}>
                      {prod.name}
                    </td>
                    <td onClick={() => handleClick(prod.productID)}>
                      {order.userCart[i] ? order.userCart[i].quantity : ""}
                    </td>
                    <td onClick={() => handleClick(prod.productID)}>
                      {prod.price} $
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            {order.Address.country} , {order.Address.city} ,{" "}
            {order.Address.area} , {order.Address.street}
          </p>
          {order.Address.buildingName ? (
            <p>
              {order.Address.buildingName} , {order.Address.roomNumber}
            </p>
          ) : (
            <p>Villa Number : {order.Address.villaNumber}</p>
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default OrderHolder;
