import { logError } from "./logError";

export const getMetadata = async (problemSlug : string) => {
  console.log("Fetching metadata for: " + problemSlug);
  try{
    const payload = {
        query:`
            query questionDetail($problemSlug: String!) {
                question(titleSlug: $problemSlug) {
                    title
                    content
                    topicTags {
                        slug
                    }
                }
                ugcArticleSolutionTags(questionSlug: $problemSlug) {
                    knowledgeTags {
                        slug
                        count
                    }
                }
            }
        `,
        variables: `
            {
                "problemSlug": "${problemSlug}"
            }
        `
    };
    const response = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
        "Content-type": "application/json; charset=UTF-8",
        },
    });

    const data = await response.json()

    const mostCommonSolutionTag = data["data"]["ugcArticleSolutionTags"]["knowledgeTags"][0]["slug"] as string

    const questionTitle = data["data"]["question"]["title"] as string

    const questionMarkdown = data["data"]["question"]["content"] as string

    console.log("Metadata extracted successfully for " , questionTitle)

    return {
        "message" : "get-metadata-success",
        "data" : [questionTitle , questionMarkdown , mostCommonSolutionTag],
        "success" : true
    }
  }
  catch(err){
    logError("Error while fetching metadata" , err)
    return {
        "message" : "get-metadata-server-error",
        "data" : null,
        "success" : false
    }
  }
};
