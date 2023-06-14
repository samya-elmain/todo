import * as mongodb from "mongodb";
import { ObjectId } from 'mongodb';
 
export interface Task {
   userId: ObjectId;
   titre: string;
   description: string;
   date: Date;
   completed: boolean;
   _id?: mongodb.ObjectId;
}