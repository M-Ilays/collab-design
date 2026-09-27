// seeder.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./user.model");

const mongoURI = "mongodb://127.0.0.1:27017/collabDesign"; 

const pakistaniNames = [
	"Ahmed Khan", "Fatima Noor", "Usman Ali", "Ayesha Tariq", "Zain Raza",
	"Mehwish Iqbal", "Hassan Javed", "Iqra Shafi", "Bilal Zubair", "Hina Waqar",
	"Salman Saeed", "Mariam Gul", "Raza Qureshi", "Nimra Yousuf", "Taha Baig"
];

function generateEmail(name, index) {
	const cleanName = name.toLowerCase().replace(/ /g, ".");
	return `${cleanName}${index}@pakmail.com`;
}

async function seedUsers() {
	try {
		await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
		console.log("Connected to MongoDB");

		const hashedPassword = await bcrypt.hash("admin", 10);

		const users = pakistaniNames.map((name, index) => {
			return new User({
				_id: new mongoose.Types.ObjectId(),
				name: name,
				email: generateEmail(name, index + 1),
				password: hashedPassword,
				profilePicture: "default.jpg",
				isVerified: true
			});
		});

		await User.insertMany(users);
		console.log("Pakistani users seeded successfully!");
	} catch (err) {
		console.error("Seeding error:", err);
	} finally {
		await mongoose.disconnect();
	}
}

seedUsers();
