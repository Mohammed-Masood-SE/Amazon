import nc from "next-connect";
import { firestore } from "../../../utils/firebase/firebase";
import { collection, getDocs, setDoc, doc, getDoc } from "firebase/firestore";
const carts = nc();

carts.get(async (req, res) => {
  const id = req.query.id;
  const collectionReference = collection(firestore, "carts");
  const snapShots = await getDocs(collectionReference);
  let cart = 0;
  const docs = snapShots.docs.map((doc) => {
    const data = doc.data();
    if (doc.id.toLowerCase() === id.toLowerCase()) {
      cart = data;
    }
  });

  let arr = [];
  if (cart) {
    for (let i = 0; i < cart.products.length; i++) {
      const data = await getProd(cart.products[i]);
      if (data) {
        arr.push(data);
      }
    }
    cart.products = arr;
  }
  res.send(cart);
});

async function getProd(product) {
  const docRef = doc(firestore, "products", product.productID);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();

  if (data.display) {
    return product;
  }
}

carts.post(async (req, res) => {
  const id = req.query.id;
  const cart = req.body.cart;
  if (cart.products) {
    const collectionReference = doc(firestore, "carts", id);
    let newCart = [];
    let exists = false;

    for (let i = 0; i < cart.products.length; i++) {
      for (let j = 0; j < newCart.length; j++) {
        if (newCart[j].productID === cart.products[i].productID) {
          newCart[j].quantity += cart.products[i].quantity;
          exists = true;
        }
      }
      if (!exists) {
        newCart.push(cart.products[i]);
      }
    }
    const finalCart = { products: newCart };

    setDoc(collectionReference, finalCart);
  } else {
    const newCart = { products: [cart] };
    const collectionReference = doc(firestore, "carts", id);
    setDoc(collectionReference, newCart);
  }
  res.send({ message: "Success" });
});

export default carts;
