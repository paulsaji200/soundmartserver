import mongoose from "mongoose";

const uri = "mongodb+srv://paulsaji201:8wMzX3r7MwbjHXlp@cluster0.jrprq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const connectDb = () => {
  return mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Database connected");
    })
    .catch((error) => {
      console.error("Connection failed:", error);
    });
};

export default connectDb;


// 8wMzX3r7MwbjHXlp
// paulsaji201