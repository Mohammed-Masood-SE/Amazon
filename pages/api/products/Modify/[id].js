import nc from "next-connect";
import { firestore } from "../../../../utils/firebase/firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
const modify = nc();

modify.post(async (req, res) => {
  const id = req.query.id;
  const newProduct = req.body.product;
  const collectionReference = doc(firestore, "products", id);
  setDoc(collectionReference, newProduct);

  res.send({ message: "Success" });
});

export default modify;
