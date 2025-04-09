const exchangeToken = async (): Promise<void> => {
    const storedObj = await browser.storage.local.get("latestCSRFToken")
    console.log(storedObj)
    const storedState = storedObj["latestCSRFToken"] as string
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code")
    const state = urlParams.get("state")
    console.log(code, state, storedState)
    if ((code && state) && (storedState === state)) {
        fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Accept-Encoding": "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                client_id: import.meta.env.VITE_CLIENT_ID,
                client_secret: import.meta.env.VITE_SECRET,
                code: code,
                redirect_uri: "https://github.com"
            })
        }).then(response => response.json()).then(async (data) => {
            const access_token = data["access_token"]
            await browser.storage.local.set({ "access_token": access_token })
            await browser.storage.local.set({ "latestCSRFToken": "" })
            window.location.href = browser.runtime.getURL("./src/settings/settings.html")
        })
    }
}

exchangeToken()