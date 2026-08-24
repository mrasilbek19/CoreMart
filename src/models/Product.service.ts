import { shapeIntoMongooseObkectId } from "../libs/config";
import { ProductStatus } from "../libs/enums/product.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { ObjectId } from "mongoose";
import { Product, ProductInput, ProductInquiry, ProductUpdateInput } from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import ViewService from "./View.service";
import LikeService from "./Like.service";
import { LikeInput } from "../libs/types/like";
import { LikeGroup } from "../libs/enums/like.enum";

class ProductService {
    private readonly productModel;
    private readonly viewService: ViewService;
    private readonly likeService: LikeService;

    constructor() {
        this.productModel = ProductModel;
        this.viewService = new ViewService();
        this.likeService = new LikeService();
    }


    /** SPA */

    public async getProducts(
        memberId: ObjectId | null,
        inquiry: ProductInquiry
    ): Promise<Product[]> {
        const match: T = { productStatus: ProductStatus.PROCESS };

        if (inquiry.productCollection)
            match.productCollection = inquiry.productCollection;
        if (inquiry.search) {
            match.productName = { $regex: new RegExp(inquiry.search, "i") };
        }

        const sort: T =
            inquiry.order === "productPrice"
                ? { [inquiry.order]: 1 }
                : { [inquiry.order]: -1 };

        const result = await this.productModel
            .aggregate([
                { $match: match },
                { $sort: sort },
                { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
                { $limit: inquiry.limit * 1 },
            ])
            .exec();

        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        if (!memberId) return result;

        const likes = await this.likeService.getMemberLikes(
            memberId,
            LikeGroup.PRODUCT
        );
        const likedIds = likes.map((like) => String(like.likeRefId));

        return result.map((product) => ({
            ...product,
            isLiked: likedIds.includes(String(product._id)),
        }));
    };

    public async getProduct(
        memberId: ObjectId | null,
        id: string
    ): Promise<Product> {
        const productId = shapeIntoMongooseObkectId(id);

        let result = await this.productModel
            .findOne({
                _id: productId,
                productStatus: ProductStatus.PROCESS,
            })
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        if (memberId) {
            const input: ViewInput = {
                memberId: memberId,
                viewRefId: productId,
                viewGroup: ViewGroup.PRODUCT,
            };
            const existView = await this.viewService.checkViewExistence(input);

            console.log("exist:", !!existView);
            if (!existView) {
                await this.viewService.insertMemberView(input);

                result = await this.productModel
                    .findByIdAndUpdate(
                        productId,
                        { $inc: { productViews: +1 } },
                        { new: true }
                    )
                    .exec();
            }
        }
        const product = result.toObject();
        if (!memberId) return product;

        const like = await this.likeService.checkLikeExistence({
            memberId,
            likeRefId: productId,
            likeGroup: LikeGroup.PRODUCT,
        });
        return { ...product, isLiked: !!like };
    }

    public async plusLike(
        memberId: ObjectId | null,
        id: string
    ): Promise<Product> {

        const productId = shapeIntoMongooseObkectId(id);

        let result = await this.productModel
            .findOne({
                _id: productId,
                productStatus: ProductStatus.PROCESS,
            })
            .exec();

        if (!result) {
            throw new Errors(
                HttpCode.NOT_FOUND,
                Message.NO_DATA_FOUND
            );
        }

        if (memberId) {
            const input: LikeInput = {
                memberId: memberId,
                likeRefId: productId,
                likeGroup: LikeGroup.PRODUCT,
            };

            const existLike =
                await this.likeService.checkLikeExistence(input);

            console.log("exist:", !!existLike);

            if (!existLike) {
                await this.likeService.insertMemberLike(input);

                result = await this.productModel
                    .findByIdAndUpdate(
                        productId,
                        { $inc: { productLikes: 1 } },
                        { new: true }
                    )
                    .exec();
            }
        }

        return { ...result.toObject(), isLiked: true };
    }

    public async minusLike(
        memberId: ObjectId | null,
        id: string
    ): Promise<Product> {

        const productId = shapeIntoMongooseObkectId(id);

        let result = await this.productModel
            .findOne({
                _id: productId,
                productStatus: ProductStatus.PROCESS,
            })
            .exec();

        if (!result) {
            throw new Errors(
                HttpCode.NOT_FOUND,
                Message.NO_DATA_FOUND
            );
        }

        if (memberId) {
            const input: LikeInput = {
                memberId: memberId,
                likeRefId: productId,
                likeGroup: LikeGroup.PRODUCT,
            };

            const existLike =
                await this.likeService.checkLikeExistence(input);

            console.log("exist:", !!existLike);

            if (existLike) {
                await this.likeService.removeMemberLike(input);

                result = await this.productModel
                    .findByIdAndUpdate(
                        productId,
                        { $inc: { productLikes: -1 } },
                        { new: true }
                    )
                    .exec();
            }
        }

        return { ...result.toObject(), isLiked: false };
    }

    /** SSR */

    public async createNewProduct(input: ProductInput): Promise<Product> {
        try {
            return await this.productModel.create(input)
        } catch (err) {
            console.error("Error, model:createNewProduct:", err)
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED)
        }
    }

    public async getAllProducts(): Promise<Product[]> {
        const result = await this.productModel
            .find()
            .exec();
        if (!result)
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        return result;
    }

    public async updateChosenProduct(
        id: string,
        input: ProductUpdateInput
    ): Promise<Product> {
        id = shapeIntoMongooseObkectId(id);
        const result = await this.productModel
            .findOneAndUpdate({ _id: id }, input, { new: true })
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED)

        return result;

    }

}

export default ProductService;
