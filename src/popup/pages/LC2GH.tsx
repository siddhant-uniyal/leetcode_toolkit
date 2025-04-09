import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
const LC2GH = () => {
  const [isAuth , setisAuth] = useState(0)
  const handleAuth = async () => {
    const state = [...crypto.getRandomValues(new Uint8Array(16))].map(val=>val.toString(16).padStart(2,"0")).join("")
    const link = import.meta.env.VITE_LINK + `${state}`;
    await browser.storage.local.set({"latestCSRFToken" : state})
    browser.tabs.create({
      url: link
    })
  }
  const handleSettings = async () => {
    browser.tabs.create({
      url : browser.runtime.getURL("./src/settings/settings.html")
    })
  }
  useEffect(() => {
    const fetchToken = async () => {
      const data = await browser.storage.local.get("access_token")
      const access_token = data["access_token"]
      if(!access_token) return
      setisAuth(1)
    }
    fetchToken()
  },[])

  return (
    <div id="lc2gh" className="h-full flex flex-col justify-center">
        <div id="popup-content-div">
            <div id="not-auth-content" className={`${isAuth && "hidden"} flex flex-col justify-center items-center gap-y-4`}>
                <div className="text-white">Authorize now!</div>
                <button onClick={handleAuth} id="auth-button" className={`flex flex-row justify-center items-center  gap-x-2 bg-black w-[8rem] h-[2.5rem] text-white border-none rounded-md transition-opacity duration-200 hover:opacity-80 hover:cursor-pointer`}><FaGithub></FaGithub> AUTHORIZE</button>
            </div>
            <div id="auth-content" className={`${(isAuth^1) && "hidden"} flex flex-col justify-center items-center gap-y-4`}>
                <div id="auth-status" className="text-white">Authorization successful!</div>
                <div id="settings-div">
                    <button onClick={handleSettings} id="settings-button" className="flex flex-row justify-center items-center  gap-x-2 bg-black w-[8rem] h-[2.5rem] text-white border-none rounded-md transition-opacity duration-200 hover:opacity-80 hover:cursor-pointer"><IoMdSettings></IoMdSettings>SETTINGS</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default LC2GH