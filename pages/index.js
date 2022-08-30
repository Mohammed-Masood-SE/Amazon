import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Card from "./components/Card";
import Grid from "./components/Grid";
import { firestore } from "../utils/firebase/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import axios from "axios";

export default function Home(props) {
  const { products } = props;

  return (
    <div>
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
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        ></link>
      </Grid>
    </div>
  );
}

export async function getServerSideProps() {
  let { data } = await axios.get(
    ` http://localhost:3000/api/products/recommended`
  );
  return {
    props: {
      products: data,
    },
  };
}
