import Errors, { HttpCode, Message } from "../libs/Errors";
import { Like, LikeInput } from "../libs/types/like";
import LikeModel from "../schema/Like.model";


class LikeService {
    private readonly likeModel

    constructor() {
        this.likeModel = LikeModel;
    }

    public async checkLikeExistence(input: LikeInput): Promise<Like> {
        return await this.likeModel
            .findOne({ memberId: input.memberId, likeRefId: input.likeRefId })
            .exec();
    }

    public async insertMemberLike(input: LikeInput): Promise<Like> {
        try {
            return await this.likeModel.create(input);
        } catch (err) {
            console.log("ERROR, model:insertMemberLike:", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

}

export default LikeService;