import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient } from "../config/dynamodb.js";
// const uuidv4 = await import("uuid");

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

class UserService {
  // Create a new User
  async createUser(userData) {
    const item = {
      employee_id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });
    await docClient.send(command);
    return item;
  }

  async getUserById(userId) {
    // Implementation for retrieving a user by ID
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { employee_id: userId },
    });

    const response = await docClient.send(command);
    return response.Item;
  }

  //Get all users
  async getAllUsers() {
    // Implementation for retrieving all users
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });
    const response = await docClient.send(command);
    return response.Items;
  }

  // update user by id
  async updateUser(userId, updateData) {
    // Implementation for updating a user by ID
    const existingUser = await this.getUserById(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }
    const updatedUser = { ...existingUser, ...updateData };
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: updatedUser,
    });
    await docClient.send(command);
    return updatedUser;
  }

  // delete user by id
  async deleteUser(userId) {
    // Implementation for deleting a user by ID
    const existingUser = await this.getUserById(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id: userId },
    });
    await docClient.send(command);
    return true;
  }
}

export default new UserService();
