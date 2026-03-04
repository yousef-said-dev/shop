import { Client, Databases, Account, ID } from "https://cdn.jsdelivr.net/npm/appwrite@16.0.2/+esm";

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1') // Appwrite Cloud endpoint
    .setProject('6949db310036bc13312c'); // Your Project ID

const databases = new Databases(client);
const account = new Account(client);

// Your Database ID and Collection ID
const DATABASE_ID = '6949f8e50005e0adc026';
const COLLECTION_ID = 'bookings';

export { client, databases, account, ID, DATABASE_ID, COLLECTION_ID };
