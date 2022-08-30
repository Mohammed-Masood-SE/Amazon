import styles from "../../styles/ViewListing.module.css";
import { useEffect, useState, useRef } from "react";
import { useMoralis } from "react-moralis";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { storage } from "../../utils/firebase/firebase";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
const { uuid } = require("uuidv4");

function ViewListing() {
  const router = useRouter();
  const { isAuthenticated, authenticate, account } = useMoralis();
  const [products, setProducts] = useState([]);
  const [showModifyPage, setShowModifyPage] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({});
  const [tempImage, setTempImage] = useState();
  const nameRef = useRef();
  const priceRef = useRef();
  const quantityRef = useRef();
  const descriptionRef = useRef();
  const imageRef = useRef();
  useEffect(() => {
    getListing();
  }, [account]);

  async function getListing() {
    const { data } = await axios.get(`/api/products/seller/${account}`);
    setProducts(data);
  }

  function handleClick(link) {
    router.push(`/products/${link}`);
  }

  function handleModify() {
    let name = nameRef.current.value;
    let price = priceRef.current.value;
    let quantity = quantityRef.current.value;
    let description = descriptionRef.current.value;
    let image = imageRef.current.files[0];
    if (!imageRef.current.files[0]) {
      image = false;
    }
    if (!name) {
      name = selectedProduct.name;
    }
    if (!price) {
      price = selectedProduct.price;
    }
    if (!quantity) {
      quantity = selectedProduct.quantity;
    }
    if (!description) {
      description = selectedProduct.desc;
    }

    const product = {
      desc: description,
      name,
      price,
      quantity,
      seller: account,
      img: selectedProduct.img,
      productID: selectedProduct.productID,
      display: true,
    };
    if (!image) {
      const msg = axios.post(
        `/api/products/Modify/${selectedProduct.productID}`,
        {
          product,
        }
      );
      getListing();
      setShowModifyPage(false);
      toast.success("Modified Changes !!!");
    } else {
      const imageRef = ref(storage, `images/${image.name}${uuid()}`);
      uploadBytes(imageRef, image)
        .then((snapshot) => {
          getDownloadURL(snapshot.ref)
            .then((url) => {
              product.img = url;
            })
            .then(() => {
              const msg = axios.post(
                `/api/products/Modify/${selectedProduct.productID}`,
                {
                  product,
                }
              );
              getListing();
              setShowModifyPage(false);
              //   getListing();
              toast.success("Modified Changes !!!");
            });
        })

        .catch((error) => {
          console.error("Upload failed", error);
        });
    }
  }

  async function handleDelete() {
    const msg = axios.post(
      `/api/products/delete/${selectedProduct.productID}`,
      { product: selectedProduct }
    );
    toast.success("Product Has Been Removed From Our Stores !");
    getListing();
    setShowConfirm(false);
  }

  return (
    <div className={styles.container}>
      {showConfirm ? (
        <div className={styles.confirmContainer}>
          <img
            className={styles.close}
            onClick={() => {
              setShowConfirm(false);
            }}
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEMAAABDCAYAAADHyrhzAAAABmJLR0QA/wD/AP+gvaeTAAAIEklEQVR4nO2cXWxbZxnHf+/xZ0YiaLOyVqB2TmvC2jURVx0DBIJNMC2TNuC0S5xIlLVpWk0TcAFC7CI3CIkyGEsKazTU1YmVhHBRARtICAlYv7iAlHilDWFdq7SLkybd2qQ0aezzcJHYsRPHPj7n2G6n/a+O34//ec5Px6/fT8MHSkkV07y1tdUzOzsbEJGPJxKJjyqlqoFqpdQ9gBf4UHp5ERGl1HuLH6dEZEopNSkiU5qmjXR3d08UM17HYOi6Xun1encAn1FK7QBqRWQT4HbqHsANYAR4EzhhGMbJ2trac+3t7YYT5rZg6Lq+1ufzNYiIDnwZ8DgRVIG6BrxmGMZAVVXVH7u6uuatGlmC0dLS8qBhGN8FnqY8AFZTTCl1eG5u7mcDAwPXC61cEIzm5uYNIvIioBdat8SaUkr9oKenpwsQs5VMP1AoFPom8ALwEQvBlUtvxOPx3f39/W+ZKZwXhq7rLq/X+1PgOduhlUfXDMP4am9v71/zFcwJQ9d1l8fj6VdKfc252EovEZnTNG1nT0/Pb3OV03JlejyeF+92EABKKZ+I9IVCoYdyllsto7m5+VkR6XA+tLIq5vF4PvXqq6/GsmVmfTOampo2iciPihtXWbR+fn7+56tlZoWhlDoMVBYtpPJqZ2Nj4xPZMlbAaGxs/DwLvcn3rTRN+yFZmogVMDRN+15JIiqvtjc1NT22PDEDRmNj4yeBr5QspDJKKfXt5WkZMFwu19Pc2d1sJ/XF5ubmDekJGcPrxdGnZW3cuJHa2lq8Ph+XLl7k7NmziJgeGuRVZWUl9fX1rFu3jvHxcYaGhrh586ZVO80wjCeBXyYTUjB27dq1Gdhq1bmhoYFHHn00I21kZIRfvfIKs7OzVm1T2rJlC8/s2UNFRUUq7fGGBg6//DKjo6OWPJVSGTBSXxOXy/U5q4E+sHXrChAAwWCQfW1t+P1+q9YZPukgYOFN+cbu3bhcLqvWn9Z1PVU5BUMp9bBVx23btq2aFwgEbAGpqalhz969eDzZp02qq6u5b/16S95Alc/nezD5Ib0Bzdlvz+lYmbt/ZhVIMBhk/4ED+Hw+W/fPo9RzawDt7e2aiHzCqtvly5fzlikUSDAYpHXfvlXfiKQMw+DKlSumPFep/0DyWgM4f/78RqVUbvw5dPLUKa5fzz/LZhaIWRAAJ44fZ2ZmxnSsy6VpWjB1DeB2u4OrF8+vmzMzHOrs5MaNG3nL5gOSr41I17/OnOHYsWMFx5suEcmEAWyy5QhMTEzQ2dFhC0hNTQ372trythGwACIcDpNIJCzHvKhNLHY0NQARWWfXEewBKRMIAG8oFKqCpTej2glXWADyi0OHmJ6ezls2CWT79u2mfjUAzgwOOgkCABG5F5Zg3OuYMxCLxeh46SXTb8gze/aYbiO6u7sdBQGwuOyZglHlqDuFfWXMyOGvRoZE5MOwBMPr+B1wDkgxQSzKC0WGAfaBlAAEmqaVBgZYB1IKEIvKgGF52GdWExMT/OH1102Xv3XrFv39/aUAgYi4YQlGvNg3rKmp4cmnnjJdvqKigr2trbaH/2YkIvOwBON2MW9WSIcqXXaH/wXoNizBsLzBI5+sgkiqFECUUkswRGSuGDexCyKpYgPRNG0OFmFomvZe7uKFy+zEDGCqkQwEArQ5ADab5ufn34Wlr8mkk+aFDsN/cvCgqZ/d+wMB2vbvd/wN8Xq9U7AEY8opYyujz7GxMdvDfzvy+/2TsAjDMIyrTpjaGYY7MR9iUbe6urr+B0ttxkW7joW0EasNwwsd/jvUhrydvEjCGLHjtra62vQw/MzgYM5heCwW41Bnpykg9wcChEKhguNdptSzawDhcPgdwPI63UM7dph6ZfOBSKoQIHX19axZs8Z0rFn0n+RFsgEVETln1c3MIo5ZEEkVAsTGIhIi8u/kdfqK2kmrhu9eu5Yz3+oMldkZs6lJ6z0Dt9udeu70FTXLMAYHBzGM7HvZ7c5Z5mtUR0dHmbQOYzIcDme2GQAul+s4BWwtTtelS5fo7+8nHl8a/IoIp0+dcmTOMhaL0dnRwdWrmT2AsbExjhw5Ynnbg4hkPHPGxpRQKHQa2GHJGaiqqmLzli34/X7evnCB8fFxq1ZZ5Xa72bx5c2p/xoULF+yCbolEIj0p/2WZA9iAMT09zZnBQavV8yoejzM8PMzw8LBtLxGZm5+f/116WsY2pkQi8WtKMNFzh+j3y49hZMDo6+sbBfpKGlKZJCIvLE/Ltin2x1hsSO8i/aW3t/fU8sQVMCKRSFREuksTU1lkAN/PlpF1u7Tb7f4OUNSTgmVUZyQSOZ0tIyuMcDg8BbSxQPH9pHM+n+/51TJXXS+JRqPn6+rqZoGV2/juTk0qpR45evRo1uMVkGfxKBqNnqivr68ELO8EvEM0JSKPRyKRaK5CeVfShoaG/lRXV/cO8Bh5Ti7diVJKvaWU+lIkEhnKV9bUsmI0Gv1nfX39G8BngbV2AyyRBDgqIl+PRCL5tyNS4KZ5XdcrPB7P80qp57izD+e8CXwrEon8uZBKlk4Q6Lq+1uv1PgscAO6z4lEk/Q04GIlEXsNCx9HuWXiX1+v9glJqp4g8AWzIW8lZJYB/KKV+E4/HB/r6+mxNbDt6tqSlpSWQSCQeTv5LAhAENuLMlocZ4L9KqREgKiInb9++/feBgQHrO2KXqegHbXRd9/r9/o8lEol1yf/PEJF7NE2rMAxjxSyyUuq6iBiapk2xcKZ9UkSmenp6xood6wdK0/8BMKRpUF/PQ5cAAAAASUVORK5CYII="
          ></img>
          <h3>
            Are You Sure You Want To Remove{" "}
            <label className={styles.stress}>{selectedProduct.name}</label> From
            Our Stores ?
          </h3>
          <div className={styles.buttons}>
            <button className={styles.confirm} onClick={handleDelete}>
              Confirm
            </button>
            <button
              className={styles.cancel}
              onClick={() => {
                setShowConfirm(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        ""
      )}
      {showModifyPage ? (
        <div className={styles.modifyContainer}>
          <img
            className={styles.close}
            onClick={() => {
              setShowModifyPage(false);
            }}
            src="data:image/png;base64,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"
          ></img>
          <div className={styles.mcLeft}>
            <div className={styles.inputContainer}>
              <div>
                <label>Product Name</label>
                <input placeholder={selectedProduct.name} ref={nameRef} />
              </div>
              <div>
                <label>Price (In USD)</label>
                <input
                  placeholder={selectedProduct.price}
                  ref={priceRef}
                  type="number"
                />
              </div>
              <div>
                <label>Quantity</label>
                <input
                  placeholder={selectedProduct.quantity}
                  ref={quantityRef}
                  type="number"
                />
              </div>
              <div>
                <label>Description</label>
                <textarea
                  placeholder={selectedProduct.desc}
                  ref={descriptionRef}
                />
              </div>
              <div>
                <label>New Product Image</label>
                <input
                  onChange={(e) => {
                    let reader = new FileReader();
                    reader.readAsDataURL(e.target.files[0]);
                    reader.onload = () => {
                      setTempImage(reader.result);
                    };
                  }}
                  type="file"
                  accept="image/*"
                  ref={imageRef}
                />
              </div>
              <div>
                <button className={styles.submitButton} onClick={handleModify}>
                  Save Modified Changes
                </button>
              </div>
            </div>
          </div>
          <img className={styles.modfiyImage} src={`${tempImage}`} />
        </div>
      ) : (
        ""
      )}
      <table className={styles.contentTable}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Modify</th>
            <th>Remove From Amazon</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod, i) => (
            <tr key={i} className={styles.productContainer}>
              <img
                className={styles.images}
                onClick={() => handleClick(prod.productID)}
                src={`${prod.img}`}
              />
              <td onClick={() => handleClick(prod.productID)}>{prod.name}</td>
              <td onClick={() => handleClick(prod.productID)}>
                {prod.quantity}
              </td>
              <td onClick={() => handleClick(prod.productID)}>
                {prod.price} $
              </td>
              <td>
                <img
                  onClick={() => {
                    setShowModifyPage(true);
                    setSelectedProduct(prod);
                    setTempImage(prod.img);
                  }}
                  className={styles.icons}
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAA6CAYAAADhu0ooAAAABmJLR0QA/wD/AP+gvaeTAAAB/0lEQVRoge3bvWsUQRzG8c8mFoKihWAQhGCjlYiCtQgiWFgJaQKC9qnTxt7GVBZ2amOpiEXASv8AX4LYiGClEizF4FsxHObi7mXndvfm9pgv/Kqb4vneszs33O3Rb+awhGf4gm18xD2cTpirVY7gOf5UzC+soUgVsA2O4o1qyZ2zlihjY2IkB82emU8StRmnsIL9NdcX2NddnG45j2/qt/ohTcx2iJH9nihjFAtYVb571pX9PJGkDdi58dxVLnsWW0aLPp5E2HFZwKbhwHeM1+y1CeQdizLJcWU3KtYnZ5RkrOxb4QQ1dcQcBva6Z9/hWPeR46nTZN1mzwlv2tQRe6yr0+zU0USyN7LjXK5Vszrh7LVpo8nBTO3GkyUjJ0umJEtGTpZMSZaMnCyZkiwZOVkyJVkycrJkSrJk5GTJlGTJyMmSKcmSkZMlU7OuHclN4Rv5qeaq8MjZTDa5mwN4aEab3E0h/Ijz24w0eQOXRrx+096yvWjylRD2KU5UrLml55KLhkNv4WLJugIP9PByHbDi//A/sFyy9iA+6VmTAzaUX47byptd0rMm4ZDQXtW991X5PbuuR03yr51R8yRZuha5r97n4+VUAZsyh3lcqbH2NY53G6dbLihv7ydeCCeik8nStchtw5+dj3Adh1OGaptCeGj3vbDZvBT+VTBz/AXH5S7PTv0ltAAAAABJRU5ErkJggg=="
                ></img>
              </td>
              <td>
                <img
                  onClick={() => {
                    setShowConfirm(true);
                    setSelectedProduct(prod);
                  }}
                  className={styles.icons}
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAABR0lEQVRoge2aQW7CMBAApxx4Cwc40ROU70H7Db7CVwoo+QQc4gjJau2N7TgL7EiWclgnO7FjG7RgvC5z4Ae4ALdIOwMH10cd38QF/LafJNMIZ7rkNoLYLY+RUUf/lseKDzIrdaOpiYmckM/3nrHiTzkimghOw48SN6lANM9nGpEgJqINE9GGiWjDRLRhIh5fwCfQDujTuj67QjmIiJ1M1y5uCTSC+MbFQicjPSmPLtICKxe7IPy73Y+9ahKRyqRIVBeJyaRKTCLyn0yOxGQi/se89K4li4EaEX9kIG0kxCK1N8Sibzc1gbebWn992EP2GRUiodUpR6aqiGSJTZWpJjJkn0iRqSbyMofG/hg/ZEVqeBzjs0XsL1NtmIg2TEQbJqKNtxO5jJpFGFFRgVTkmJFILkWfPacrgunLNGq0X7paFZWFN0aMO8om2mMriVJZAAAAAElFTkSuQmCC"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Toaster />
    </div>
  );
}

export default ViewListing;
