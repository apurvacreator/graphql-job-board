import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  concat,
  createHttpLink,
  gql,
} from "@apollo/client";
import { getAccessToken } from "../auth";

// const client = new GraphQLclient(
//   "http://localhost:9000/graphql",
//   {
//     headers: () => {
//       const accessToken = getAccessToken();
//       if (accessToken) {
//         return { Authorization: `Bearer ${accessToken}` };
//       }
//       return {};
//     },
//   }
// );

const httpLink = createHttpLink({
  uri: "http://localhost:9000/graphql",
});

const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
  // Set fetch polcy at Apollo client
  // defaultOptions: {
  //   query: {
  //     fetchPolicy: 'network-only'
  //   },
  //   watchQuery: {
  //     fetchPolicy: 'network-only'
  //   }
  // }
});

const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    date
    title
    description
    company {
      id
      name
    }
  }
`;

export const jobByIdQuery = gql`
  query JobById($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

export const companyByIDQuery = gql`
  query CompanyById($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        id
        title
        date
      }
    }
  }
`;

export const jobsQuery = gql`
  query Jobs {
    jobs {
      id
      date
      title
      company {
        id
        name
      }
    }
  }
`;

export const createJobMutation = gql`
  mutation CreateJob($input: CreateJobInput!) {
    job: createJob(input: $input) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

export async function createJob({ title, description }) {
  // const { job } = await client.request(createJobMutation, {
  //   input: {
  //     title,
  //     description,
  //   },
  // });
  const { data } = await apolloClient.mutate({
    mutation: createJobMutation,
    variables: {
      input: {
        title,
        description,
      },
    },
    update: (cache, { data }) => {
      cache.writeQuery({
        query: jobByIdQuery,
        variables: { id: data.job.id },
        data,
      });
    },
  });
  return data.job;
}

// unused after moving to useQuery in HomePage
export async function getJobs() {
  //const { jobs } = await client.request(jobsQuery);
  const { data } = await apolloClient.query({
    query: jobsQuery,
    fetchPolicy: "network-only",
  });
  return data.jobs;
}

// unused after moving to useQuery in JobPage
export async function getJob(id) {
  //const { job } = await client.request(query, { id });
  const { data } = await apolloClient.query({
    query: jobByIdQuery,
    variables: { id },
  });
  return data.job;
}

// unused after moving to useQuery in CompanyPage
export async function getCompany(id) {
  //const { company } = await client.request(companyByIDQuery, { id });
  const { data } = await apolloClient.query({
    query: companyByIDQuery,
    variables: { id },
  });
  return data.company;
}
