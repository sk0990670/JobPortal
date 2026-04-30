const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Company = require('./models/Company');
const Job = require('./models/Job');

const fixCompanies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const companies = await Company.find();
    for (const company of companies) {
      // Find all active jobs for this company
      const activeJobs = await Job.find({ company: company._id, status: 'active' });
      
      // Update openings count to precisely match active jobs
      let updates = { openings: activeJobs.length };

      // Update location based on jobs if headquarters city is empty
      if (!company.headquarters?.city && activeJobs.length > 0) {
        // Find a job with a city
        const jobWithLocation = activeJobs.find(j => j.location && j.location.city);
        if (jobWithLocation) {
          updates['headquarters.city'] = jobWithLocation.location.city;
          if (jobWithLocation.location.state) updates['headquarters.state'] = jobWithLocation.location.state;
          if (jobWithLocation.location.country) updates['headquarters.country'] = jobWithLocation.location.country;
        }
      }

      await Company.findByIdAndUpdate(company._id, updates);
      console.log(`Updated ${company.name} -> ${updates.openings} active jobs, location: ${updates['headquarters.city'] || 'None'}`);
    }

    console.log('Fix complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixCompanies();
