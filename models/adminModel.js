import mongoose from "mongoose";
const adminSchema = new mongoose.Schema({

name:{
    type:String,
    required:true,

},email:{

type:String,
required:true

},password:{
    type:String,
    required:true
    
},isadmin:{
    type:String,
    default:true
}

}
)
const adminData = mongoose.model('adminData', adminSchema);

export default adminData;
