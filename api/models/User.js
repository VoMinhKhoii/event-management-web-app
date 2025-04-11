import mongoose from "mongoose";


const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please add first name"]
    },

    lastName: {
        type: String,
        required: [true, "Please add last name"]
    },
    username: {
        type: String,
        required: [true, "Please add username"],
        unique: [true, "Username has been used"]
    },

    email: {
        type: String,
        required: [true, "Please add an email address"],
        unique: [true, "Email address has been used"],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email',
        ],
    },

    password: {
        type: String,
        required: [true, "Please add a password"]
    },
    avatar: {
        type: String,
    }
},
{
    timestamps: true,
})

const User = mongoose.model("User", userSchema);
export default User;