import { GraphQLError } from "graphql";
import {
  createJob,
  deleteJob,
  getJob,
  getJobs,
  getJobsByCompany,
  updateJob,
} from "./db/jobs.js";
import { getCompany } from "./db/companies.js";

export const resolvers = {
  Query: {
    company: async (_root, { id }) => {
      const company = await getCompany(id);
      if (!company) {
        throw notFoundError(
          `Company not found with id. ${id}`
        );
      }
      return company;
    },
    job: async (_root, { id }) => {
      const job = await getJob(id);
      if (!job) {
        throw notFoundError(`Job not found with id. ${id}`);
      }
      return job;
    },
    jobs: () => getJobs(),
  },

  Mutation: {
    createJob: (
      _root,
      { input: { title, description } },
      { user }
    ) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }
      return createJob({
        companyId: user.companyId,
        title,
        description,
      });
    },
    updateJob: async (_root, { input }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }
      const job = await updateJob({
        ...input,
        companyId: user.companyId,
      });
      if (!job) {
        throw notFoundError(`Job not found with id. ${id}`);
      }
      return job;
    },

    deleteJob: async (_root, { id }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }
      const job = await deleteJob(id, user.companyId);
      if (!job) {
        throw notFoundError(`Job not found with id. ${id}`);
      }
      return job;
    },
  },

  Company: {
    jobs: (company) => getJobsByCompany(company.id),
  },

  Job: {
    company: (job, _args, { companyLoader }) =>
      companyLoader.load(job.companyId),
    //getCompany(job.companyId),
    date: (job) => toIsoDate(job.createdAt),
  },
};

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: { code: "NOT_FOUND" },
  });
}

function unauthorizedError(message) {
  return new GraphQLError(message, {
    extensions: { code: "UNAUTHORIZED" },
  });
}

function toIsoDate(value) {
  return value.slice(0, "yyyy-mm-dd".length);
}
