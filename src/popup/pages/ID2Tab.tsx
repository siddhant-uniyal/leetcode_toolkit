import { useEffect, useRef, useState } from "react";

const API_URL = "https://leetcode.com/graphql";
const PROBLEM_URL = "https://leetcode.com/problems/";

const createQuery = (problemId: string) => ({
  query: `query getProblem($categorySlug: String, $skip: Int, $filters: QuestionListFilterInput){
                    problemsetQuestionList: questionList(categorySlug: $categorySlug skip: $skip filters: $filters){
                        total: totalNum 
                        questions: data
                                {
                                    questionFrontendId
                                    titleSlug 
                                }
                    }
                }`,
  variables: `{"categorySlug":"all-code-essentials","skip":0,"filters":{"searchKeywords":"${problemId}"}}`,
});

const ID2Tab = () => {
  const [problemID, setProblemID] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {

    const input = inputRef.current
    const button = buttonRef.current

    const handleEnter = (e : KeyboardEvent) => {
      if(e.key === "Enter"){
        button?.click()
      }
    }

    input?.addEventListener("keydown" , handleEnter)

    return () => {
      input?.removeEventListener("keydown" , handleEnter)
    }

  } , [])

  const getProblem = async () => {
    try {
      setErrorMessage("");
      if (!/[1-9][0-9]*$|^$/g.test(problemID)) {
        setErrorMessage("Problem ID must be a whole number");
        return;
      }
      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(createQuery(problemID)),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });

      if (!response.ok) {
        setErrorMessage(`Error while fetching : ${response.status}`);
        return;
      }

      const data = await response.json().catch((err) => {
        setErrorMessage(`Failed to parse into JSON : ${err.message}`);
        return;
      });

      const questionList: Record<string, string>[] =
        data["data"]["problemsetQuestionList"]["questions"];

      if (!questionList || questionList.length == 0) {
        setErrorMessage("Problem ID doesn't exist");
        return;
      }

      const problem = questionList.find(
        (question) => question["questionFrontendId"] === problemID
      );

      if (!problem) {
        setErrorMessage("Problem ID doesn't exist");
        return;
      }

      const problemSlug = problem["titleSlug"];

      console.log(PROBLEM_URL + problemSlug);
      browser.tabs.create({
        url: PROBLEM_URL + problemSlug,
      });
      window.close();
    } catch (e) {
      setErrorMessage("Error in fetching");
    }
  };
  return (
    <div
      id="id2tab"
      className="h-full flex flex-col justify-center items-center"
    >
      <div id="id-input-div" className="flex flex-row gap-x-2">
        <input
          ref={inputRef}
          type="text"
          value={problemID}
          onChange={(e) => setProblemID(e.target.value)}
          className="h-[2rem] bg-[rgb(93,90,90)] border-none rounded-sm outline-none transition-opacity duration-200 pl-[0.3rem] text-white"
          placeholder="Enter problem ID..."
          autoFocus
        ></input>
        <button
          ref={buttonRef}
          onClick={getProblem}
          className="bg-white w-[3rem] text-black p-1 border-none rounded-sm transition-opacity duration-200 hover:opacity-70 hover:cursor-pointer"
        >
          GO
        </button>
      </div>
      <div id="error-content-div" className="text-red-600">
        {errorMessage}
      </div>
    </div>
  );
};

export default ID2Tab;
