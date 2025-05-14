import mongoose from "mongoose";

const adminSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please add username"],
        unique: [true, "Username has been used"]
    },
    password: {
        type: String,
        required: [true, "Please add a password"]
    },
},
{
    timestamps: true,
})

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
export default Admin;