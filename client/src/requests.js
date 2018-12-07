const endpointURL = "http://localhost:9000/graphql";

export async function loadCompany(id) {
  const data = await graphqlRequest({
    query: `
    query CompanyQuery($id: ID!) {
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
    query: `
      query JobQuery($id: ID!) {
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
  const response = await fetch(endpointURL, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query,
      variables
    })
  });

  const responseBody = await response.json();

  if (responseBody.errors) {
    const message = responseBody.errors.map(error => error.message).join("\n");
    throw new Error(`GraphQL error: ${message}`);
  }

  return responseBody.data;
}
