import * as mongodb from "mongodb";
import { Task } from "./task";
import { User } from "./user";

export const collections: {
   tasks?: mongodb.Collection<Task>;
   users?: mongodb.Collection<User>;
} = {};
 
export async function connectToDatabase(uri: string) {
   const client = new mongodb.MongoClient(uri);
   await client.connect();
 
   const db = client.db("meanStack");
   await applySchemaValidation(db);
 
   const tasksCollection = db.collection<Task>("tasks");
   collections.tasks = tasksCollection;

   const usersCollection = db.collection<User>("users");
   collections.users = usersCollection;
}
 
// Update our existing collection with JSON schema validation so we know our documents will always match the shape of our Task model, even if added elsewhere.
// For more information about schema validation, see this blog series: https://www.mongodb.com/blog/post/json-schema-validation--locking-down-your-model-the-smart-way
async function applySchemaValidation(db: mongodb.Db) {
   const jsonSchema = {
       $jsonSchema: {
           bsonType: "object",
           required: ["titre", "description", "date"],
           additionalProperties: false,
           properties: {
               _id: {},
               name: {
                   bsonType: "string",
                   description: "'titre' is required and is a string",
               },
               position: {
                   bsonType: "string",
                   description: "'description' is required and is a string",
                   minLength: 5
               },
               level: {
                   bsonType: "Date",
                   description: "'date' is required and is a date",
               },
           },
       },
   };

   const userJsonSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstname", "secondname", "username", "email", "password"],
      additionalProperties: false,
      properties: {
        _id: {},
        firstname: {
          bsonType: "string",
          description: "'firstname' is required and is a string",
        },
        secondname: {
          bsonType: "string",
          description: "'secondname' is required and is a string",
        },
        username: {
          bsonType: "string",
          description: "'username' is required and is a string",
        },
        email: {
          bsonType: "string",
          description: "'email' is required and is a string",
          pattern: "^[\\w-]+(\\.[\\w-]+)*@[\\w-]+(\\.[\\w-]+)*(\\.[a-z]{2,})$",
        },
        password: {
          bsonType: "string",
          description: "'password' is required and is a string",
        },
      },
    },
  };

  await Promise.all([
    db.command({ collMod: "tasks", validator: jsonSchema }).catch(async (error: mongodb.MongoServerError) => {
      if (error.codeName === "NamespaceNotFound") {
        await db.createCollection("tasks", { validator: jsonSchema });
      }
    }),
    db.command({ collMod: "users", validator: userJsonSchema }).catch(async (error: mongodb.MongoServerError) => {
      if (error.codeName === "NamespaceNotFound") {
        await db.createCollection("users", { validator: userJsonSchema });
      }
    }),
  ]);
   // Try applying the modification to the collection, if the collection doesn't exist, create it
//   await db.command({
//        collMod: "tasks",
//        validator: jsonSchema
//    }).catch(async (error: mongodb.MongoServerError) => {
//        if (error.codeName === 'NamespaceNotFound') {
//            await db.createCollection("tasks", {validator: jsonSchema});
//        }
//    });

}