import mongoose, { Schema } from "mongoose";
import { OrderStatus } from "../libs/enums/order.enum";

const orderSchema = new Schema({
    orderSubtotal: {
        type: Number,
        required: true,
    },

    orderDiscount: {
        type: Number,
        default: 0,
    },

    orderTotal: {
        type: Number,
        required: true,
    },

    orderDelivery: {
        type: Number,
        required: true,
    },

    orderStatus: {
        type: String,
        enum: OrderStatus,
        default: OrderStatus.PAUSE,
    },

    memberId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Member",
    },
},
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
