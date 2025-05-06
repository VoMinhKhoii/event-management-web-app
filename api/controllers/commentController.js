import Comment from "../models/Comment.js";

export const createComment = async (req, res) => {
    try {
        const { text } = req.body;

        const newComment = await Comment.create({
            event: req.params.eventId,
            user: req.userId,
            text,
        });

        const populatedComment = await newComment.populate("user", "username avatar");
        res.status(201).json(populatedComment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find({ event: req.params.eventId })
            .populate("user", "username avatar")
            .populate("replies.user", "username avatar")
            .sort({ createdAt: -1 });
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { text } = req.body;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        comment.text = text;
        await comment.save();

        const populatedComment = await comment.populate("user", "username avatar");
        res.status(200).json(populatedComment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.user.toString() !== req.userId) {
            return res.status(403).json({ message: "You are not authorized to delete this comment" });
        }

        await Comment.findByIdAndDelete(commentId);
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createReply = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { text } = req.body;

        // Add validation
        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Reply text cannot be empty" });
        }

        // Check authentication
        if (!req.userId) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Add reply to comment
        comment.replies.push({ user: req.userId, text });
        await comment.save();

        // Get fully populated comment with both comment user and reply users
        const populatedComment = await Comment.findById(commentId)
            .populate("user", "username avatar email")
            .populate("replies.user", "username avatar email");
            
        // Log success for debugging
        console.log(`Reply added to comment ${commentId} by user ${req.userId}`);
            
        res.status(201).json(populatedComment);
    } catch (err) {
        console.error("Error creating reply:", err);
        res.status(500).json({ message: err.message });
    }
};

export const updateReply = async (req, res) => {
    try {
        const { commentId, replyId } = req.params;
        const { text } = req.body;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const reply = comment.replies.id(replyId);
        if (!reply) {
            return res.status(404).json({ message: "Reply not found" });
        }

        if (reply.user.toString() !== req.userId) {
            return res.status(403).json({ message: "You are not authorized to update this reply" });
        }

        reply.text = text;
        await comment.save();

        const populatedComment = await comment.populate("replies.user", "username avatar");
        res.status(200).json(populatedComment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteReply = async (req, res) => {
    try {
        const { commentId, replyId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const reply = comment.replies.id(replyId);
        if (!reply) {
            return res.status(404).json({ message: "Reply not found" });
        }

        if (reply.user.toString() !== req.userId) {
            return res.status(403).json({ message: "You are not authorized to delete this reply" });
        }

        comment.replies.pull({ _id: replyId });
        await comment.save();

        const populatedComment = await Comment.findById(commentId)
            .populate("user", "username avatar email")
            .populate("replies.user", "username avatar email");
        res.status(200).json(populatedComment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
