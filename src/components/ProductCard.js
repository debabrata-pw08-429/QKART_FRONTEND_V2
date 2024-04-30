import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  let { name, category, cost, rating, image, _id } = product;

  return (
    <Card id={_id} className="card">
      <CardMedia component="img" alt={name} src={image} />

      <CardContent>
        <Typography variant="h5" component="div">
          {name}
        </Typography>

        <Typography variant="h6" fontWeight="fontWeightBold">
          {`$${cost}`}
        </Typography>

        <Rating name="read-only" value={rating} precision={0.5} readOnly />
      </CardContent>

      <CardActions>
        <Button
          startIcon={<AddShoppingCartOutlined />}
          onClick={handleAddToCart}
          fullWidth
          className="card-button"
          variant="contained"
        >
          ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
