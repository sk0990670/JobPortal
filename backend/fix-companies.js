const mongoose = require('mongoose');
const Company = require('./models/Company');
const Job = require('./models/Job');
require('dotenv').config();

async function fixMerge() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const mainCompany = await Company.findOne({ name: 'Optum' });
    const duplicateCompany = await Company.findOne({ name: 'Optum- Software Engineer' });

    if (mainCompany && duplicateCompany) {
      await Job.updateMany({ company: duplicateCompany._id }, { company: mainCompany._id, companyName: mainCompany.name });
      await duplicateCompany.deleteOne();
      console.log('Merged duplicate into Optum');
    }
    
    // Recalculate openings
    const companies = await Company.find({});
    for (const company of companies) {
      const jobCount = await Job.countDocuments({ company: company._id });
      if (jobCount === 0) {
        await company.deleteOne();
      } else {
        company.openings = jobCount;
        await company.save();
      }
    }
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixMerge();
