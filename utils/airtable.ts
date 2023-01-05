import axios from "axios";

// check api key contains user, requires user id

// fetch statuses by api key

// apply api key, requires user id
export default function airtable(base: string) {
  const url = `https://api.airtable.com/v0/appLocckJ4oXpdt11/${base}`;

  return {
    select: async (formula: string = "") =>
      await axios.get(
        `${url}?maxRecords=1&view=Grid%20view&filterByFormula=${
          formula ? encodeURIComponent(formula) : ""
        }`,
        {
          headers: {
            Authorization: "Bearer keyrSZiPjA2Mt9u0B",
          },
        }
      ),
  };
}
