import express from "express";
import {
    createComment,
    getAllComments,
    updateComment,
    deleteComment,
    createReply,
    updateReply,
    deleteReply,
} from "../controllers/commentController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/:eventId", verifyToken, createComment);
router.get("/:eventId", getAllComments);
router.put("/:commentId", verifyToken, updateComment);
router.delete("/:commentId", verifyToken, deleteComment);

router.post("/:commentId/replies", verifyToken, createReply);
router.put("/:commentId/replies/:replyId", verifyToken, updateReply);
router.delete("/:commentId/replies/:replyId", verifyToken, deleteReply);

export default router;
