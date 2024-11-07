import fastify from "fastify";
import User from "../schemas/User.js";

// Utility function to check if username exists
async function checkIfUsernameExists(username) {
  return await User.findOne({ username });
}

async function getAllUsers(request, reply) {
  try {
    const users = await User.find({}); // Fetch all users from the database
    reply.code(200).send(users); // Send the list of users
  } catch (error) {
    reply.code(500).send({ error: "Failed to fetch users" });
  }
}

async function login(request, reply) {
  const { username, password } = request.body;

  if (!username || !password) {
    return reply
      .code(400)
      .send({ message: "Username and password are required" });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return reply.code(401).send({ message: "Invalid username or password" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return reply.code(401).send({ message: "Invalid username or password" });
  }

  const token = request.generateToken(user);
  request.setCookie(reply, token);
  return { accessToken: token };
}

async function logout(request, reply) {
  reply.clearCookie("access_token", {
    path: "/",
  });
  return reply.send({ message: "Logout successful" });
}

async function getUserById(request, reply) {
  try {
    const userId = request.params.id; // Get user ID from request parameters
    const user = await User.findById(userId); // Fetch the user by ID

    if (!user) {
      return reply.code(404).send({ error: "User not found" }); // Send 404 if user not found
    }

    reply.code(200).send(user); // Send the user data with status 200 (OK)
  } catch (error) {
    reply.code(500).send({ error: "Failed to fetch user" });
  }
}

async function createUser(request, reply) {
  try {
    const { username, password } = request.body;
    const existingUsername = await checkIfUsernameExists(username);

    if (existingUsername) {
      return reply.code(400).send({ error: "Username already exists" });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    reply.code(201).send(newUser);
  } catch (error) {
    reply.code(400).send({ error: "Failed to create user" });
  }
}

async function updateUser(request, reply) {
  try {
    const userId = request.params.id;
    const updatedData = request.body;
    let updateMessage = "";

    const user = await User.findById(userId);
    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    // Update username if provided and different
    if (updatedData.username && user.username !== updatedData.username) {
      const existingUsername = await checkIfUsernameExists(
        updatedData.username
      );
      if (existingUsername && existingUsername._id.toString() !== userId) {
        return reply.code(400).send({ error: "Username already in use" });
      }

      user.username = updatedData.username;
      updateMessage += "Username updated successfully. ";
    }

    if (updatedData.password) {
      const isSamePassword = await user.comparePassword(updatedData.password);
      // Skip updating if the new password is the same as the current one
      if (!isSamePassword) {
        user.password = updatedData.password;
        updateMessage += "Password updated successfully. ";
      }
    }

    // Save user if there are any changes
    if (updateMessage !== "") {
      await user.save();
    } else {
      return reply.code(200).send({ message: "No changes made." });
    }

    return reply.code(200).send({ message: updateMessage.trim() });
  } catch (error) {
    return reply.code(500).send({ error: "Failed to update user" });
  }
}

async function deleteUser(request, reply) {
  try {
    const userId = request.params.id; // Get user ID from request parameters

    const deletedUser = await User.findByIdAndDelete(userId); // Find and delete the user

    if (!deletedUser) {
      return reply.code(404).send({ error: "User not found" }); // Send 404 if user not found
    }

    reply.code(200).send({ message: "User deleted successfully" });
  } catch (error) {
    reply.code(500).send({ error: "Failed to delete user" });
  }
}

const UserController = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  login,
  logout,
};

export default UserController;
