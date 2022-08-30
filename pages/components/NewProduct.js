import styles from "../../styles/NewProduct.module.css";
import { useEffect, useState, useRef } from "react";
import { useMoralis } from "react-moralis";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { storage } from "../../utils/firebase/firebase";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
const { uuid } = require("uuidv4");
function NewProduct() {
  const { isAuthenticated, authenticate, account } = useMoralis();
  const nameRef = useRef();
  const priceRef = useRef();
  const quantityRef = useRef();
  const descriptionRef = useRef();
  const imageRef = useRef();

  async function handleSubmit() {
    const name = nameRef.current.value;
    const price = priceRef.current.value;
    const quantity = quantityRef.current.value;
    const description = descriptionRef.current.value;
    const image = imageRef.current.files[0];

    if (name && price && quantity && description && image) {
      const product = {
        desc: description,
        name,
        price,
        quantity,
        seller: account,
        img: "",
        productID: 0,
        display: true,
      };

      const imageRef = ref(storage, `images/${image.name}${uuid()}`);
      uploadBytes(imageRef, image)
        .then((snapshot) => {
          getDownloadURL(snapshot.ref)
            .then((url) => {
              product.img = url;
            })
            .then(() => {
              const msg = axios.post(`/api/products`, {
                product,
              });
              toast.success("Product Is Live !!!");
            });
        })

        .catch((error) => {
          console.error("Upload failed", error);
        });
    } else {
      toast.error("Some Fields Are Empty !");
    }
  }

  return (
    <div className={styles.container}>
      <h2>Create A New Product</h2>
      <div className={styles.inputContainer}>
        <div>
          <label>Product Name</label>
          <input ref={nameRef} />
        </div>
        <div>
          <label>Price (In USD)</label>
          <input ref={priceRef} type="number" />
        </div>
        <div>
          <label>Quantity</label>
          <input ref={quantityRef} type="number" />
        </div>
        <div>
          <label>Description</label>
          <textarea ref={descriptionRef} />
        </div>
        <div>
          <label>Product Image</label>
          <input accept="image/*" type="file" ref={imageRef} />
        </div>
        <div>
          <button onClick={handleSubmit} className={styles.submitButton}>
            Create Product
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default NewProduct;
