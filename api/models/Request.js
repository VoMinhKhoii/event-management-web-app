import mongoose from "mongoose";
import Participation from "./Participation.js";

const requestSchema = new mongoose.Schema({

});

const Request = Participation.discriminator('Request', requestSchema);

export default Request;
