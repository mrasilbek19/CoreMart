import Errors, { HttpCode, Message } from "../libs/Errors";
import { Request, Response } from "express";
import { T } from "../libs/types/common";
import { AdminRequest } from "../libs/types/member";
import { ProductInput } from "../libs/types/product";
import ProductService from "../models/Product.service";

const productService = new ProductService();

const productController: T = {}

/** SSR **/
productController.addNewProduct = async (req: AdminRequest, res: Response) => {
    try {
        console.log("addNewProduct");

        if (!req.files?.length)
            throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);

        const data: ProductInput = req.body;
        data.productImages = req.files?.map(ele => {
            return ele.path.replace(/\\/g, "/");
        });

        await productService.createNewProduct(data);

        res.send(
            `<script> alert("Successful creation"); window.location.replace('/admin/product/all')</script>`
        );

    } catch (err) {
        console.log("Error, CreateNewProduct:", err);
        const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG
        res.send(
            `<script> alert("${message}"); window.location.replace('/admin/product/all')</script>`
        );
    }
}

productController.getAllProducts = async (req: Request, res: Response) => {
    try {
        console.log("getAllProducts")
        const data = await productService.getAllProducts();

        res.render("products", { products: data })
    } catch (err) {
        console.log("Error, signup:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

productController.updateChosenProduct = async (req: Request, res: Response) => {
    try {
        console.log("updateChosenProduct");
        const id = req.params.id as string;

        const result = await productService.updateChosenProduct(id, req.body);

        res.status(HttpCode.OK).json({ data: result });
    } catch (err) {
        console.log("Error, updateChosenProduct", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};



/** SPA **/


export default productController;