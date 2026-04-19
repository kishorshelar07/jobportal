require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const JobSeekerProfile = require('./models/JobSeekerProfile');
const Company = require('./models/Company');
const Job = require('./models/Job');
const Application = require('./models/Application');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB Connected for seeding');
};

const skills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go',
  'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP',
  'REST API', 'GraphQL', 'HTML', 'CSS', 'TailwindCSS', 'Git',
  'Machine Learning', 'Data Analysis', 'SQL', 'Product Management',
  'UI/UX Design', 'Figma', 'Angular', 'Vue.js', 'DevOps', 'Agile',
];

const jobTitles = [
  'Senior Frontend Developer', 'Full Stack Engineer', 'Backend Developer',
  'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UI/UX Designer',
  'Mobile Developer', 'Cloud Architect', 'Machine Learning Engineer',
  'QA Engineer', 'Security Engineer', 'Technical Lead', 'Staff Engineer',
  'Engineering Manager', 'Solutions Architect', 'Database Administrator',
  'Site Reliability Engineer', 'iOS Developer', 'Android Developer',
];

const locations = [
  'Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune',
  'Kolkata', 'Ahmedabad', 'Remote', 'Gurgaon',
];

const companies = [
  { name: 'TechNova Solutions', industry: 'Technology', size: '201-500' },
  { name: 'DataBridge Analytics', industry: 'Technology', size: '51-200' },
  { name: 'CloudFirst Systems', industry: 'Technology', size: '1000+' },
  { name: 'FinTech Innovations', industry: 'Finance', size: '201-500' },
  { name: 'HealthAI Labs', industry: 'Healthcare', size: '51-200' },
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomSkills = (n = 5) => [...new Set(skills.sort(() => 0.5 - Math.random()).slice(0, n))];

async function seed() {
  await connectDB();

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    JobSeekerProfile.deleteMany({}),
    Company.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
  ]);

  // ─── Admin ──────────────────────────────────────────
  console.log('👤 Creating admin...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@jobportal.com',
    password: 'Admin@1234',
    role: 'admin',
    isVerified: true,
    isActive: true,
  });

  // ─── Recruiters ─────────────────────────────────────
  console.log('👔 Creating recruiters...');
  const recruiters = [];
  for (let i = 0; i < 5; i++) {
    const recruiter = await User.create({
      name: `Recruiter ${i + 1}`,
      email: `recruiter${i + 1}@jobportal.com`,
      password: 'Recruiter@1234',
      role: 'recruiter',
      isVerified: true,
      isActive: true,
    });
    recruiters.push(recruiter);
  }

  // ─── Companies ───────────────────────────────────────
  console.log('🏢 Creating companies...');
  const createdCompanies = [];
  for (let i = 0; i < 5; i++) {
    const company = await Company.create({
      recruiterId: recruiters[i]._id,
      name: companies[i].name,
      industry: companies[i].industry,
      size: companies[i].size,
      location: getRandomElement(locations),
      website: `https://www.${companies[i].name.toLowerCase().replace(/\s+/g, '')}.com`,
      description: `${companies[i].name} is a leading ${companies[i].industry.toLowerCase()} company focused on delivering innovative solutions to enterprise clients worldwide.`,
      isVerified: i < 3, // First 3 verified
    });
    createdCompanies.push(company);
  }

  // ─── Job Seekers ─────────────────────────────────────
  console.log('🧑‍💼 Creating job seekers...');
  const seekers = [];
  const seekerNames = [
    'Arjun Sharma', 'Priya Patel', 'Rahul Kumar', 'Ananya Singh', 'Vikram Nair',
    'Deepika Iyer', 'Rohan Mehta', 'Sneha Gupta', 'Aditya Reddy', 'Kavita Joshi',
    'Sanjay Bose', 'Pooja Verma', 'Manish Agarwal', 'Ritu Bansal', 'Nikhil Rao',
    'Divya Pillai', 'Amit Tiwari', 'Sunita Chauhan', 'Kiran Malhotra', 'Suresh Pandey',
  ];

  for (let i = 0; i < 20; i++) {
    const seeker = await User.create({
      name: seekerNames[i],
      email: `seeker${i + 1}@jobportal.com`,
      password: 'Seeker@1234',
      role: 'jobseeker',
      isVerified: true,
      isActive: true,
    });

    const expYears = getRandomInt(0, 12);
    await JobSeekerProfile.create({
      userId: seeker._id,
      headline: `${getRandomElement(jobTitles)} | ${expYears}+ years`,
      summary: `Passionate software professional with ${expYears}+ years of experience building scalable solutions. Experienced in ${getRandomSkills(3).join(', ')}.`,
      experienceYears: expYears,
      currentSalary: expYears * 1.5 + getRandomInt(5, 15),
      expectedSalary: expYears * 2 + getRandomInt(8, 20),
      noticePeriod: getRandomElement(['Immediate', '1 month', '2 months', '3 months']),
      location: getRandomElement(locations),
      isOpenToWork: Math.random() > 0.3,
      skills: getRandomSkills(8).map((s) => ({
        name: s,
        proficiency: getRandomElement(['Beginner', 'Intermediate', 'Expert']),
      })),
      education: [{
        degree: getRandomElement(['B.Tech', 'MCA', 'BCA', 'M.Tech', 'BSc CS']),
        institution: getRandomElement(['IIT Bombay', 'NIT Bangalore', 'VIT Vellore', 'BITS Pilani', 'DTU Delhi']),
        fieldOfStudy: getRandomElement(['Computer Science', 'Information Technology', 'Electronics', 'Software Engineering']),
        startYear: 2010 + getRandomInt(0, 10),
        endYear: 2014 + getRandomInt(0, 8),
        grade: `${getRandomInt(60, 95)}%`,
      }],
      workExperience: expYears > 0 ? [{
        company: getRandomElement(['Infosys', 'TCS', 'Wipro', 'HCL', 'Cognizant', 'Accenture']),
        title: getRandomElement(jobTitles),
        location: getRandomElement(locations),
        startDate: new Date(2020, getRandomInt(0, 11), 1),
        isCurrent: true,
        description: 'Led development of key features for the company\'s flagship product. Collaborated with cross-functional teams to deliver high-quality software solutions.',
      }] : [],
    });

    seekers.push(seeker);
  }

  // ─── Jobs ────────────────────────────────────────────
  console.log('💼 Creating 50 jobs...');
  const createdJobs = [];
  for (let i = 0; i < 50; i++) {
    const recruiter = recruiters[i % 5];
    const company = createdCompanies[i % 5];
    const minSal = getRandomInt(6, 25);
    const maxSal = minSal + getRandomInt(5, 20);
    const expMin = getRandomInt(0, 5);

    const job = await Job.create({
      recruiterId: recruiter._id,
      companyId: company._id,
      title: jobTitles[i % jobTitles.length],
      description: `We are looking for a talented ${jobTitles[i % jobTitles.length]} to join our growing team at ${company.name}. You will be working on challenging problems and building scalable solutions.\n\nThis is an exciting opportunity to work with cutting-edge technologies in a collaborative environment.`,
      requirements: `• ${expMin}+ years of relevant experience\n• Strong proficiency in ${getRandomSkills(3).join(', ')}\n• Excellent problem-solving skills\n• Bachelor's degree in Computer Science or related field`,
      responsibilities: `• Design and develop high-quality software solutions\n• Collaborate with product and design teams\n• Participate in code reviews and technical discussions\n• Mentor junior developers\n• Drive technical excellence`,
      jobType: getRandomElement(['full-time', 'full-time', 'full-time', 'contract', 'part-time']),
      workMode: getRandomElement(['remote', 'hybrid', 'onsite', 'remote', 'hybrid']),
      location: getRandomElement(locations),
      minSalary: minSal,
      maxSalary: maxSal,
      salaryDisclosed: Math.random() > 0.2,
      experienceMin: expMin,
      experienceMax: expMin + getRandomInt(3, 8),
      skillsRequired: getRandomSkills(6),
      openings: getRandomInt(1, 5),
      status: 'active',
      deadline: new Date(Date.now() + getRandomInt(7, 60) * 24 * 60 * 60 * 1000),
      viewsCount: getRandomInt(50, 500),
    });
    createdJobs.push(job);
  }

  // ─── Applications ────────────────────────────────────
  console.log('📋 Creating applications...');
  const statuses = ['applied', 'screening', 'interview', 'offer', 'rejected', 'hired'];
  let appCount = 0;

  for (const seeker of seekers) {
    const numApps = getRandomInt(2, 8);
    const appliedJobs = [...createdJobs].sort(() => 0.5 - Math.random()).slice(0, numApps);

    for (const job of appliedJobs) {
      try {
        const status = getRandomElement(statuses);
        await Application.create({
          jobId: job._id,
          jobSeekerId: seeker._id,
          resumeUrl: '/uploads/resumes/sample/resume.pdf',
          coverLetter: `I am excited to apply for the ${job.title} position at your company. With my background in relevant technologies, I believe I would be a great fit for this role.`,
          status,
          viewedByRecruiter: Math.random() > 0.4,
          statusHistory: [
            { status: 'applied', changedBy: seeker._id, changedAt: new Date(Date.now() - getRandomInt(1, 30) * 24 * 60 * 60 * 1000) },
            ...(status !== 'applied' ? [{ status, changedAt: new Date(), note: 'Status updated by recruiter.' }] : []),
          ],
          appliedAt: new Date(Date.now() - getRandomInt(1, 30) * 24 * 60 * 60 * 1000),
        });
        appCount++;
        await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });
      } catch (e) {
        // Ignore duplicate key errors
      }
    }
  }

  console.log(`
✅ Seed completed successfully!

📊 Created:
   • 1 Admin
   • 5 Recruiters + Companies
   • 20 Job Seekers with profiles
   • 50 Active Jobs
   • ~${appCount} Applications

🔑 Demo Credentials:
   Admin     → admin@jobportal.com       / Admin@1234
   Recruiter → recruiter1@jobportal.com  / Recruiter@1234
   Job Seeker→ seeker1@jobportal.com     / Seeker@1234
  `);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
