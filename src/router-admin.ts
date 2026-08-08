import express from "express";
import shopController from "./controllers/shop.controller";
import makeUploader from "./libs/utils/uploader";
import productController from "./controllers/product.controller";
const routerAdmin = express.Router();

routerAdmin.get("/", shopController.goHome);
routerAdmin
    .get("/login", shopController.getLogin)
    .post("/login", shopController.processLogin);

routerAdmin
    .get("/signup", shopController.getSignup)
    .post(
        "/signup",
        makeUploader("members").single("memberImage"),
        shopController.processSignup
    );

routerAdmin.get("/logout", shopController.getLogout);


//Product
routerAdmin.post(
    "/product/add",
    shopController.verifyShop,
    makeUploader("products").array("productImages", 5),
    productController.addNewProduct
);

routerAdmin.get(
    "/product/all",
    shopController.verifyShop,
    productController.getAllProducts
);




//User
routerAdmin.get("/users",
    shopController.verifyShop,
    shopController.getUsers
);

routerAdmin.post(
    "/user/edit",
    shopController.verifyShop,
    shopController.updateChosenUser
);


export default routerAdmin;