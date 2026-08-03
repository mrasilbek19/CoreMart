import MemberModel from "../schema/Member.Model";

class MemberService {
    private readonly memberModel;
    constructor() {
        this.memberModel = MemberModel;
    }


}

export default MemberService;