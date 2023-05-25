import standardStyle from "./MixStandardizedStyle.module.css";
import React, { useState } from "react";

const InputBox = (props) => {
    const [isMediaUploaded, setIsMediaUploaded] = useState(false);
    const [isMediaValid, setIsMediaValid] = useState(true);

    const changedAllMediaValue = (e) => {
        console.log("Input box file change detected!");

        //Determine if the file type is supported on frontend
        let fileType = e.target.files[0].type.split("/")[1];
        let fileCategorization = "null";
        if ((fileType === "jpeg") || (fileType === "png") || (fileType === "jpg") || (fileType === "apng") || (fileType === "gif")) {
            fileCategorization = "image";
        } else if ((fileType === "mp4") || (fileType === "avi") || (fileType === "mkv") || (fileType === "x-matroska") || (fileType === "quicktime")) {
            fileCategorization = "video";
        } else {
            console.log("UNSUPPORTED FILE TYPE: " + fileType);
        }

        if (fileCategorization === "null") {
            setIsMediaUploaded(false);
            setIsMediaValid(false);
            return;
        }

        props.onChange(props.name, e.target.files[0], fileCategorization);
        setIsMediaUploaded(true);
        setIsMediaValid(true);
    }

    const changedImageValue = (e) => {
        //Determine if the file type is supported on frontend
        let fileType = e.target.files[0].type.split("/")[1];
        let fileCategorization = "null";
        if ((fileType === "jpeg") || (fileType === "png") || (fileType === "jpg") || (fileType === "apng") || (fileType === "gif") || (fileType === "gif")) {
            fileCategorization = "image";
        } 

        if ((fileType === "mov") || (fileType === "avi")) {
            fileCategorization = "video";
        }

        if (fileCategorization === "null") {
            setIsMediaUploaded(false);
            setIsMediaValid(false);
            return;
        }

        props.onChange(props.name, e.target.files[0]);
        setIsMediaUploaded(true);
        setIsMediaValid(true);
    }

    const changedTextValue = (e) => {
        props.onChange(e.target.name, e.target.value);
    }

    return (
        <div className={standardStyle.inputBlock}>
            <div className={standardStyle.inputHeaderBlock}>
                <p className={standardStyle.inputHeaderText}>{props.headerText}</p>
            </div>
            <div className={standardStyle.inputValueBlock}> 
                {(props.type === "text") ?
                    <div>
                    <input type="text" name={props.name} className={standardStyle.inputTextBox} value={`${props.value}`} onChange={changedTextValue} data-testid={props.name} pattern="[a-zA-Z0-9]+"></input>
                    {(props.name === "password" || props.name === "confirmPassword" )?
                        <button id={standardStyle.hidePass} onClick={props.changeType}>Hide Password</button>
                    :React.Fragment}
                    </div>
                    : React.Fragment
                }

                {(props.type === "password") ?
                    <div>
                    <input type="password" name={props.name} className={standardStyle.inputTextBox} value={`${props.value}`} onChange={changedTextValue} data-testid={props.name} pattern="[a-zA-Z0-9]+"></input>
                    <button id={standardStyle.hidePass} onClick={props.changeType}>Show Password</button>
                    </div>
                    : React.Fragment
                }

                {((props.type === "image") || (props.type === "allMedia")) ?
                    ( (!isMediaUploaded) ?
                        <div>
                            <label name={props.name}  htmlFor={props.name} className={standardStyle.inputUploadButton}>{props.buttonText}</label>
                            { (props.type === "image") ?
                                <input name={props.name}  id={props.name} className={standardStyle.cancelStyle} type="file" accept="image/*" onChange={changedImageValue}></input> : React.Fragment
                            }
                            { (props.type === "allMedia") ?
                                <input name={props.name}  id={props.name} className={standardStyle.cancelStyle} type="file" accept="image/*,video/*,.mkv" onChange={changedAllMediaValue}></input> : React.Fragment
                            }
                        </div> : 

                        (isMediaValid ? 
                            <div className={standardStyle.inputUploadSuccessful}>
                                <p><b>File Upload Successful</b></p>
                            </div> :
                            <div className={standardStyle.inputUploadSuccessful}>
                                <p><b>File Upload Successful</b></p>
                            </div>
                        )
                    )
                    : React.Fragment
                }
            </div>    
        </div>
    );
}

export default InputBox;