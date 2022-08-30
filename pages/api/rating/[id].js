import nc from "next-connect";
import { firestore } from "../../../utils/firebase/firebase";
import { collection, getDoc, setDoc, doc, updateDoc } from "firebase/firestore";
const ratings = nc();

ratings.post(async (req, res) => {
  const id = req.query.id; // Product ID
  const rating = req.body.rating;
  const userID = req.body.userID; // Wallet Address

  const docRef = doc(firestore, "ratings", id);
  const docSnap = await getDoc(docRef);

  const data = docSnap.data();
  let totalUsers = 0;
  let proceed = true;
  data.accounts.forEach((user) => {
    if (user === userID) {
      proceed = false;
      res.send({ success: false });
    }
    totalUsers++;
  });

  // if user hasnt alrdy rated then proceed
  if (proceed) {
    data.rating += rating;
    data.accounts.push(userID);
    updateDoc(docRef, data);
    res.send({ success: true });
  }
});

ratings.get(async (req, res) => {
  const id = req.query.id;
  const docRef = doc(firestore, "ratings", id);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  if (docSnap.exists()) {
    res.send(data);
  } else {
    res.send({ message: "Product Does Not Exist" });
  }
});

export default ratings;
