import * as mongodb from "mongodb";

export interface User {
  firstname: string;
  secondname: string;
  username: string;
  email: string;
  password: string;
  _id?: mongodb.ObjectId;
}