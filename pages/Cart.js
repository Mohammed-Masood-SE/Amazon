import { useMoralis } from "react-moralis";
import styles from "../styles/Cart.module.css";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";

function Cart() {
  const router = useRouter();
  const { isAuthenticated, authenticate, account, Moralis } = useMoralis();
  const [userCart, setUserCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [openShipping, setOpenShipping] = useState(false);
  const [inVilla, setInVilla] = useState(false);
  const countryRef = useRef();
  const cityRef = useRef();
  const areaRef = useRef();
  const streetRef = useRef();
  const villaNoRef = useRef();
  const buildingNameRef = useRef();
  const roomNoRef = useRef();

  useEffect(() => {
    setUserCart([]);
    getUserCart();
  }, [account, isAuthenticated]);

  useEffect(() => {
    if (userCart) {
      if (userCart.length > 0) {
        getProducts();
      }
    }
  }, [userCart]);

  useEffect(() => {
    if (products) {
      let total = 0;
      if (userCart) {
        userCart.forEach((prod, i) => {
          total += prod.quantity * products[i].price;
        });
        setTotalPrice(total);
      }
    }
  }, [products]);

  async function getUserCart() {
    if (account && isAuthenticated) {
      const { data } = await axios.get(`/api/carts/${account}`);
      setUserCart(data.products);
    }
  }

  async function getProducts() {
    let temp = { prod: [] };
    if (account && isAuthenticated) {
      for (let i = 0; i < userCart.length; i++) {
        const { data } = await axios.get(
          `/api/products/${userCart[i].productID}`
        );
        temp.prod.push(data);
      }
    }

    setProducts(temp.prod);
  }

  function handleClick(link) {
    router.push(`/products/${link}`);
  }

  function handleRemove(i) {
    let newCart = [...userCart];
    newCart.splice(i, 1);
    let newProducts = [...products];
    newProducts.splice(i, 1);
    setProducts(newProducts);
    setUserCart(newCart);
    updateCart(newCart);
  }

  async function getEthPrice() {
    if (products) {
      const options = {
        address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        chain: "eth",
      };
      const price = await Moralis.Web3API.token.getTokenPrice(options);
      const etherPrice = totalPrice / price.usdPrice;
      return etherPrice;
    }
  }

  async function updateCart(newCart) {
    const msg = await axios.post(`/api/carts/${account}`, {
      cart: { products: newCart },
    });
    toast.success("Removed From Cart");
  }

  function handleInVilla(e) {
    if (e.target.value === "true") {
      setInVilla(true);
    } else {
      setInVilla(false);
    }
  }

  async function purchase() {
    // Get Address
    const Address = {};
    const country = countryRef.current.value;
    const city = cityRef.current.value;
    const area = areaRef.current.value;
    const street = streetRef.current.value;
    if (city && area && street && country) {
      if (inVilla) {
        const villaNumber = villaNoRef.current.value;
        Address.country = country;
        Address.city = city;
        Address.area = area;
        Address.street = street;
        Address.villaNumber = villaNumber;
        if (villaNumber) {
        } else {
          toast.error("Enter Villa Number !");
          return;
        }
      } else {
        const buildingName = buildingNameRef.current.value;
        const roomNumber = roomNoRef.current.value;
        Address.country = country;
        Address.city = city;
        Address.area = area;
        Address.street = street;
        Address.buildingName = buildingName;
        Address.roomNumber = roomNumber;
        if (buildingName && roomNumber) {
        } else {
          toast.error("Enter Building Name And Room Number !");
          return;
        }
      }
    } else {
      toast.error("Some Fields Are Empty!");
      return;
    }

    // Check If The Item Quantity Still Persists ..... Ik Big Words... Smart Guy

    let temp = { prod: [] };
    for (let i = 0; i < userCart.length; i++) {
      const { data } = await axios.get(
        `/api/products/${userCart[i].productID}`
      );
      temp.prod.push(data);
    }
    let canBuy = true;
    let itemsWithLowQuantity = [];
    for (let i = 0; i < temp.prod.length; i++) {
      if (userCart[i].quantity > temp.prod[i].quantity) {
        canBuy = false;
        itemsWithLowQuantity.push(i);
      }
    }

    if (canBuy) {
      // Make Eth Transfer
      const etherPrice = await getEthPrice(); // get Eth Price
      //Send Eth To Amazon Owner AKA me
      const options = {
        type: "native",
        amount: Moralis.Units.ETH(etherPrice),
        receiver: "0x4E10a942a716209EFF0470007b9f7Ff932559Bc0",
      };
      let result = await Moralis.transfer(options);

      if (result) {
        toast.success("Order Successfull !");
        setOpenShipping(false);
        // Update Quantity From Products
        for (let i = 0; i < userCart.length; i++) {
          const msg = await axios.post(
            `/api/products/Modify/updatequantity/${userCart[i].productID}`,
            {
              quantity: userCart[i].quantity,
            }
          );
        }
        // Save Order In Database
        var date = new Date();
        var dd = String(date.getDate()).padStart(2, "0");
        var mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyy = date.getFullYear();
        date = mm + "/" + dd + "/" + yyyy;
        let order = { userCart, Address, Delivered: false, date };
        const msg = await axios.post(`/api/orders/${account}`, {
          order,
        });
        // Clear User Cart
        const msg2 = await axios.post(`/api/carts/${account}`, {
          cart: { products: [] },
        });
        setUserCart([]);
        setProducts([]);
      } else {
        toast.error("Order Failed !");
      }
    } else {
      for (let i = 0; i < itemsWithLowQuantity.length; i++) {
        toast.error(`We Do Not Have That Many ${temp.prod[i].name}s In Store`);
      }
    }
  }

  return (
    <div>
      {openShipping ? (
        <div className={styles.Shipping}>
          <img
            onClick={() => {
              setOpenShipping(false);
            }}
            src="data:image/png;base64,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"
          ></img>
          <h1>Shipping Details</h1>
          <div className={styles.locationContainer}>
            <div>
              <label>Country</label>
              <select ref={countryRef}>
                <option value="Afghanistan">Afghanistan</option>
                <option value="Åland Islands">Åland Islands</option>
                <option value="Albania">Albania</option>
                <option value="Algeria">Algeria</option>
                <option value="American Samoa">American Samoa</option>
                <option value="Andorra">Andorra</option>
                <option value="Angola">Angola</option>
                <option value="Anguilla">Anguilla</option>
                <option value="Antarctica">Antarctica</option>
                <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                <option value="Argentina">Argentina</option>
                <option value="Armenia">Armenia</option>
                <option value="Aruba">Aruba</option>
                <option value="Australia">Australia</option>
                <option value="Austria">Austria</option>
                <option value="Azerbaijan">Azerbaijan</option>
                <option value="Bahamas">Bahamas</option>
                <option value="Bahrain">Bahrain</option>
                <option value="Bangladesh">Bangladesh</option>
                <option value="Barbados">Barbados</option>
                <option value="Belarus">Belarus</option>
                <option value="Belgium">Belgium</option>
                <option value="Belize">Belize</option>
                <option value="Benin">Benin</option>
                <option value="Bermuda">Bermuda</option>
                <option value="Bhutan">Bhutan</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Bosnia and Herzegovina">
                  Bosnia and Herzegovina
                </option>
                <option value="Botswana">Botswana</option>
                <option value="Bouvet Island">Bouvet Island</option>
                <option value="Brazil">Brazil</option>
                <option value="British Indian Ocean Territory">
                  British Indian Ocean Territory
                </option>
                <option value="Brunei Darussalam">Brunei Darussalam</option>
                <option value="Bulgaria">Bulgaria</option>
                <option value="Burkina Faso">Burkina Faso</option>
                <option value="Burundi">Burundi</option>
                <option value="Cambodia">Cambodia</option>
                <option value="Cameroon">Cameroon</option>
                <option value="Canada">Canada</option>
                <option value="Cape Verde">Cape Verde</option>
                <option value="Cayman Islands">Cayman Islands</option>
                <option value="Central African Republic">
                  Central African Republic
                </option>
                <option value="Chad">Chad</option>
                <option value="Chile">Chile</option>
                <option value="China">China</option>
                <option value="Christmas Island">Christmas Island</option>
                <option value="Cocos (Keeling) Islands">
                  Cocos (Keeling) Islands
                </option>
                <option value="Colombia">Colombia</option>
                <option value="Comoros">Comoros</option>
                <option value="Congo">Congo</option>
                <option value="Congo, The Democratic Republic of The">
                  Congo, The Democratic Republic of The
                </option>
                <option value="Cook Islands">Cook Islands</option>
                <option value="Costa Rica">Costa Rica</option>
                <option value="Cote D'ivoire">Cote D'ivoire</option>
                <option value="Croatia">Croatia</option>
                <option value="Cuba">Cuba</option>
                <option value="Cyprus">Cyprus</option>
                <option value="Czech Republic">Czech Republic</option>
                <option value="Denmark">Denmark</option>
                <option value="Djibouti">Djibouti</option>
                <option value="Dominica">Dominica</option>
                <option value="Dominican Republic">Dominican Republic</option>
                <option value="Ecuador">Ecuador</option>
                <option value="Egypt">Egypt</option>
                <option value="El Salvador">El Salvador</option>
                <option value="Equatorial Guinea">Equatorial Guinea</option>
                <option value="Eritrea">Eritrea</option>
                <option value="Estonia">Estonia</option>
                <option value="Ethiopia">Ethiopia</option>
                <option value="Falkland Islands (Malvinas)">
                  Falkland Islands (Malvinas)
                </option>
                <option value="Faroe Islands">Faroe Islands</option>
                <option value="Fiji">Fiji</option>
                <option value="Finland">Finland</option>
                <option value="France">France</option>
                <option value="French Guiana">French Guiana</option>
                <option value="French Polynesia">French Polynesia</option>
                <option value="French Southern Territories">
                  French Southern Territories
                </option>
                <option value="Gabon">Gabon</option>
                <option value="Gambia">Gambia</option>
                <option value="Georgia">Georgia</option>
                <option value="Germany">Germany</option>
                <option value="Ghana">Ghana</option>
                <option value="Gibraltar">Gibraltar</option>
                <option value="Greece">Greece</option>
                <option value="Greenland">Greenland</option>
                <option value="Grenada">Grenada</option>
                <option value="Guadeloupe">Guadeloupe</option>
                <option value="Guam">Guam</option>
                <option value="Guatemala">Guatemala</option>
                <option value="Guernsey">Guernsey</option>
                <option value="Guinea">Guinea</option>
                <option value="Guinea-bissau">Guinea-bissau</option>
                <option value="Guyana">Guyana</option>
                <option value="Haiti">Haiti</option>
                <option value="Heard Island and Mcdonald Islands">
                  Heard Island and Mcdonald Islands
                </option>
                <option value="Holy See (Vatican City State)">
                  Holy See (Vatican City State)
                </option>
                <option value="Honduras">Honduras</option>
                <option value="Hong Kong">Hong Kong</option>
                <option value="Hungary">Hungary</option>
                <option value="Iceland">Iceland</option>
                <option value="India">India</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Iran, Islamic Republic of">
                  Iran, Islamic Republic of
                </option>
                <option value="Iraq">Iraq</option>
                <option value="Ireland">Ireland</option>
                <option value="Isle of Man">Isle of Man</option>
                <option value="Israel">Israel</option>
                <option value="Italy">Italy</option>
                <option value="Jamaica">Jamaica</option>
                <option value="Japan">Japan</option>
                <option value="Jersey">Jersey</option>
                <option value="Jordan">Jordan</option>
                <option value="Kazakhstan">Kazakhstan</option>
                <option value="Kenya">Kenya</option>
                <option value="Kiribati">Kiribati</option>
                <option value="Korea, Democratic People's Republic of">
                  Korea, Democratic People's Republic of
                </option>
                <option value="Korea, Republic of">Korea, Republic of</option>
                <option value="Kuwait">Kuwait</option>
                <option value="Kyrgyzstan">Kyrgyzstan</option>
                <option value="Lao People's Democratic Republic">
                  Lao People's Democratic Republic
                </option>
                <option value="Latvia">Latvia</option>
                <option value="Lebanon">Lebanon</option>
                <option value="Lesotho">Lesotho</option>
                <option value="Liberia">Liberia</option>
                <option value="Libyan Arab Jamahiriya">
                  Libyan Arab Jamahiriya
                </option>
                <option value="Liechtenstein">Liechtenstein</option>
                <option value="Lithuania">Lithuania</option>
                <option value="Luxembourg">Luxembourg</option>
                <option value="Macao">Macao</option>
                <option value="Macedonia, The Former Yugoslav Republic of">
                  Macedonia, The Former Yugoslav Republic of
                </option>
                <option value="Madagascar">Madagascar</option>
                <option value="Malawi">Malawi</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Maldives">Maldives</option>
                <option value="Mali">Mali</option>
                <option value="Malta">Malta</option>
                <option value="Marshall Islands">Marshall Islands</option>
                <option value="Martinique">Martinique</option>
                <option value="Mauritania">Mauritania</option>
                <option value="Mauritius">Mauritius</option>
                <option value="Mayotte">Mayotte</option>
                <option value="Mexico">Mexico</option>
                <option value="Micronesia, Federated States of">
                  Micronesia, Federated States of
                </option>
                <option value="Moldova, Republic of">
                  Moldova, Republic of
                </option>
                <option value="Monaco">Monaco</option>
                <option value="Mongolia">Mongolia</option>
                <option value="Montenegro">Montenegro</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Morocco">Morocco</option>
                <option value="Mozambique">Mozambique</option>
                <option value="Myanmar">Myanmar</option>
                <option value="Namibia">Namibia</option>
                <option value="Nauru">Nauru</option>
                <option value="Nepal">Nepal</option>
                <option value="Netherlands">Netherlands</option>
                <option value="Netherlands Antilles">
                  Netherlands Antilles
                </option>
                <option value="New Caledonia">New Caledonia</option>
                <option value="New Zealand">New Zealand</option>
                <option value="Nicaragua">Nicaragua</option>
                <option value="Niger">Niger</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Niue">Niue</option>
                <option value="Norfolk Island">Norfolk Island</option>
                <option value="Northern Mariana Islands">
                  Northern Mariana Islands
                </option>
                <option value="Norway">Norway</option>
                <option value="Oman">Oman</option>
                <option value="Pakistan">Pakistan</option>
                <option value="Palau">Palau</option>
                <option value="Palestinian Territory, Occupied">
                  Palestinian Territory, Occupied
                </option>
                <option value="Panama">Panama</option>
                <option value="Papua New Guinea">Papua New Guinea</option>
                <option value="Paraguay">Paraguay</option>
                <option value="Peru">Peru</option>
                <option value="Philippines">Philippines</option>
                <option value="Pitcairn">Pitcairn</option>
                <option value="Poland">Poland</option>
                <option value="Portugal">Portugal</option>
                <option value="Puerto Rico">Puerto Rico</option>
                <option value="Qatar">Qatar</option>
                <option value="Reunion">Reunion</option>
                <option value="Romania">Romania</option>
                <option value="Russian Federation">Russian Federation</option>
                <option value="Rwanda">Rwanda</option>
                <option value="Saint Helena">Saint Helena</option>
                <option value="Saint Kitts and Nevis">
                  Saint Kitts and Nevis
                </option>
                <option value="Saint Lucia">Saint Lucia</option>
                <option value="Saint Pierre and Miquelon">
                  Saint Pierre and Miquelon
                </option>
                <option value="Saint Vincent and The Grenadines">
                  Saint Vincent and The Grenadines
                </option>
                <option value="Samoa">Samoa</option>
                <option value="San Marino">San Marino</option>
                <option value="Sao Tome and Principe">
                  Sao Tome and Principe
                </option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="Senegal">Senegal</option>
                <option value="Serbia">Serbia</option>
                <option value="Seychelles">Seychelles</option>
                <option value="Sierra Leone">Sierra Leone</option>
                <option value="Singapore">Singapore</option>
                <option value="Slovakia">Slovakia</option>
                <option value="Slovenia">Slovenia</option>
                <option value="Solomon Islands">Solomon Islands</option>
                <option value="Somalia">Somalia</option>
                <option value="South Africa">South Africa</option>
                <option value="South Georgia and The South Sandwich Islands">
                  South Georgia and The South Sandwich Islands
                </option>
                <option value="Spain">Spain</option>
                <option value="Sri Lanka">Sri Lanka</option>
                <option value="Sudan">Sudan</option>
                <option value="Suriname">Suriname</option>
                <option value="Svalbard and Jan Mayen">
                  Svalbard and Jan Mayen
                </option>
                <option value="Swaziland">Swaziland</option>
                <option value="Sweden">Sweden</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Syrian Arab Republic">
                  Syrian Arab Republic
                </option>
                <option value="Taiwan">Taiwan</option>
                <option value="Tajikistan">Tajikistan</option>
                <option value="Tanzania, United Republic of">
                  Tanzania, United Republic of
                </option>
                <option value="Thailand">Thailand</option>
                <option value="Timor-leste">Timor-leste</option>
                <option value="Togo">Togo</option>
                <option value="Tokelau">Tokelau</option>
                <option value="Tonga">Tonga</option>
                <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                <option value="Tunisia">Tunisia</option>
                <option value="Turkey">Turkey</option>
                <option value="Turkmenistan">Turkmenistan</option>
                <option value="Turks and Caicos Islands">
                  Turks and Caicos Islands
                </option>
                <option value="Tuvalu">Tuvalu</option>
                <option value="Uganda">Uganda</option>
                <option value="Ukraine">Ukraine</option>
                <option value="United Arab Emirates">
                  United Arab Emirates
                </option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="United States Minor Outlying Islands">
                  United States Minor Outlying Islands
                </option>
                <option value="Uruguay">Uruguay</option>
                <option value="Uzbekistan">Uzbekistan</option>
                <option value="Vanuatu">Vanuatu</option>
                <option value="Venezuela">Venezuela</option>
                <option value="Viet Nam">Viet Nam</option>
                <option value="Virgin Islands, British">
                  Virgin Islands, British
                </option>
                <option value="Virgin Islands, U.S.">
                  Virgin Islands, U.S.
                </option>
                <option value="Wallis and Futuna">Wallis and Futuna</option>
                <option value="Western Sahara">Western Sahara</option>
                <option value="Yemen">Yemen</option>
                <option value="Zambia">Zambia</option>
                <option value="Zimbabwe">Zimbabwe</option>
              </select>
              <label>City</label>
              <input ref={cityRef} />
              <label>Area</label>
              <input ref={areaRef} />
              <label>Street Name</label>
              <input ref={streetRef} />
            </div>
            <div>
              <label>Building / Villa</label>
              <select onChange={handleInVilla}>
                <option value={false}>Building</option>
                <option value={true}>Villa</option>
              </select>
              {inVilla ? (
                <div>
                  <label>Villa Number</label>
                  <input type="number" ref={villaNoRef} />
                </div>
              ) : (
                <div>
                  <label>Building Name</label>
                  <input ref={buildingNameRef} />
                  <label>Room Number</label>
                  <input type="number" ref={roomNoRef} />
                </div>
              )}
              <button className={styles.purchase} onClick={purchase}>
                Purchase
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {account && isAuthenticated ? (
        <div>
          <div className={styles.container}>
            <div className={styles.productList}>
              <h1 className={styles.header}>My Cart</h1>
              <div className={styles.cartContainer}>
                <table className={styles.contentTable}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod, i) => (
                      <tr key={i} className={styles.productContainer}>
                        <img
                          onClick={() => handleClick(prod.productID)}
                          src={`${prod.img}`}
                        />
                        <td onClick={() => handleClick(prod.productID)}>
                          {prod.name}
                        </td>
                        <td onClick={() => handleClick(prod.productID)}>
                          {userCart[i] ? userCart[i].quantity : ""}
                        </td>
                        <td onClick={() => handleClick(prod.productID)}>
                          {prod.price} $
                        </td>
                        <td onClick={() => handleRemove(i)}>
                          <button>
                            <img src="data:image/png;base64,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"></img>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={styles.purchaseNow}>
              <h1>Total Price (USD) : {totalPrice} $</h1>
              {totalPrice > 10 ? (
                <button
                  onClick={() => {
                    setOpenShipping(true);
                  }}
                >
                  Checkout
                </button>
              ) : (
                <h3>Total Price Should Be Over 10$</h3>
              )}
            </div>
          </div>
          <Toaster />
        </div>
      ) : (
        <div className={styles.logIn}>
          <h1>Log In To View Cart</h1>
        </div>
      )}
    </div>
  );
}

export default Cart;
