import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAQNXoWgjzyYezRULIhA9BH5bRELUfjy1M",
  authDomain: "web3-7f63a.firebaseapp.com",
  projectId: "web3-7f63a",
  storageBucket: "web3-7f63a.appspot.com",
  messagingSenderId: "787904926183",
  appId: "1:787904926183:web:927ff1915d782eb03fed42",
};

const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);
const storage = getStorage(app);
export { firestore, storage };
