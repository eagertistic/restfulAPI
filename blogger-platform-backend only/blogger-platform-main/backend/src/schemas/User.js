// @ts-nocheck
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;
const SALT_WORK_FACTOR = 10; // Number of salt rounds for bcrypt

// Define the User schema
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Remove extra spaces in username
  },
  password: {
    type: String,
    required: true,
  },
});

// Pre-save middleware to hash password before saving to the database
UserSchema.pre("save", async function (next) {
  const user = this;

  // Only hash the password if it has been modified or is new
  if (!user.isModified("password")) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);

    // Hash the password using the new salt
    const hash = await bcrypt.hash(user.password, salt);

    // Replace the plain-text password with the hashed password
    user.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare input password with the hashed password stored in the database
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the User model
const User = mongoose.model("User", UserSchema);

export default User;
