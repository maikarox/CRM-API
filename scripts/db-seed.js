const MongoClient = require('mongodb').MongoClient;
const Types = require('mongoose').Types;
const dotenv = require('dotenv');

dotenv.config();

async function seedDB() {
  const { MONGODB_URI, MONGODB_DATABASE } = process.env;

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();

    console.log('Connected correctly to server');
    
    const db = client.db(MONGODB_DATABASE);
    const rolesCollection = db.collection('roles');
    
    await rolesCollection.deleteMany({});
    await rolesCollection.insertMany([
      {
        _id: new Types.ObjectId('616191c1fc13ae60130001e5'),
        name: 'User',
        permissions: [
          'read:all_customers',
          'create:all_customers',
          'update:all_customers',
          'delete:all_customers',
        ],
      },
      {
        _id: new Types.ObjectId('616191f5fc13ae60130001e8'),
        name: 'Admin',
        permissions: [
          'read:all_users',
          'create:all_users',
          'update:all_users',
          'delete:all_users',
          'update:all_roles'
        ],
      },
    ]);
    
    const usersCollection = db.collection('users');
    await usersCollection.deleteMany({});
    await usersCollection.insertMany([
      {
        _id: new Types.ObjectId('61616e99fc13ae4d5f00012c'),
        name: 'Chanda',
        surname: 'Langstone',
        email: 'user1@example.com',
        password:
          'ee250b9faa440d344ddebcb27abe9eaac87f8aca7b0584d95bc2cc3d94c9e250',
        roles: [new Types.ObjectId('616191c1fc13ae60130001e5')],
      },
      {
        _id: new Types.ObjectId('61616e99fc13ae4d5f00012f'),
        name: 'Margaretta',
        surname: 'Gerritsma',
        email: 'admin@example.com',
        password:
          'ee250b9faa440d344ddebcb27abe9eaac87f8aca7b0584d95bc2cc3d94c9e250',
        roles: [
          new Types.ObjectId('616191f5fc13ae60130001e8'),
          new Types.ObjectId('616191c1fc13ae60130001e5'),
        ],
      },
      {
        _id: new Types.ObjectId('61616e99fc13ae4d5f00012e'),
        name: 'Daniella',
        surname: 'Smith',
        email: 'user2@example.com',
        password:
          'ee250b9faa440d344ddebcb27abe9eaac87f8aca7b0584d95bc2cc3d94c9e250',
        roles: [new Types.ObjectId('616191c1fc13ae60130001e5')],
      },
    ]);
    
    const customersCollection = db.collection('customers');
    await customersCollection.deleteMany({});
    await customersCollection.insertMany([
      {
        _id: new Types.ObjectId("61618fa7fc13ae40f1000028"),
        name: "Dulcine",
        surname: "London",
        profileImage: "dlondon0@shutterfly.com",
        createdAt: "2021-01-03T08:33:25.000Z",
        updatedAt: "2021-08-13T02:35:22.000Z",
        updatedBy: new Types.ObjectId("61616e99fc13ae4d5f00012f"),
        createdBy: new Types.ObjectId("61616e99fc13ae4d5f00012f"),
        deletedAt: null
      },
      {
        _id: new Types.ObjectId("61618fa7fc13ae40f100002b"),
        name: "Nana",
        surname: "Brill",
        profileImage: "nbrill1@moonfruit.com",
        createdAt: "2021-08-28T14:33:29.000Z",
        updatedAt: "2021-01-14T08:43:40.000Z",
        updatedBy: new Types.ObjectId("61616e99fc13ae4d5f00012f"),
        createdBy: new Types.ObjectId("61616e99fc13ae4d5f00012f"),
        deletedAt: null
      }, 
      {
        _id: new Types.ObjectId("61618fa7fc13ae40f100002e"),
        name: "Marcelline",
        surname: "Rockingham",
        profileImage: "mrockingham2@ox.ac.uk",
        createdAt: "2020-09-28T15:36:37.000Z",
        updatedAt: "2021-08-09T05:42:06.000Z",
        updatedBy: new Types.ObjectId("61616e99fc13ae4d5f00012f"),
        createdBy: new Types.ObjectId("61616e99fc13ae4d5f00012f"),
        deletedAt: null
      }, 
      {
        _id: new Types.ObjectId("61618fa7fc13ae40f1000031"),
        name: "Debra",
        surname: "Drewry",
        profileImage: "ddrewry3@jugem.jp",
        createdAt: "2021-01-25T10:32:30.000Z",
        updatedAt: "2021-06-24T13:31:35.000Z",
        updatedBy: new Types.ObjectId("61616e99fc13ae4d5f00012f"),
        createdBy: new Types.ObjectId("61616e99fc13ae4d5f00012f"),
        deletedAt: null
      },
      {
        _id: new Types.ObjectId("61618fa7fc13ae40f1000034"),
        name: "Christoper",
        surname: "Shallcrass",
        profileImage: "cshallcrass4@shutterfly.com",
        createdAt: "2020-12-12T01:53:40.000Z",
        updatedAt: "2021-07-31T06:09:44.000Z",
        updatedBy: new Types.ObjectId("61616e99fc13ae4d5f00012f"),
        createdBy: new Types.ObjectId("61616e99fc13ae4d5f00012f"),
        deletedAt: null
      }, 
      {
        _id: new Types.ObjectId("61618fa7fc13ae40f1000040"),
        name: "Vinni",
        surname: "Mendoza",
        profileImage: "vmendoza8@unicef.org",
        createdAt: "2020-11-08T04:02:09.000Z",
        updatedAt: null,
        updatedBy: null,
        createdBy: new Types.ObjectId("61616e99fc13ae4d5f00012c"),
        deletedAt: null
      }, 
      {
        _id: new Types.ObjectId("61618fa7fc13ae40f1000043"),
        name: "Gianni",
        surname: "Backler",
        profileImage: "gbackler9@dailymotion.com",
        createdAt: "2021-04-27T19:09:01.000Z",
        updatedAt: "2021-01-28T07:15:49.000Z",
        updatedBy: new Types.ObjectId("61616e99fc13ae4d5f00012c"),
        createdBy: new Types.ObjectId("61616e99fc13ae4d5f00012c"),
        deletedAt: null
      },
    ]);

    client.close();
  } catch (err) {
    console.log(err.stack);
  }
}

seedDB();
