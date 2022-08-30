import styles from "../../styles/Card.module.css";
import Link from "next/Link";
import { useEffect, useState } from "react";

function Card({ product, rating }) {
  const [calculatedRating, setCalculatedRating] = useState(0);

  useEffect(() => {
    setCalculatedRating(calculateRating());
  }, []);
  function calculateRating() {
    if (rating.accounts.length === 0) {
      return 0;
    }
    return parseInt(rating.rating / rating.accounts.length);
  }

  return (
    <Link href={`/products/${product.productID}`} passHref>
      <div className={styles.Card}>
        <img src={product.img} />
        <h1 className={styles.prodName}>{product.name}</h1>
        <h1 className={styles.price}>{product.price} $</h1>
        <div className={styles.ratings}>
          <span
            className={`fa fa-star fa-lg ${styles.star1} ${
              calculatedRating >= 5 ? styles.checked : ""
            }`}
          ></span>
          <span
            className={`fa fa-star fa-lg ${styles.star2} ${
              calculatedRating >= 4 ? styles.checked : ""
            }`}
          ></span>
          <span
            className={`fa fa-star fa-lg ${styles.star3} ${
              calculatedRating >= 3 ? styles.checked : ""
            }`}
          ></span>
          <span
            className={`fa fa-star fa-lg ${styles.star4} ${
              calculatedRating >= 2 ? styles.checked : ""
            }`}
          ></span>
          <span
            className={`fa fa-star fa-lg ${styles.star5} ${
              calculatedRating >= 1 ? styles.checked : ""
            }`}
          ></span>
          <label> ( {rating.accounts.length} ) </label>
        </div>
      </div>
    </Link>
  );
}

export default Card;
