import { z } from "zod"

export const isFolderExist = async(owner : string , repo  : string, accessToken : string, folderPath : string)  => {
    try{

        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;

        console.log(`Checking if folder ${folderPath} exists...`)

        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/vnd.github.v3+json",
                'X-GitHub-Api-Version' : "2022-11-28"
            }
        });

        if(res["status"] === 404){
            console.log(`Folder ${folderPath} does not exist`)
            return {
                "message" : "folder-not-found",
                "data" : null,
                "success" : true
            }
        }

        if (!res.ok) {
            throw new Error(`Error checking folder ${folderPath}: ${res.status} ${res.statusText}`);
        }

        const data = await res.json()

        return {
            "message" : "folder-found",
            "data" : data,
            "success" : true
        }

    }
    catch(e){
        console.error(`Error in isFolderExist : ${e}`)
        return {
            "message" : "is-folder-exist-server-error",
            "data" : null,
            "success" : false
        }
    }
}

const folderDataSchema = z.array(
    z.object({
        "name" : z.string(),
        "path" : z.string(),
        "sha" : z.string()
    })
)

export const deleteFolder = async (owner : string, repo : string, folderPath : string, accessToken : string , folderData: any) => {
    try{
        console.log(`Deleting folder ${folderPath}...`)
        const validatedFolderData = folderDataSchema.parse(folderData)
        for(const fileData of validatedFolderData){
            if(fileData["path"].split('.').at(-1) === "md") continue
            const url = `https://api.github.com/repos/${owner}/${repo}/contents/${fileData["path"]}`
            const res = await fetch(url , {
                method : "DELETE",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Accept": "application/vnd.github.v3+json", 
                    'X-GitHub-Api-Version' : "2022-11-28"
                },
                body : JSON.stringify({
                    "message" : `Delete file ${fileData["name"]}`,
                    "sha" : fileData["sha"]
                })
            })
            if(!res.ok){
                throw new Error(`Error deleting file ${fileData["name"]}: ${res.status} ${res.statusText}`)
            }
            console.log(`Deleted file ${fileData["path"]} successfully`)
        }
        console.log(`Deleted folder ${folderPath} successfully`)
        return {
            "message" : "delete-folder-success",
            "data" : null,
            "success" : true
        }
    }
    catch(e){
        console.error(`Error in deleteFolder : ${e}`)
        return {
            "message" : "delete-folder-server-error",
            "data" : null,
            "success" : false
        }
    }
}