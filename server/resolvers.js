const db = require("./db");

const Query = {
  company: (parent, args) => db.companies.get(args.id),
  job: (parent, args) => db.jobs.get(args.id),
  jobs: () => db.jobs.list()
};

const Mutation = {
  createJob: (root, args, context) => {
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    const { input } = args;
    const id = db.jobs.create({
      companyId: context.user.companyId,
      ...input
    });
    return db.jobs.get(id);
  }
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
  Mutation,
  Company,
  Job
};
