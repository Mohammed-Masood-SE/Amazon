import nc from "next-connect";
import { firestore } from "../../../utils/firebase/firebase";
import { collection, getDoc, setDoc, doc, updateDoc } from "firebase/firestore";
const reviews = nc();

reviews.post(async (req, res) => {
  const id = req.query.id; // Product ID
  const review = req.body.review;
  const docRef = doc(firestore, "ratings", id);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  data.reviews.push(review);
  updateDoc(docRef, data);
  res.send({ success: true });
});

export default reviews;
