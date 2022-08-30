import { useRouter } from "next/router";
import styles from "../../styles/productID.module.css";
import { useMoralis } from "react-moralis";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

function ProductPage(props) {
  const { product, rating } = props;
  const { isAuthenticated, authenticate, account } = useMoralis();
  const router = useRouter();
  const productID = router.query.productID;
  const [quantity, setQuantity] = useState(1);
  const [rated, setRated] = useState(false);
  const [ratingState, setRatingState] = useState(rating);
  const [calculatedRating, setCalculatedRating] = useState(0);
  const [displayAddReview, setDisplayAddReview] = useState(false);
  const reviewRef = useRef();
  async function getRatings() {
    const { data } = await axios.get(
      `http://localhost:3000/api/rating/${productID}`
    );
    setRatingState(data);
  }

  useEffect(() => {
    calculateRating();
  }, [ratingState]);

  function calculateRating() {
    if (ratingState.accounts.length === 0) {
      return 0;
    }
    setCalculatedRating(ratingState.rating / ratingState.accounts.length);
  }

  function handleAddReview() {
    if (account && isAuthenticated) {
      setDisplayAddReview(true);
    } else {
      toast.error("Please Log In To Add A New Review !");
    }
  }

  useEffect(() => {
    if (ratingState.accounts.length > 0) {
      let x = false;
      ratingState.accounts.forEach((acc) => {
        if (acc === account) {
          x = true;
        }
      });
      if (x) {
        setRated(true);
      } else {
        setRated(false);
      }
    } else {
      setRated(false);
    }
  }, [account]);

  async function handleRating(rating) {
    if (isAuthenticated && account) {
      const msg = await axios.post(`/api/rating/${productID}`, {
        rating,
        userID: account,
      });

      if (msg.data.success) {
        toast.success("Thank You For Rating This Product (:");
        setRated(true);
        getRatings();
      } else {
        toast.error("You Have Already Rated This Product With This Account !");
      }
    } else {
      toast.error("Log In To Rate This Product !");
    }
  }

  const addToCartHandler = async () => {
    const { data } = await axios.get(`/api/carts/${account}`);

    if (data === 0) {
      // Create New Cart
      const temp = { productID, quantity };
      const msg = await axios.post(`/api/carts/${account}`, { cart: temp });
      toast.success("Added To Cart");
    } else {
      const temp = { productID, quantity };
      console.log(data);
      data.products.push(temp);
      console.log(data);
      const msg = await axios.post(`/api/carts/${account}`, { cart: data });
      toast.success("Added To Cart");
    }
  };
  function increaseQuantity() {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  }
  function decreaseQuantity() {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }

  async function handleSubmitReview() {
    if (reviewRef.current.value) {
      const msg = await axios.post(
        `http://localhost:3000/api/reviews/${productID}`,
        {
          review: { account, review: reviewRef.current.value },
        }
      );
      toast.success("Than You For The Review!");
    } else {
      toast.error("Cannot Send Empty Review !");
    }
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h1>Product Not Found )':</h1>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.container}>
        <div className={styles.cont2}>
          <img src={`${product.img}`} />
          <div className={styles.textHolder}>
            <h1>{product.name}</h1>
            <h1 className={styles.grey}>Sold By {product.seller}</h1>
            <h1>{product.desc}</h1>
          </div>
        </div>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        ></link>
        <div>
          <div className={styles.addToCart}>
            <h1>{product.price} $</h1>
            {product.quantity > 0 && product.display ? (
              <h1 className={styles.green}>In Stock </h1>
            ) : (
              <h1 className={styles.red}>Unavailable</h1>
            )}
            {product.quantity > 0 && product.display ? (
              <h1>Only {product.quantity} Remaining In Stock </h1>
            ) : (
              ""
            )}
            {account && isAuthenticated ? (
              product.quantity > 0 && product.display ? (
                <button className={styles.buttons} onClick={addToCartHandler}>
                  Add To Cart
                </button>
              ) : (
                ""
              )
            ) : product.quantity > 0 && product.display ? (
              <button
                className={styles.buttons}
                onClick={() =>
                  authenticate({
                    signingMessage: "Authorize linking of your wallet",
                  })
                }
              >
                Login To Add To Cart
              </button>
            ) : (
              ""
            )}
            {product.quantity > 0 && product.display ? (
              <div className={styles.quantity}>
                <button className={styles.minus} onClick={decreaseQuantity}>
                  -
                </button>
                <h1>{quantity}</h1>
                <button className={styles.plus} onClick={increaseQuantity}>
                  +
                </button>
              </div>
            ) : (
              ""
            )}
          </div>

          <div className={styles.rating}>
            <label
              className={`${styles.rate} ${
                rated && isAuthenticated && account
                  ? styles.hidden
                  : styles.show
              }`}
            >
              Rate Product ?
            </label>
            <div>
              <span
                onClick={() => {
                  handleRating(5);
                }}
                className={`fa fa-star fa-2x ${!rated ? styles.star1 : ""} ${
                  calculatedRating >= 5 && rated && isAuthenticated && account
                    ? styles.checked
                    : ""
                }`}
              ></span>
              <span
                onClick={() => {
                  handleRating(4);
                }}
                className={`fa fa-star fa-lg ${!rated ? styles.star2 : ""} ${
                  calculatedRating >= 4 && rated && isAuthenticated && account
                    ? styles.checked
                    : ""
                }`}
              ></span>
              <span
                onClick={() => {
                  handleRating(3);
                }}
                className={`fa fa-star fa-lg ${!rated ? styles.star3 : ""} ${
                  calculatedRating >= 3 && rated && isAuthenticated && account
                    ? styles.checked
                    : ""
                }`}
              ></span>
              <span
                onClick={() => {
                  handleRating(2);
                }}
                className={`fa fa-star fa-lg ${!rated ? styles.star4 : ""} ${
                  calculatedRating >= 2 && rated && isAuthenticated && account
                    ? styles.checked
                    : ""
                }`}
              ></span>
              <span
                onClick={() => {
                  handleRating(1);
                }}
                className={`fa fa-star fa-lg ${!rated ? styles.star5 : ""} ${
                  calculatedRating >= 1 && rated && isAuthenticated && account
                    ? styles.checked
                    : ""
                }`}
              ></span>
              <label> ( {ratingState.accounts.length} )</label>
            </div>
          </div>
        </div>
        <Toaster />
      </div>
      <div className={styles.reviewHolder}>
        <div className={styles.reviewHolderHeading}>
          <h1 className={styles.add} onClick={handleAddReview}>
            +
          </h1>
          <h3>Customer Reviews</h3>
        </div>
        {rating.reviews.map((rev) => (
          <div className={styles.reviews}>
            <h3>{rev.account}</h3>
            <label>{rev.review}</label>
          </div>
        ))}
        <div className={styles.review}></div>
      </div>
      {displayAddReview && account && isAuthenticated ? (
        <div className={styles.addReviews}>
          <h1
            className={styles.close}
            onClick={() => {
              setDisplayAddReview(false);
            }}
          >
            x
          </h1>
          <h3>Writing A Review As {account}</h3>
          <textarea ref={reviewRef} />
          <button onClick={handleSubmitReview}>Submit</button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default ProductPage;

export async function getServerSideProps(context) {
  const { params } = context;
  const { productID } = params;

  const product = await axios.get(
    `http://localhost:3000/api/products/${productID}`
  );
  const { data } = await axios.get(
    `http://localhost:3000/api/rating/${productID}`
  );

  return {
    props: {
      product: product.data,
      rating: data,
    },
  };
}
