const db = require("./db");

const Query = {
  company: (parent, args) => db.companies.get(args.id),
  job: (parent, args) => db.jobs.get(args.id),
  jobs: () => db.jobs.list()
};

// Field Resolvers
const Company = {
  jobs: parent => db.jobs.list().filter(job => job.companyId === parent.id)
};

const Job = {
  company: parent => db.companies.get(parent.companyId)
};

module.exports = {
  Query,
  Company,
  Job
};
