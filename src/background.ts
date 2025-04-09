import { mainPush } from "./utils/ghPush.ts";
import { getExtension } from "./utils/getExtension.ts";

const BETWEEN_SLASHES_PATTERN = /(?<=\/)([^\/]+)(?=\/)/g; 

const requests = new Map()

const decoder = new TextDecoder();

type RequestPayloadType = {
    "requestURL" : string,
    "typedCode" : string
}

type ResponseBodyType = {
    "lang" : string,
    "runtime_percentile" : number,
    "memory_percentile" : number,
    "question_id" : string
}

const extractRequestData = (requestDetails : browser.webRequest._OnBeforeRequestDetails) => {
    if(!requestDetails?.requestBody?.raw) return
    const rawData = requestDetails.requestBody.raw[0].bytes;
    const uint8array = decoder.decode(rawData);
    const obj = JSON.parse(uint8array);
    const payload : RequestPayloadType = {
        "requestURL" : requestDetails.url,
        "typedCode" : obj["typed_code"],
    }
    const filter = browser.webRequest.filterResponseData(requestDetails.requestId);

    const data : ArrayBuffer[] = []

    filter.ondata = event => {
        data.push(event.data)
        filter.write(event.data)
    }

    filter.onstop = () => {
        filter.disconnect()
        try{
            // console.log("DATA SIZE IS " , data.length)
            const decoded = decoder.decode(data[0]) //why in filter.onstop() ? filter.ondata is async. listens for each chunk. so , placing this code below
            //immediately runs it , so it has empty data. inside onstop , guaranteed to have the complete data. also , here there was no need to
            //have multiple chunks , data[0] had all of it. data length at the end was 1.
            const res = JSON.parse(decoded)
            requests.set(String(res["submission_id"]) , payload)
            console.log(requests)
        }
        catch(e){
            console.error(`Error in extractRequestData : ${e}`)
        }
    }

}

const extractResponseData = (requestDetails : browser.webRequest._OnBeforeRequestDetails) => {
    const filter = browser.webRequest.filterResponseData(requestDetails.requestId);

    const data : ArrayBuffer[] = []

    filter.ondata = event => {
        data.push(event.data)
        filter.write(event.data)
    }

    filter.onstop = () => {
        filter.disconnect()
        try{
            const decoded = decoder.decode(data[0])
            const obj = JSON.parse(decoded)
            console.log(obj)
            if(!obj["submission_id"] || !requests.get(obj["submission_id"])){
                throw new Error(`Submission hasn't completed OR no corresponding request is stored`)
            } 
            startPush(requests.get(obj["submission_id"]) , obj)
            requests.delete(obj["submission_id"])
        }
        catch(e){
            console.error(`Error in extractRequestData : ${e}`)
        }
    }
}
const startPush = async (requestPayload : RequestPayloadType , responseBody : ResponseBodyType) => {
    const requestURL = requestPayload["requestURL"]
    const typedCode = requestPayload["typedCode"]
    const problemSlug = requestURL.match(BETWEEN_SLASHES_PATTERN)?.at(-2) as string;
    const problemID = responseBody["question_id"];
    const memBeat = String(Math.round(responseBody["memory_percentile"]));
    const timeBeat = String(Math.round(responseBody["runtime_percentile"]));
    const extRes = getExtension(responseBody["lang"]);
    if(extRes["success"] === false){
        console.error(`Error in extractRequestData : ${extRes["message"]}`)
        return
    }
    const ext = extRes["data"] as string
    const accessToken = await browser.storage.local.get("access_token")
    const formData = await browser.storage.local.get("formData")
    console.log("in extract data : " , accessToken , " " , formData)
    if("formData" in formData){
        const formDataObj = JSON.parse(formData["formData"]);
        if(formDataObj["save-local"] === "yes"){
            const file = new Blob([typedCode], { type: 'text/plain' });
            const fileURL = URL.createObjectURL(file);
            const payload = {
                filename: `${problemID}-${problemSlug}.${ext}`,
                saveAs: true,
                url: fileURL
            };
            browser.downloads.download(payload)
            URL.revokeObjectURL(fileURL)
        }
        if("access_token" in accessToken){
            mainPush(formDataObj["repo-path"], accessToken["access_token"] , formDataObj["push-behaviour"], problemID, problemSlug, typedCode, ext, memBeat, timeBeat);
        }
    }

}

browser.webRequest.onBeforeRequest.addListener(
  extractRequestData,
  { urls: ["https://leetcode.com/problems/*/submit/"]},
  ["blocking", "requestBody"]
);

//why not onResponseStarted ? doesnt allow "blocking" in extraInfoSpec. is it because its just a signal that data has begun arriving?
//actual reading/modifying of response body is maybe only allowed in onBeforeRequest , onHeadersRecieved
browser.webRequest.onHeadersReceived.addListener(
  extractResponseData,
  { urls: ["https://leetcode.com/submissions/detail/*/check/"]},
  ["blocking"]
);