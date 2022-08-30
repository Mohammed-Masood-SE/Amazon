import { firestore } from "./firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

const getUsers = async () => {
  // const collectionReference = collection(firestore, "users");
  // const snapShots = await getDocs(collectionReference);
  // const docs = snapShots.docs.map((doc) => {
  //   const data = doc.data();
  //   data.id = doc.id;
  //   return data;
  // });
  // console.log(docs);
};

const setUsers = async (data) => {
  // const collectionReference = collection(firestore, "users");
  // await addDoc(collectionReference, data);
};

export { getUsers, setUsers };
