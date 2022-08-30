import nc from "next-connect";
import { firestore } from "../../../../utils/firebase/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import axios from "axios";
const filteredProducts = nc();

function sortArray(mergedData, OFS, starFilter, min, max) {
  let sortedOFS = [];
  if (OFS === "true") {
    sortedOFS = mergedData;
  } else {
    //Here Or Down
    mergedData.forEach((item) => {
      if (item.quantity > 0) {
        sortedOFS.push(item);
      }
    });
  }

  let starFilteredArray = filterByStar(sortedOFS, starFilter);
  let priceFilteredArray = filterByPrice(starFilteredArray, min, max);
  return priceFilteredArray;
}

function filterByPrice(starFilteredArray, min, max) {
  if (min && max) {
    let priceFilteredArray = [];
    starFilteredArray.forEach((item) => {
      if (item.price >= parseInt(min) && item.price <= parseInt(max)) {
        priceFilteredArray.push(item);
      }
    });
    return priceFilteredArray;
  } else {
    return starFilteredArray;
  }
}

function filterByStar(sortedOFS, starFilter) {
  let starFilteredArray = [];
  if (parseInt(starFilter) !== 0) {
    // Here .... Javascript Wierdd Kid .. forloop dont work but foreach do
    sortedOFS.forEach((item) => {
      let calculateStars = parseInt(item.rating / item.accounts.length);
      if (calculateStars === parseInt(starFilter)) {
        starFilteredArray.push(item);
      }
    });
    return starFilteredArray;
  } else {
    return sortedOFS;
  }
}

filteredProducts.get(async (req, res) => {
  const search = req.query.id;
  const { OFS, starFilter, min, max } = req.query;
  const collectionReference = collection(firestore, "products");
  const snapShots = await getDocs(collectionReference);
  let products = [];
  const docs = snapShots.docs.map((doc) => {
    const data = doc.data();
    if (data.name.toLowerCase().includes(search.toLowerCase())) {
      products.push(data);
    }
  });

  let productRatings = [];
  for (let i = 0; i < products.length; i++) {
    const rating = await axios.get(
      `http://localhost:3000/api/rating/${products[i].productID}`
    );
    productRatings.push(rating.data);
  }

  let mergedData = [];
  for (let i = 0; i < products.length; i++) {
    mergedData[i] = { ...products[i], ...productRatings[i] };
  }

  mergedData = sortArray(mergedData, OFS, starFilter, min, max);

  let arr = [];

  mergedData.forEach((doc) => {
    if (doc.display) {
      arr.push(doc);
    }
  });

  res.send(arr);
});

export default filteredProducts;
