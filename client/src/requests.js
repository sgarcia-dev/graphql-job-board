import { isLoggedIn, getAccessToken } from './auth';

const endpointURL = "http://localhost:9000/graphql";

export async function createJob(input) {
  const { job } = await graphqlRequest({
    query: `mutation CreateJob($input: CreateJobInput) {
      job: createJob(input: $input) {
        id
        title
        description
        company {
          id
          name
        }
      }
    }`,
    variables: { input }
  });
  return job;
}

export async function loadCompany(id) {
  const data = await graphqlRequest({
    query: `query CompanyQuery($id: ID!) {
      company(id: $id) {
        id
        name
        description
        jobs {
          id
          title
          description
          company {
            id
            name
          }
        }
      }
    }`,
    variables: { id }
  });
  return data.company;
}

export async function loadJob(id) {
  const data = await graphqlRequest({
    query: `query JobQuery($id: ID!) {
      job(id: $id) {
        id
        title
        description
        company {
          id
          name
        }
      }
    }`,
    variables: { id }
  });
  return data.job;
}

export async function loadJobs() {
  const data = await graphqlRequest({
    query: `{
      jobs {
        id
        title
        company {
          id
          name
        }
      }
    }`
  });

  return data.jobs;
}

async function graphqlRequest({ query, variables = {} }) {
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
}
