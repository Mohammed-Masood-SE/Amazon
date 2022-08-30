import nc from "next-connect";
import { firestore } from "../../../../utils/firebase/firebase";
import { collection, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
import axios from "axios";
const getRecommendedProducts = nc();

// getRecommendedProducts.get(async (req, res) => {
//   const collectionReference = collection(firestore, "products");
//   const snapShots = await getDocs(collectionReference);
//   const docs = snapShots.docs.map((doc) => {
//     const data = doc.data();
//     data.id = doc.id;
//     return data;
//   });

//   let arr = [];

//   docs.forEach((doc) => {
//     if (doc.display) {
//       arr.push(doc);
//     }
//   });

//   res.send(arr);
// });

getRecommendedProducts.get(async (req, res) => {
  const colRef = collection(firestore, "RecommendedProducts");
  const docsSnap = await getDocs(colRef);
  let arr = [];
  docsSnap.forEach((snap) => {
    arr.push(snap.data());
  });

  let arr2 = [];

  for (let i = 0; i < arr.length; i++) {
    arr2[arr[i].indexValue] = arr[i];
  }

  res.send(arr2);
});

export default getRecommendedProducts;
