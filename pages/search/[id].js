import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Card from "../components/Card";
import Grid from "../components/Grid";
import styles from "../../styles/SearchPage.module.css";

function Search(props) {
  const [products, setProducts] = useState(props.products);
  const id = props.id;
  let allProducts = props.products;
  const minRef = useRef();
  const maxRef = useRef();
  const [starFilter, setStarFilter] = useState(0);
  const [tempState, setTempState] = useState(0);
  const OFSRef = useRef();

  useEffect(() => {
    if (tempState !== 0) {
      getFilteredData();
    } else {
      setTempState(tempState + 1);
    }
  }, [starFilter]);

  async function getFilteredData() {
    const { data } = await axios.get(`/api/search/filter/${id}`, {
      params: {
        OFS: OFSRef.current.checked,
        starFilter,
        min: minRef.current.value,
        max: maxRef.current.value,
      },
    });
    setProducts(data);
  }

  function clearFilters() {
    setTempState(0);
    setStarFilter(0);
    minRef.current.value = "";
    maxRef.current.value = "";
    OFSRef.current.checked = true;
    setProducts(allProducts);
  }

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <h3 className={styles.heading}>Filter By Price</h3>
        <div className={styles.price}>
          <input ref={minRef} placeholder="Min in $" type="number" />
          <span> - </span>
          <input ref={maxRef} placeholder="Max in $" type="number" />
          <button onClick={getFilteredData}>Search</button>
        </div>
        <h3 className={styles.heading}>
          Filter By <span className={`fa fa-star ${styles.starColor}`}></span>{" "}
        </h3>
        <div>
          <div
            className={styles.starHolder}
            onClick={() => {
              setStarFilter(5);
            }}
          >
            <span className={`fa fa-star ${styles.starColor}`}></span>
            <span className={`fa fa-star ${styles.starColor}`}></span>
            <span className={`fa fa-star ${styles.starColor}`}></span>
            <span className={`fa fa-star ${styles.starColor}`}></span>
            <span className={`fa fa-star ${styles.starColor}`}></span>
          </div>
          <div
            className={styles.starHolder}
            onClick={() => {
              setStarFilter(4);
            }}
          >
            <span className={`fa fa-star ${styles.starColor}`}></span>
            <span className={`fa fa-star ${styles.starColor}`}></span>
            <span className={`fa fa-star ${styles.starColor}`}></span>
            <span className={`fa fa-star ${styles.starColor}`}></span>
            <span className={`fa fa-star`}></span>
          </div>
          <div
            className={styles.starHolder}
            onClick={() => {
              setStarFilter(3);
            }}
          >
            <span className={`fa fa-star ${styles.starColor}`}></span>
            <span className={`fa fa-star ${styles.starColor}`}></span>
            <span className={`fa fa-star ${styles.starColor}`}></span>
            <span className={`fa fa-star`}></span>
            <span className={`fa fa-star`}></span>
          </div>
          <div
            className={styles.starHolder}
            onClick={() => {
              setStarFilter(2);
            }}
          >
            <span className={`fa fa-star ${styles.starColor}`}></span>
            <span className={`fa fa-star ${styles.starColor}`}></span>
            <span className={`fa fa-star `}></span>
            <span className={`fa fa-star `}></span>
            <span className={`fa fa-star `}></span>
          </div>
          <div
            className={styles.starHolder}
            onClick={() => {
              setStarFilter(1);
            }}
          >
            <span className={`fa fa-star ${styles.starColor}`}></span>
            <span className={`fa fa-star `}></span>
            <span className={`fa fa-star `}></span>
            <span className={`fa fa-star`}></span>
            <span className={`fa fa-star `}></span>
          </div>
          <h3 className={styles.heading}>Availability</h3>
          <input
            className={styles.l}
            ref={OFSRef}
            type="checkbox"
            defaultChecked={true}
            onClick={getFilteredData}
          />
          <label
            className={styles.l}
            onClick={() => {
              OFSRef.current.checked = !OFSRef.current.checked;
              getFilteredData();
            }}
          >
            include Out Of Stock
          </label>
        </div>
        <button className={styles.clear} onClick={clearFilters}>
          Clear All Filters
        </button>
      </div>
      <div className={styles.gridHolder}>
        <Grid>
          {products.map((product, i) => (
            <Card
              key={product.productID}
              product={product}
              rating={{
                accounts: product.accounts,
                rating: product.rating,
                reviews: product.reviews,
              }}
            />
          ))}
        </Grid>
      </div>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      ></link>
    </div>
  );
}

export default Search;

// function mergeSort(arr) {
//   if (arr.length < 2) {
//     return arr;
//   }

//   const mid = Math.floor(arr.length / 2);
//   const leftArr = arr.slice(0, mid);
//   const rightArr = arr.slice(mid);
//   return merge(mergeSort(leftArr), mergeSort(rightArr));
// }

// function merge(leftArr, rightArr) {
//   const sortedArr = [];
//   while (leftArr.length && rightArr.length) {
//     if (leftArr[0] >= rightArr[0]) {
//       sortedArr.push(leftArr.shift());
//     } else {
//       sortedArr.push(rightArr.shift());
//     }
//   }

//   return [...sortedArr, ...leftArr, ...rightArr];
// }

export async function getServerSideProps(context) {
  const id = context.params.id;
  let { data } = await axios.get(` http://localhost:3000/api/search/${id}`);
  let productRatings = [];
  for (let i = 0; i < data.length; i++) {
    const rating = await axios.get(
      `http://localhost:3000/api/rating/${data[i].productID}`
    );
    productRatings.push(rating.data);
  }
  for (let j = 0; j < productRatings.length; j++) {
    for (let i = j; i < productRatings.length; i++) {
      if (productRatings[j].rating < productRatings[i].rating) {
        let temp = productRatings[j];
        productRatings[j] = productRatings[i];
        productRatings[i] = temp;

        let tempData = data[j];
        data[j] = data[i];
        data[i] = tempData;
      }
    }
  }

  let mergedData = [];
  for (let i = 0; i < data.length; i++) {
    mergedData[i] = { ...data[i], ...productRatings[i] };
  }
  return {
    props: {
      products: mergedData,
      id,
    },
  };
}
