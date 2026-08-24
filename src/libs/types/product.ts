import { ObjectId } from "mongoose";
import {
    ProductCollection,
    ProductStatus
} from "../enums/product.enum";


export interface Product {
    _id: ObjectId;
    productStatus: ProductStatus;
    productCollection: ProductCollection;
    productName: string;
    productPrice: number;
    productLeftCount: number;
    productVolume: number;
    productDecs?: string;
    productImages: string[];
    productViews: number;
    productLikes: number;
    isLiked?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductInquiry {
    order: string;
    page: number;
    limit: number;
    productCollection?: ProductCollection;
    search?: string;
}

export interface ProductInput {
    productStatus?: ProductStatus;
    productCollection: ProductCollection;
    productName: string;
    productPrice: number;
    productLeftCount: number;
    productVolume?: number;
    productDecs?: string;
    productImages?: string[];
    productViews?: number;
    productLikes?: number;
}

export interface ProductUpdateInput {
    _id: ObjectId;
    productStatus?: ProductStatus;
    productCollection?: ProductCollection;
    productName?: string;
    productPrice?: number;
    productLeftCount?: number;
    productVolume?: number;
    productDecs?: string;
    productImages?: string[];
    productViews?: number;
    productLikes?: number;
}
