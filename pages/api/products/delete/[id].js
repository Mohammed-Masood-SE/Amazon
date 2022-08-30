import nc from "next-connect";
import { firestore } from "../../../../utils/firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
const deleteProduct = nc();

deleteProduct.post(async (req, res) => {
  const id = req.query.id;
  const newProduct = req.body.product;
  newProduct.display = false;
  const collectionReference = doc(firestore, "products", id);
  setDoc(collectionReference, newProduct);

  res.send({ message: "Success" });
});

export default deleteProduct;
