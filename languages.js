const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// MongoDB connection URI
const mongoURI = "mongodb://localhost:27017/mplanguages";

// Define the schema for the Language model
const languageSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  kind: { type: String, required: true },
  country_code: { type: String, required: true },
});

const Language = mongoose.model("Language", languageSchema);

// Function to check if data exists and insert if it doesn't
async function insertDataIfNotExists(data) {
  for (const language of data) {
    try {
      const existingLanguage = await Language.findOne({ name: language.name });

      if (existingLanguage) {
        console.log(
          `Language "${language.name}" already exists in the database.`
        );
      } else {
        const newLanguage = new Language(language);
        await newLanguage.save();
        console.log(
          `Language "${language.name}" has been added to the database.`
        );
      }
    } catch (err) {
      console.error("Error inserting data:", err);
    }
  }
}

// Main function to run the script
async function main() {
  // Get the JSON file path from the command line argument
  const filePath = process.argv[2];
  if (!filePath) {
    console.error(
      "Please provide a JSON file path as a command line argument."
    );
    process.exit(1);
  }

  // Read the JSON file
  const absolutePath = path.resolve(filePath);
  let jsonData;
  try {
    const fileContent = fs.readFileSync(absolutePath, "utf-8");
    jsonData = JSON.parse(fileContent);
  } catch (err) {
    console.error("Error reading or parsing JSON file:", err);
    process.exit(1);
  }

  // Connect to MongoDB
  try {
    await mongoose.connect(mongoURI, {
      //  useNewUrlParser: true,
      //  useUnifiedTopology: true,
      // useCreateIndex: true,
    });
    console.log("Connected to MongoDB.");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }

  // Insert data if it doesn't already exist
  await insertDataIfNotExists(jsonData);

  // Disconnect from MongoDB
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (err) {
    console.error("Error disconnecting from MongoDB:", err);
  }
}

// Execute the main function
main();
