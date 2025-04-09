import { getMetadata } from "./getMetadata.ts"
import { createFile } from "./ghFile.js"
import { deleteFolder, isFolderExist } from "./ghFolder.ts"
import { createRepoIfNotExist } from "./ghRepo.ts"

const BETWEEN_SLASHES_PATTERN = /(?<=\/)([^\/]+)(?=\/)/g 

const getMDTitle = (problemID : string , problemTitle : string, problemSlug : string) => {
    const problemURL = `https://leetcode.com/problems/${problemSlug}/description/`
    return `# [${problemID}. ${problemTitle}](${problemURL})\n`
}

export const createFilesUtil = async(owner : string , repo : string , accessToken : string , files : string[][]) => {
    try{
        for(const file of files){
            const createFileRes = await createFile(owner , repo , accessToken , file[0] , file[1] , file[2])
            if(createFileRes["success"] === false){
                throw new Error(`${createFileRes["message"]}`)
            }
        }
        return {
            "message" : "create-files-success",
            "data" : null,
            "success" : true
        }
    }
    catch(e){
        console.error(`Error in createFilesUtil : ${e}`)
        return {
            "message" : "create-files-server-error",
            "data" : null,
            "success" : false
        }
    }
}

export const overwritePush = async (owner : string , repo : string , accessToken : string , problemID : string , problemSlug : string , typedCode : string , ext : string , messageRight : string , problemTitle : string, problemMarkdown : string , problemTag : string) => {

    try{

        const folderPath = problemTag + "/" + problemID + "-" + problemSlug

        console.log(`Overwriting ${folderPath}...`)

        const messageLeft = `${problemID}. ${problemTitle}`

        const folderResponse = await isFolderExist(owner , repo , accessToken , folderPath)

        if(folderResponse["success"] === false){
            throw new Error(`${folderResponse["message"]}`)
        }

        if(folderResponse["message"] === "folder-found" && folderResponse["data"]){
            const deleteFolderRes = await deleteFolder(owner , repo , folderPath , accessToken , folderResponse["data"])
            if(deleteFolderRes["success"] === false){
                throw new Error(`${deleteFolderRes["message"]}`)
            }
        }

        const filesToCreate : string[][] = []

        const fileName = `${problemID}-${problemSlug}-0.${ext}`
        const filePath = `${folderPath}/${fileName}`

        filesToCreate.push([filePath , typedCode , messageLeft + " | " + messageRight])

        if(folderResponse["message"] === "folder-not-found"){
            const descriptionMarkdown = getMDTitle(problemID , problemTitle , problemSlug) + problemMarkdown
            const descriptionPath = `${folderPath}/DESCRIPTION.md` 
            filesToCreate.push([descriptionPath , descriptionMarkdown , messageLeft])
        }

        const createFilesUtilRes = await createFilesUtil(owner , repo , accessToken , filesToCreate)

        if(createFilesUtilRes["success"] === false){
            throw new Error(`${createFilesUtilRes["message"]}`)
        }

        console.log(`Overwrite push successful at ${folderPath}`)
    }
    catch(e){
        console.log(`Error in overwritePush : ${e}`)
    }
}
export const appendPush = async (owner : string , repo  : string , accessToken  : string , problemID  : string , problemSlug  : string , typedCode  : string , ext  : string , messageRight  : string , problemTitle  : string , problemMarkdown  : string , problemTag : string ) => {
    try{

        const folderPath = problemTag + "/" + problemID + "-" + problemSlug
        
        console.log(`Appending to ${folderPath}`)

        const messageLeft = `${problemID}. ${problemTitle}`

        const folderResponse = await isFolderExist(owner , repo , accessToken , folderPath)

        if(folderResponse["success"] === false){
            throw new Error(`${folderResponse["message"]}`)
        }

        let len = 0
        if(folderResponse["message"] === "folder-found" && folderResponse["data"]){
            len = folderResponse["data"].length 
        }

        const filesToCreate : string[][] = []

        const fileName = `${problemID}-${problemSlug}-${Math.max(0 , len - 1)}.${ext}`
        const filePath = `${folderPath}/${fileName}`

        filesToCreate.push([filePath , typedCode , messageLeft + " | " + messageRight])

        if(folderResponse["message"] === "folder-not-found"){
            const descriptionMarkdown = getMDTitle(problemID , problemTitle , problemSlug) + problemMarkdown
            const descriptionPath = `${folderPath}/DESCRIPTION.md` 
            filesToCreate.push([descriptionPath , descriptionMarkdown , messageLeft])
        }

        const createFilesUtilRes = await createFilesUtil(owner , repo , accessToken , filesToCreate)

        if(createFilesUtilRes["success"] === false){
            throw new Error(`${createFilesUtilRes["message"]}`)
        }

        console.log(`Append push successful at ${filePath}`)

    }
    catch(e){
        console.log(`Error in appendPush : ${e}`)
    }
}
export async function mainPush(repoPath  : string , accessToken  : string , pushBehaviour  : string , problemID  : string , problemSlug  : string , typedCode  : string , ext  : string , memBeat  : string , timeBeat : string ){
    const [owner , repo] = (repoPath + '/').match(BETWEEN_SLASHES_PATTERN)?.slice(-2) as string[]
    const metadataRes = await getMetadata(problemSlug)

    if(metadataRes["success"] === false || metadataRes["data"] === null){
        console.error(`Error in mainPush : ${metadataRes.message}`)
        return
    }
    const [problemTitle , problemMarkdown , problemTag] = metadataRes["data"] as string[]

    const beatsMessage = `Beats ${timeBeat}% Time ${memBeat}% Space`

    const checkRepoRes = await createRepoIfNotExist(owner , repo , accessToken)

    if(checkRepoRes["success"] === false){
        console.error(`Error in mainPush : ${checkRepoRes.message}`)
        return
    }

    if(pushBehaviour === "overwrite"){
        overwritePush(owner , repo , accessToken , problemID , problemSlug , typedCode , ext , beatsMessage,problemTitle , problemMarkdown , problemTag)
    }
    else if(pushBehaviour === "append"){
        appendPush(owner , repo , accessToken , problemID , problemSlug , typedCode , ext , beatsMessage,problemTitle , problemMarkdown , problemTag)
    }
}