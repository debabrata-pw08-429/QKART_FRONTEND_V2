import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Cart from "./Cart";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import "./Products.css";
import { generateCartItemsFrom } from "./Cart";

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setLoading] = useState(true);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    performAPICall();
  }, []);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchCart(localStorage.getItem("token"))
        .then((cartItems) => {
          return generateCartItemsFrom(cartItems, data);
        })
        .then((res) => {
          console.log(res);
          setCartData(res);
        });
    }
  }, [data]);

  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    setLoading(true);

    try {
      let res = await axios.get(`${config.endpoint}/products`);
      console.log(res.data);

      setLoading(false);

      setData(res.data);
      setFilteredData(res.data);
    } catch (e) {
      
      setLoading(false);

      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar("Something Went Wrong", { variant: "error" });
      }
    }
  };

  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try {
      const res = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      setFilteredData(res.data);
    } catch (e) {
      if (e.response) {
        if (e.response.status === 404) {
          setFilteredData([]);
        } else if (e.response.status === 500) {
          setFilteredData(data);
          enqueueSnackbar(e.response.data.message, { variant: "error" });
        }
      }
    }
  };

  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    const value = event.target.value;

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(async () => {
      await performSearch(value);
    }, 500);

    setDebounceTimeout(timeout);
  };

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        // TODO: Process the response data if needed
        const cartData = response.data;
        console.log("Cart data:", cartData);
        return cartData;
      } else {
        // Handle other status codes if necessary
        console.error("Failed to fetch cart. Status:", response.status);
        return null;
      }
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    let p = false;

    items.forEach((ele) => {
      if (ele.productId === productId) p = true;
    });

    return p;
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */

  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if (!token) {
      enqueueSnackbar("Login to add an item to the Cart", {
        variant: "warning",
      });
    } else {
      if (isItemInCart(items, productId)) {
        enqueueSnackbar(
          "Item already in cart. Use the cart sidebar to update quantity or remove item.",
          { variant: "warning" }
        );
      } else {
        const res = await axios.post(
          `${config.endpoint}/cart`,
          { productId, qty },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = generateCartItemsFrom(res.data, data);
        setCartData(result);
      }
    }
  };

  const handleQuantity = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if (!token) {
      enqueueSnackbar("Login to add an item to the Cart", {
        variant: "warning",
      });
    } else {
      const res = await axios.post(
        `${config.endpoint}/cart`,
        { productId, qty },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = generateCartItemsFrom(res.data, data);
      setCartData(result);
    }
  };

  let handleCartButton = (e, product) => {
    const [obj] = filteredData.filter((ele) => {
      return product._id === ele._id;
    });

    addToCart(localStorage.getItem("token"), cartData, data, obj._id, 1);
  };
  
  return (
    <div>
      <Header>
        <TextField
          className="search-desktop"
          size="small"
          InputProps={{
            className: "search",
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(e) => {
            debounceSearch(e, debounceTimeout);
          }}
        />
      </Header>

      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => {
          debounceSearch(e, debounceTimeout);
        }}
      />
      
      <Grid container>
        <Grid
          item
          className="product-grid"
          md={localStorage.getItem("token") ? 9 : 12}
        >
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>
          {isLoading ? (
            <Box className="loading">
              <CircularProgress />
              <div>Loading Products...</div>
            </Box>
          ) : (
            <div className="product-container">
              <Grid container spacing={3}>
                {filteredData.length ? (
                  filteredData.map((ele) => (
                    <Grid item xs={6} md={3} key={ele._id}>
                      <ProductCard
                        product={ele}
                        handleAddToCart={(e) => handleCartButton(e, ele)}
                      />
                    </Grid>
                  ))
                ) : (
                  <Box className="loading">
                    <SentimentDissatisfied />
                    <div>No products found</div>
                  </Box>
                )}
              </Grid>
            </div>
          )}
        </Grid>
        
        {localStorage.getItem("token") ? (
          <Grid item xs={12} md={3} className="cart-container">
            <Cart
              items={cartData}
              products={data}
              handleQuantity={handleQuantity}
            />
          </Grid>
        ) : null}
      </Grid>

      <Footer />
    </div>
  );
};

export default Products;
