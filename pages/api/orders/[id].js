import nc from "next-connect";
import { firestore } from "../../../utils/firebase/firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
const orders = nc();

orders.post(async (req, res) => {
  const id = req.query.id;
  const order = req.body.order;

  const colRef = collection(firestore, "orders");
  const snapShots = await getDocs(colRef);
  let prevOrders = 0;
  const docs = snapShots.docs.map((doc) => {
    const data = doc.data();
    if (doc.id.toLowerCase() === id.toLowerCase()) {
      prevOrders = data;
    }
  });

  if (prevOrders !== 0) {
    prevOrders.orders.push(order);
    const collectionReference = doc(firestore, "orders", id);
    setDoc(collectionReference, prevOrders);
  } else {
    const newOrder = { orders: [order] };
    const collectionReference = doc(firestore, "orders", id);
    setDoc(collectionReference, newOrder);
  }
  res.send({ message: "Success" });
});

orders.get(async (req, res) => {
  const id = req.query.id;

  const colRef = collection(firestore, "orders");
  const snapShots = await getDocs(colRef);
  let prevOrders = [];
  const docs = snapShots.docs.map((doc) => {
    const data = doc.data();
    if (doc.id.toLowerCase() === id.toLowerCase()) {
      prevOrders = data;
    }
  });

  if (prevOrders !== 0) {
    res.send(prevOrders);
  } else {
    res.send({ orders: [] });
  }
});

export default orders;
