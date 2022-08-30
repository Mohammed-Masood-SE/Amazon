import nc from "next-connect";
import { firestore } from "../../../utils/firebase/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
const getProducts = nc();

getProducts.get(async (req, res) => {
  const id = req.query.id;
  const collectionReference = collection(firestore, "products");
  const snapShots = await getDocs(collectionReference);
  let product = 0;
  const docs = snapShots.docs.map((doc) => {
    const data = doc.data();
    if (doc.id.toLowerCase() === id.toLowerCase()) {
      product = data;
    }
  });

  res.send(product);
});

export default getProducts;
