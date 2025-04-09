export const createFile = async (owner : string , repo : string , accessToken : string , filePath : string , fileContent : string , commitMessage : string) => {
    try{
        const printPath = `${repo}/${filePath}`
        console.log(`Creating a file at ${printPath}...`)
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
        const res = await fetch(url , {
            method : "PUT",
            headers : {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/vnd.github.v3+json", 
                'X-GitHub-Api-Version' : "2022-11-28" 
            },
            body : JSON.stringify({
                message : commitMessage,
                content : btoa(fileContent)
            })
        })
        if(!res.ok){
            throw new Error(`Error creating file at ${printPath} : ${res.status} ${res.statusText}`)
        }
        console.log(`File created at ${printPath} successfully`)
        return {
            "message" : "create-file-success",
            "data" : null,
            "success" : true
        }
    }
    catch(e){
        console.error(`Error in createFile: ${e}`)
        return {
            "message" : "create-file-server-error",
            "data" : null,
            "success" : false
        }
    }
}