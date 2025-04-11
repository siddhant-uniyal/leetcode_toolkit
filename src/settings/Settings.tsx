import { useEffect, useRef } from "react";
import "../styles.css";
import "./settings.css";
import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { Toaster, toast } from "sonner";

type FormType = {
  "repo-path": string;
  "push-behaviour": string;
  "save-local": string;
  "dir-input": string;
};

const REPO_LINK_PATTERN = /https:\/\/github\.com\/[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\/[\w\.\-]+/

const Options = () => {

  const okSubmitRef = useRef<HTMLHeadingElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    // watch,
    reset,
  } = useForm<FormType>();

  // const selectedSaveLocal = watch("save-local");

  const notify = () =>
    toast.success("Settings saved successfully!", {
      className: "inter-font",
      duration: 1500,
    });

  useEffect(() => {
    const loadForm = async () => {
      const rawData = await browser.storage.local.get("formData");
      const rawFormData = rawData["formData"]
      if(!rawFormData) return
      const formData = JSON.parse(rawFormData)
      reset(formData);
    };
    loadForm();
  }, []);

  const onSubmit = async (data: FieldValues) => {
    Object.entries(data).forEach(async ([key, value]) => {
      // const nvalue = key === "dir-input" && selectedSaveLocal === "no" ? "" : value.toString();
      data[key] = value
    });
    await browser.storage.local.set({"formData" : JSON.stringify(data)});
    notify();
  };

  return (
    <div id="main" className="inter-font text-white">
        <Toaster richColors></Toaster>
        <fieldset className="flex flex-col gap-y-4 justify-center">
        <h1>Settings</h1>
        <h3 className="text-gray-400">Configure the behaviour of LC2GH.</h3>

        <hr></hr>

        <form id="settings-form" className="flex flex-col gap-y-4 justify-center" onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="repo-path">
            <h3>Repository link</h3>
        </label>
        <input
            {...register("repo-path", {
            required: "Repository path is required",
            pattern: {
                value: REPO_LINK_PATTERN,
                message: `Repository link must be of the form : https://github.com/user/repo . Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen. The repository name can only contain ASCII letters, digits, and the characters ., -, and _.`,
            },
            })}
            type="text"
            name="repo-path"
            id="repo-path"
            placeholder="Enter repo..."
        ></input>


        <i className="fa fa-solid fa-x" aria-hidden="true"></i>
        <h4 className="text-gray-400">A new or existing repository.</h4>

        {errors["repo-path"] && (
            <>
            <p className="text-red-600">{`${errors["repo-path"].message}`}</p>
            </>
        )}

        <hr></hr>

        <h3>Push behaviour</h3>

        <div className="radio-div">
            <input
            {...register("push-behaviour", {
                required: "Please select push behaviour",
            })}
            type="radio"
            id="overwrite"
            name="push-behaviour"
            value="overwrite"
            ></input>
            <label htmlFor="overwrite">
            <h4>Overwrite</h4>
            </label>
        </div>
        <div className="radio-div">
            <input
            {...register("push-behaviour")}
            type="radio"
            id="append"
            name="push-behaviour"
            value="append"
            ></input>
            <label htmlFor="append">
            <h4>Append</h4>
            </label>
        </div>


        <h4 className="text-gray-500">
            Overwrite keeps your most recent submission.
        </h4>
        <h4 className="text-gray-500">
            Append keeps all of your submissions made with LC2GH.
        </h4>


        {errors["push-behaviour"] && (
            <>
            <p className="text-red-600">{`${errors["push-behaviour"].message}`}</p>
            </>
        )}

        <hr></hr>

        <h3>Save locally?</h3>

        <div>
            <div className="radio-div">
            <input
                {...register("save-local", {
                required: "Please choose to save locally or not",
                })}
                type="radio"
                id="yes"
                name="save-local"
                value="yes"
            ></input>
            <label htmlFor="yes">Yes</label>
            </div>
            {/* {selectedSaveLocal === "yes" && (
            <div id="dir-input-div">

                <label htmlFor="dir-input-box">Local directory</label>


                <input
                {...register("dir-input", {
                    required: "Local directory is required",
                })}
                type="text"
                id="dir-input-box"
                name="dir-input"
                placeholder="Enter local directory..."
                ></input>


                {errors["dir-input"] && (
                <>
                    <p className="text-red-600">{`${errors["dir-input"].message}`}</p>
                </>
                )}
            </div>
            )} */}
        </div>

        <div className="radio-div">
            <input
            {...register("save-local")}
            type="radio"
            id="no"
            name="save-local"
            value="no"
            ></input>
            <label htmlFor="no">No</label>
        </div>


        {errors["save-local"] && (
            <>
            <p className="text-red-600">{`${errors["save-local"].message}`}</p>
            </>
        )}
        <button type="submit" id="submit-button" className="self-start">
            Update Settings
        </button>
        </form>

        <h3 id="ok-submit" ref={okSubmitRef}></h3>
        </fieldset>
    </div>
  );
};

export default Options;
