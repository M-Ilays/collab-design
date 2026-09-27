const mongoose = require("mongoose");
const Project = require("./project.model"); // Update this path
const User = require("../user/user.model");       // Update this path

const mongoURI = "mongodb://127.0.0.1:27017/collabDesign"; // Replace as needed

const projectTitles = [
	"Rural School Mapping System",
	"E-Governance for Union Councils",
	"Flood Relief Coordination Portal",
	"Online Ration Distribution App",
	"Punjab Medical Access Tracker",
	"KPK Tourism Digital Guide",
	"Smart Balochistan Agriculture Monitor",
	"Urdu Text Recognition AI",
	"Karachi Traffic Heatmap",
	"National Urdu e-Library"
];

function getRandomElements(arr, count) {
	const shuffled = [...arr].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

async function seedProjects() {
	try {
		await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
		console.log("Connected to MongoDB");

		const users = await User.find({});
		if (users.length < 6) throw new Error("Not enough users to seed projects.");

		const projects = [];

		for (let title of projectTitles) {
			const owner = users[Math.floor(Math.random() * users.length)];
			const memberCount = Math.floor(Math.random() * 4) + 3; // 3 to 6 members
			const members = getRandomElements(users.filter(u => u._id.toString() !== owner._id.toString()), memberCount);

			projects.push(
				new Project({
					name: title,
					description: `A public service project titled "${title}" aimed at Pakistani societal development.`,
					owner: owner._id,
					members: members.map(m => m._id),
					projectImage: "",
					status: "Active",
					requirements: [],
					diagrams: [],
					discussions: []
				})
			);
		}

		await Project.insertMany(projects);
		console.log("Projects seeded successfully!");
	} catch (err) {
		console.error("Seeding error:", err);
	} finally {
		await mongoose.disconnect();
	}
}

seedProjects();
