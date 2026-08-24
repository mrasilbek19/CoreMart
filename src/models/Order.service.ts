import OrderItemModel from "../schema/OrderItem.model";
import OrderModel from "../schema/Order.model";
import { Member } from "../libs/types/member";
import { Order, OrderItemInput, OrderUpdateInput } from "../libs/types/order";
import { shapeIntoMongooseObkectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { ObjectId } from "mongoose";
import { orderInquiry } from "../libs/types/order";
import MemberService from "./Member.service";
import { OrderStatus } from "../libs/enums/order.enum";
import ProductModel from "../schema/Product.model";


class OrderService {
    private readonly orderModel;
    private readonly orderItemModel;
    private readonly memberService;

    constructor() {
        this.orderModel = OrderModel;
        this.orderItemModel = OrderItemModel;
        this.memberService = new MemberService();
    }

    public async createOrder(
        member: Member,
        input: OrderItemInput[]
    ): Promise<Order> {
        const memberId = shapeIntoMongooseObkectId(member._id);

        try {
            const productIds = input.map((item) =>
                shapeIntoMongooseObkectId(item.productId)
            );
            const products = await ProductModel.find({ _id: { $in: productIds } });

            const orderItems = input.map((item) => {
                const product = products.find(
                    (entry) => entry._id.toString() === item.productId.toString()
                );
                if (!product) {
                    throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
                }

                return {
                    ...item,
                    itemPrice: product.productPrice,
                };
            });

            const subtotal = orderItems.reduce((total, item) => {
                return total + item.itemPrice * item.itemQuantity;
            }, 0);
            const previousOrders = await this.orderModel.countDocuments({
                memberId,
                orderStatus: { $ne: OrderStatus.DELETE },
            });
            const discount = previousOrders === 0
                ? Math.round(subtotal * 0.2 * 100) / 100
                : 0;
            const delivery = subtotal < 100 ? 5 : 0;
            const total = Math.round((subtotal - discount + delivery) * 100) / 100;

            const newOrder: Order = await this.orderModel.create({
                orderSubtotal: subtotal,
                orderDiscount: discount,
                orderTotal: total,
                orderDelivery: delivery,
                memberId: memberId,
            });

            const orderId = newOrder._id
            await this.recordOrderItem(orderId, orderItems)
            return newOrder;
        } catch (err) {
            console.log("Error, model:createOrder:", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }

    }

    private async recordOrderItem(orderId: ObjectId, input: OrderItemInput[]): Promise<void> {
        const promisedList = input.map(async (item: OrderItemInput) => {
            item.orderId = orderId;
            item.productId = shapeIntoMongooseObkectId(item.productId);
            await this.orderItemModel.create(item);
            return "INSERTED";
        });

        const orderItemsState = await Promise.all(promisedList);
        console.log("orderItemsState:", orderItemsState);
    }

    public async getMyOrders(
        member: Member,
        inquiry: orderInquiry
    ): Promise<Order[]> {
        const memberId = shapeIntoMongooseObkectId(member._id);
        const matches = { memberId: memberId, orderStatus: inquiry.orderStatus };

        const result = await this.orderModel
            .aggregate([
                { $match: matches },
                { $sort: { updatedAt: -1 } },
                { $skip: (inquiry.page - 1) * inquiry.limit },
                { $limit: inquiry.limit },
                {
                    $lookup: {
                        from: "orderItems",
                        localField: "_id",
                        foreignField: "orderId",
                        as: "orderItems",
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "orderItems.productId",
                        foreignField: "_id",
                        as: "productData",
                    }
                },
            ])
            .exec();

        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        return result;
    }

    public async updateOrder(
        member: Member,
        input: OrderUpdateInput
    ): Promise<Order> {
        const memberId = shapeIntoMongooseObkectId(member._id),
            orderId = shapeIntoMongooseObkectId(input.orderId),
            orderStatus = input.orderStatus;

        const result = await this.orderModel
            .findOneAndUpdate(
                {
                    memberId: memberId,
                    _id: orderId,
                },
                { orderStatus: orderStatus },
                { new: true }
            )
            .exec();

        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

        if (orderStatus === OrderStatus.PROCESS) {
            await this.memberService.addUserPoint(member, 1)
        }

        return result;
    }
}

export default OrderService;
