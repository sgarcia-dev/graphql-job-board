import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from 'apollo-boost';
import gql from 'graphql-tag';
import { isLoggedIn, getAccessToken } from './auth';

const endpointURL = "http://localhost:9000/graphql";

const authLink = new ApolloLink(
  (operation, forward) => {
    if (isLoggedIn()) {
      operation.setContext({
        headers: {
          authorization: `Bearer ${getAccessToken()}`
        }
      });
    }
    return forward(operation);
  }
);

const client = new ApolloClient({
  link: ApolloLink.from([
    authLink,
    new HttpLink({
      uri: endpointURL
    })
  ]),
  cache: new InMemoryCache()
});

const JobDetailsFragment = gql`
  fragment JobDetails on Job {
    id
    title
    description
    company {
      id
      name
    }
  }
`;

const createJobMutation = gql`
  mutation CreateJob($input: CreateJobInput) {
    job: createJob(input: $input) {
      ...JobDetails
    }
  }
  ${JobDetailsFragment}`;

const loadJobQuery = gql`
  query JobQuery($id: ID!) {
    job(id: $id) {
      ...JobDetails
    }
  }
  ${JobDetailsFragment}`;

const loadJobsQuery = gql`
  {
    jobs {
      ...JobDetails
    }
  }
  ${JobDetailsFragment}`;

const loadCompanyQuery = gql`
  query CompanyQuery($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        ...JobDetails
      }
    }
  }
  ${JobDetailsFragment}`;

export async function createJob(input) {
  const variables = { input };
  
  const { data } = await client.mutate({
    mutation: createJobMutation,
    variables,
    update: (cacheStore, mutationResult) => {
      const {data} = mutationResult;
      cacheStore.writeQuery({
        query: loadJobQuery,
        variables: { id: data.job.id },
        data
      })
    }
  });
  return data.job;
}

export async function loadCompany(id) {
  const variables = { id };
  
  const {data} = await client.query({query: loadCompanyQuery, variables});
  return data.company;
}

export async function loadJob(id) {
  const variables = { id };

  const {data} = await client.query({query: loadJobQuery, variables});
  return data.job;
}

export async function loadJobs() {
  const {data} = await client.query({
    query: loadJobsQuery,
    fetchPolicy: 'no-cache'
  });
  return data.jobs;
}

// Apollo-less GraphQL Request
/* async function graphqlRequest({ query, variables = {} }) {
  const request = {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query,
      variables
    })
  };

  if (isLoggedIn()) {
    request.headers['authorization'] = `Bearer ${getAccessToken()}`
  }

  const response = await fetch(endpointURL, request);

  const responseBody = await response.json();

  if (responseBody.errors) {
    const message = responseBody.errors.map(error => error.message).join("\n");
    throw new Error(`GraphQL error: ${message}`);
  }

  return responseBody.data;
} */