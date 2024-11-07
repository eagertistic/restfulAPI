import mongoose from "mongoose";

const { Schema, model } = mongoose;

const blogSchema = new Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true, //A post can't have no title
      trim: true,
    },
    content: {
      type: String,
      required: true, // A post without content? what is it
      trim: true,
    },
    category: {
      type: String,
      required: true, // makes searching easier
    },
    tags: {
      type: [String], // it says tag"s"
      required: true, // I just love tags hashtag#must
    },
  },
  {
    timestamps: true, // so people can have the nostalgic
  }
);

const BlogPost = model("BlogPost", blogSchema);

export default BlogPost;
