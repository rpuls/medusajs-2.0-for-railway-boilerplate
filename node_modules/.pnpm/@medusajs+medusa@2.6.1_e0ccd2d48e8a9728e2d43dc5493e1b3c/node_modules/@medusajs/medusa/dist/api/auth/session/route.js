"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = void 0;
const POST = async (req, res) => {
    req.session.auth_context = req.auth_context;
    res.status(200).json({ user: req.auth_context });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    req.session.destroy();
    res.json({ success: true });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map