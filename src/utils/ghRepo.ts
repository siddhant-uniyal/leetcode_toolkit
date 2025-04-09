import { createFile } from "./ghFile"

const URL = "https://api.github.com"

export const createRepoIfNotExist = async (owner  : string , repo  : string , token : string ) => {
    try{
        console.log("Checking for repository...")

        const res = await fetch(`${URL}/repos/${owner}/${repo}`,{
            method : "GET",
            headers: {
                Authorization : `Bearer ${token}`,
                Accept : "Accept: application/vnd.github+json",
                'X-GitHub-Api-Version' : "2022-11-28"
            }
        })

        if(res.status === 404){
            console.log("Repository not found. Creating...")
            const res = await fetch(`${URL}/user/repos` , {
                method : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github+json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name:repo,
                    description : "Save your latest LeetCode submissions on Github!",
                    private:false,
                    auto_init:false
                })
            })

            if(!res.ok){
                throw new Error(`Error while creating new repository: ${res.status} ${res.statusText}`)
            }

            console.log("Repository created successfully")

            const filePath = "README.md"

            const fileContent = `<h1>${repo}</h1><p>Made with <a href="https://addons.mozilla.org/en-US/firefox/addon/leetcode_toolkit/">LeetCode Toolkit</a></p>`

            const createReadmeRes = await createFile(owner , repo , token , filePath , fileContent , "Initial commit")

            if(createReadmeRes.success === false){
                return {
                    "message" : "readme-create-error",
                    "data" : null,
                    "success" : false
                }
            }

            return {
                "message" : "repo-create-success",
                "data" : null,
                "success" : true
            }
        }

        if(!res.ok){
            throw new Error(`Error while checking for repository: ${res.status} ${res.statusText}`)
        }

        console.log("Repository exists")
        return {
            "message" : "repo-check-success",
            "data" : null,
            "success" : true
        }          
    }
    catch(e){
        console.error("Error in createRepoIfNotExist: " , e)
        return {
            "message" : "repo-check-server-error",
            "data" : null,
            "success" : false
        }
    }
}