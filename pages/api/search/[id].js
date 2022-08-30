import nc from "next-connect";
import { firestore } from "../../../utils/firebase/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
const searchedProducts = nc();

searchedProducts.get(async (req, res) => {
  const search = req.query.id;
  const collectionReference = collection(firestore, "products");
  const snapShots = await getDocs(collectionReference);
  let products = [];
  const docs = snapShots.docs.map((doc) => {
    const data = doc.data();
    if (
      data.name.toLowerCase().includes(search.toLowerCase()) &&
      data.display
    ) {
      products.push(data);
    }
  });

  res.send(products);
});

export default searchedProducts;
