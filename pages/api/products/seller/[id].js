import nc from "next-connect";
import { firestore } from "../../../../utils/firebase/firebase";
import { collection, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
const sellerProducts = nc();

sellerProducts.get(async (req, res) => {
  const id = req.query.id;
  const collectionReference = collection(firestore, "products");
  const snapShots = await getDocs(collectionReference);
  const docs = snapShots.docs.map((doc) => {
    const data = doc.data();

    if (id.toLowerCase() === data.seller.toLowerCase()) {
      return data;
    }
  });
  let arr = [];
  docs.forEach((doc) => {
    if (doc && doc.display) {
      arr.push(doc);
    }
  });
  res.send(arr);
});

export default sellerProducts;
