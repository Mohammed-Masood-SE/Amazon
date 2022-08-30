import nc from "next-connect";
import { firestore } from "../../../../../utils/firebase/firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
const products = nc();

products.post(async (req, res) => {
  const id = req.query.id;
  const quantity = req.body.quantity;
  const colref = collection(firestore, "products");
  const snapShots = await getDocs(colref);
  let product = 0;
  const docs = snapShots.docs.map((doc) => {
    const data = doc.data();
    if (doc.id.toLowerCase() === id.toLowerCase()) {
      product = data;
    }
  });
  product.quantity = product.quantity - quantity;
  const collectionReference = doc(firestore, "products", id);
  setDoc(collectionReference, product);

  res.send({ message: "Success" });
});

export default products;
