import nc from "next-connect";
import { firestore } from "../../../utils/firebase/firebase";
import { collection, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
const getProducts = nc();

getProducts.get(async (req, res) => {
  const collectionReference = collection(firestore, "products");
  const snapShots = await getDocs(collectionReference);
  const docs = snapShots.docs.map((doc) => {
    const data = doc.data();
    data.id = doc.id;
    return data;
  });

  let arr = [];

  docs.forEach((doc) => {
    if (doc.display) {
      arr.push(doc);
    }
  });

  res.send(arr);
});

getProducts.post(async (req, res) => {
  const id = req.query.id;
  const product = req.body.product;
  const collectionReference = collection(firestore, "products");
  let ref = doc(collectionReference);
  let myId = ref.id;
  product.productID = myId;
  const colRef = doc(firestore, "products", myId);
  setDoc(colRef, product);

  const docRef = doc(firestore, "ratings", myId);
  setDoc(docRef, { rating: 0, accounts: [], reviews: [] });

  res.send({ message: "Success" });
});

export default getProducts;
