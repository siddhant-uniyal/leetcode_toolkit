import { useState } from "react";
import "../styles.css";
import ID2Tab from "./pages/ID2Tab";
import LC2GH from "./pages/LC2GH";

const Popup = () => {
  const cols = ["bg-[#426cf5]", "bg-[rgb(33,31,31)]"];
  const [page, setPage] = useState("id2tab");
  const [bgColor, setBgColor] = useState(0);
  return (
    <div
      id="main"
      className="h-full flex flex-col items-center justify-center gap-y-[1.5rem] pb-[0.5rem]"
    >
      <div id="navbar" className="w-full">
        <nav className="h-[3rem] flex flex-row w-full items-center text-white">
          <button
            onClick={() => {
              setPage("id2tab");
              setBgColor(0);
            }}
            className={`hover:opacity-80 flex items-center justify-center flex-1 h-full no-underline transition-opacity transition-colors duration-200 ${cols[bgColor]}`}
          >
            ID2TAB
          </button>
          <button
            onClick={() => {
              setPage("lc2gh");
              setBgColor(1);
            }}
            className={`hover:opacity-80 flex items-center justify-center flex-1 h-full no-underline transition-opacity transition-colors duration-200 ${
              cols[bgColor^1]
            }`}
          >
            LC2GH
          </button>
        </nav>
      </div>
      {page === "id2tab" ? (
        <ID2Tab></ID2Tab>
      ) : page === "lc2gh" ? (
        <LC2GH></LC2GH>
      ) : null}
    </div>
  );
};

export default Popup;
