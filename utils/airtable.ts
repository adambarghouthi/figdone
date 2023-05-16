import axios from "axios";

// check api key contains user, requires user id

// fetch statuses by api key

// apply api key, requires user id
export default function airtable(base: string) {
  const url = `https://api.airtable.com/v0/appLocckJ4oXpdt11/${base}`;

  return {
    select: async (formula: string = "") =>
      await axios.get(
        `${url}?view=Grid%20view&filterByFormula=${
          formula ? encodeURIComponent(formula) : ""
        }`,
        {
          headers: {
            Authorization:
              "Bearer pat17fQZ0hv2YWqtu.097ddc97fab2bfa4babf00fa5f4e41137dfa5b0fe221893d5a3a646d5b6076cf",
          },
        }
      ),
    updateById: async (id: string, data: any) =>
      await axios.put(
        url,
        {
          records: [{ id: id, fields: { ...data } }],
        },
        {
          headers: {
            Authorization:
              "Bearer pat17fQZ0hv2YWqtu.097ddc97fab2bfa4babf00fa5f4e41137dfa5b0fe221893d5a3a646d5b6076cf",
          },
        }
      ),
    create: async (data: any) =>
      await axios
        .post(
          url,
          {
            records: [{ fields: { ...data } }],
          },
          {
            headers: {
              Authorization:
                "Bearer pat17fQZ0hv2YWqtu.097ddc97fab2bfa4babf00fa5f4e41137dfa5b0fe221893d5a3a646d5b6076cf",
            },
          }
        )
        .catch(function (error) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
          }
          console.log(error.config);
        }),
    deleteById: async (id: string) =>
      await axios.delete(`${url}/${id}`, {
        headers: {
          Authorization: "Bearer keyrSZiPjA2Mt9u0B",
        },
      }),
  };
}
