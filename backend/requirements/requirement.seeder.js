const mongoose = require('mongoose');
const Requirement = require('./requirement.model'); // Adjust path if necessary
const Project = require('../project/project.model'); // Assuming you have a Project model

// Define your MongoDB connection string
const dbURI = ''; // Replace with your MongoDB URI

const requirementsData = [
    {
        reqId: 'REQ001',
        title: 'User Login',
        actor: ['User'],
        assignee: ['JohnDoe'],
        stakeholders: ['ProductOwner', 'DevTeam'],
        dependencies: [],
        targetRelease: 'v1.0',
        category: 'functional',
        priority: 'high',
        status: 'not_started',
        description: 'As a user, I want to log in to the system with my credentials.',
        acceptanceCriteria: 'User should be able to log in with valid credentials.'
    },
    {
        reqId: 'REQ002',
        title: 'Data Backup',
        actor: ['Admin'],
        assignee: ['JaneSmith'],
        stakeholders: ['DevTeam', 'OpsTeam'],
        dependencies: ['REQ001'],
        targetRelease: 'v1.0',
        category: 'non_functional',
        priority: 'medium',
        status: 'in_progress',
        description: 'As an admin, I want to schedule backups of the system data.',
        acceptanceCriteria: 'Data should be backed up every 24 hours automatically.'
    },
    {
        reqId: 'REQ003',
        title: 'Performance Optimization',
        actor: ['User', 'Admin'],
        assignee: ['DevTeam'],
        stakeholders: ['OpsTeam'],
        dependencies: ['REQ002'],
        targetRelease: 'v1.1',
        category: 'non_functional',
        priority: 'high',
        status: 'not_started',
        description: 'Optimize the system performance for faster load times.',
        acceptanceCriteria: 'Page load time should be less than 2 seconds.'
    },
    {
        reqId: 'REQ004',
        title: 'Password Recovery',
        actor: ['User'],
        assignee: ['JohnDoe'],
        stakeholders: ['DevTeam'],
        dependencies: ['REQ001'],
        targetRelease: 'v1.0',
        category: 'functional',
        priority: 'medium',
        status: 'not_started',
        description: 'Allow users to reset their passwords through email.',
        acceptanceCriteria: 'User receives a password reset email and can reset their password.'
    },
    {
        reqId: 'REQ005',
        title: 'User Profile Update',
        actor: ['User'],
        assignee: ['JaneSmith'],
        stakeholders: ['ProductOwner'],
        dependencies: ['REQ004'],
        targetRelease: 'v1.1',
        category: 'functional',
        priority: 'low',
        status: 'not_started',
        description: 'Allow users to update their personal profile information.',
        acceptanceCriteria: 'User can update their name, email, and password.'
    },
    {
        reqId: 'REQ006',
        title: 'Email Notification',
        actor: ['System'],
        assignee: ['JohnDoe'],
        stakeholders: ['DevTeam', 'OpsTeam'],
        dependencies: ['REQ005'],
        targetRelease: 'v1.0',
        category: 'functional',
        priority: 'high',
        status: 'in_progress',
        description: 'Send email notifications to users for important updates.',
        acceptanceCriteria: 'User receives an email upon login and profile changes.'
    },
    {
        reqId: 'REQ007',
        title: 'Search Functionality',
        actor: ['User'],
        assignee: ['JaneSmith'],
        stakeholders: ['ProductOwner'],
        dependencies: ['REQ001'],
        targetRelease: 'v1.2',
        category: 'functional',
        priority: 'high',
        status: 'not_started',
        description: 'Allow users to search for content within the platform.',
        acceptanceCriteria: 'User can search using keywords and see relevant results.'
    },
    {
        reqId: 'REQ008',
        title: 'Security Auditing',
        actor: ['Admin'],
        assignee: ['JohnDoe'],
        stakeholders: ['OpsTeam'],
        dependencies: ['REQ006'],
        targetRelease: 'v1.3',
        category: 'non_functional',
        priority: 'high',
        status: 'not_started',
        description: 'Implement logging and auditing of security-related events.',
        acceptanceCriteria: 'Audit logs should capture all login attempts and security events.'
    },
    {
        reqId: 'REQ009',
        title: 'Multi-Factor Authentication',
        actor: ['User'],
        assignee: ['DevTeam'],
        stakeholders: ['SecurityTeam'],
        dependencies: ['REQ004'],
        targetRelease: 'v1.1',
        category: 'functional',
        priority: 'high',
        status: 'not_started',
        description: 'Enable multi-factor authentication for user login.',
        acceptanceCriteria: 'User must provide a second authentication factor after login.'
    },
    {
        reqId: 'REQ010',
        title: 'Data Encryption',
        actor: ['Admin'],
        assignee: ['OpsTeam'],
        stakeholders: ['SecurityTeam'],
        dependencies: ['REQ008'],
        targetRelease: 'v1.3',
        category: 'non_functional',
        priority: 'medium',
        status: 'not_started',
        description: 'Encrypt sensitive user data both in transit and at rest.',
        acceptanceCriteria: 'All sensitive data should be encrypted using AES-256 encryption.'
    }
];

const projectData = {
    _id: "67630cc0556d358bea25d4b3",
    name: "Collab Design Test",
    description: "This is a test for collab design",
    status: "Active",
    owner: "67630c88556d358bea25d4a5", // Owner ID
    projectImage: "default_project.jpg",
    members: [], // Empty members array
    requirements: [], // Initially empty, will be populated with requirements data
    createdAt: new Date("2024-12-18T17:56:16.878+00:00"),
    updatedAt: new Date("2024-12-18T19:03:52.979+00:00"),
    __v: 2
};

mongoose.connect(dbURI)
    .then(() => {
        console.log('Database connected successfully!');

        // Insert the requirements
        return Requirement.insertMany(requirementsData);
    })
    .then((requirements) => {
        console.log('Requirements seeded successfully:', requirements);

        // Add requirements to the project
        projectData.requirements = requirements.map(req => req._id);

        // Insert or update the project document
        return Project.findOneAndUpdate(
            { _id: projectData._id },
            { $set: projectData },
            { new: true, upsert: true } // Insert if not found, else update
        );
    })
    .then((project) => {
        console.log('Project updated successfully:', project);
        mongoose.connection.close(); // Close the connection after seeding
    })
    .catch((err) => {
        console.error('Error during seeding:', err);
        mongoose.connection.close();
    });
