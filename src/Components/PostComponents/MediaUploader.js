import React, {useState} from "react";
import InputBox from "../Utilities/InputBox";
import standardStyle from "../Utilities/MixStandardizedStyle.module.css";
import style from "./Post.module.css";
import AWS from 'aws-sdk';

const MediaUploader = (props) => {
    //States
    const [displayMode, setDisplayMode] = useState("default");
    const [mediaLink, setMediaLink] = useState("");

    //Methods
    const updateLocalMedia = async (name, value, fileCategorization) => {
        const file = value;

        if (fileCategorization === "video") {
            let response = null;
            try {
                response = await fetch(("/* REDACTED */" + props.account.username + "&email=" + props.account.email), {
                method: 'GET',
                });
                response = await response.json();
                console.log("Sending Verification API Call");
            } catch (error) {
                console.log("Verification API Failure");
                return;
            }

            const S3_BUCKET = response.bucketName;
            
            /* REDACTED */
            
            const s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                params: { Bucket: S3_BUCKET },
            });

            console.log("Attempting video upload!");
            let s3_uri = "null";
            s3_uri = s3.upload({
                Key: (Math.round(100000000*Math.random())) + "." + file.type.split("/")[1],
                Body: file,
                ContentType: file.type
              }, async (err, data) => {
                if (err) {
                  console.log(err);
                } else {
                    console.log(data);
                    s3_uri = data.Location;
    
                    if (props.post_id !== "null") {
                        let editPostImageResponse = "";
                        try {
                            response = await fetch("/* EDIT POST IMAGE API */", {
                                method: 'PATCH',
                                body: JSON.stringify({
                                    "postID": props.post_id,
                                    "uri": s3_uri
                                }),
                            });
                            editPostImageResponse = await response.json();
                            console.log("Sending EditPostPhoto API Call");
                        } catch (error) {
                            console.log(error);
                            console.log("Edit Post Photo API Failure.");
                            return;
                        }
                        console.log(editPostImageResponse);
                        props.setNewMedia(fileCategorization, editPostImageResponse);    
                    } else {
                        props.setNewMedia(fileCategorization, s3_uri, file);
                    }
                }
            });
        }

        if (fileCategorization === "image") {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = async () => {
                let fileName = (Math.round(100000000*Math.random())) + "." + file.type.split("/")[1];
                let binaryString = fileReader.result + "=="; 
                let s3Response = "";
                let response;
            
                try {
                    response = await fetch("/* MAKE S3 IMAGE V2 API */", {
                    method: 'POST',
                    body: JSON.stringify({
                        "name": fileName,
                        "file": binaryString
                        }),
                    });
                    s3Response = await response.json();
                    console.log("Sending S3V2 API Call");
                } catch (error) {
                    console.log("MakeS3ImageV2 API Failure");
                    return;
                }

                console.log(props.post_id);
                console.log(s3Response.URI);

                //post_id is null if creating post and populated if post is being edited
                if (props.post_id !== "null") {
                    let editPostImageResponse = "";
                    try {
                        response = await fetch("/* EDIT POST IMAGE API */", {
                            method: 'PATCH',
                            body: JSON.stringify({
                                "postID": props.post_id,
                                "uri": s3Response.URI
                            }),
                        });
                        editPostImageResponse = await response.json();
                        console.log("Sending EditPostPhoto API Call");
                    } catch (error) {
                        console.log(error);
                        console.log("Edit Post Photo API Failure.");
                        return;
                    }
                    props.setNewMedia(fileCategorization, editPostImageResponse);    
                } else {
                    props.setNewMedia(fileCategorization, s3Response.URI, file);
                }
            }    
        }
        
    }

    const updateMediaLink = (name, value) => {
        setMediaLink(value);
    }

    const setNewMediaLink = () => {
        let primedMediaLink = "";
        if (!mediaLink.includes("https://www.youtube.com/") && !mediaLink.includes("https://youtu.be/")) { 
            console.log("Unsupported Media Link!");    
            return; 
        } else {
            primedMediaLink = "<" + mediaLink + ">";
        }
        props.setNewMedia("video", primedMediaLink, null);
    }

    const openMediaUploadForm = () => {
        setDisplayMode("localUpload");
    }

    const openMediaLinkForm = () => {
        setDisplayMode("linkUpload");
    }


    return (
        <div id={style.uploaderBody}>
            <div id={style.MediaUploaderHeader}>
                { (displayMode === "default") ?
                    <h2>Select the an upload method!</h2>
                : React.Fragment }
                { (displayMode === "localUpload") ?
                    <h2>Upload a media file below!</h2>
                : React.Fragment }
                { (displayMode === "linkUpload") ?
                    <h2>Insert a YouTube link below!</h2>
                : React.Fragment }
                
            </div>
            
            { (displayMode === "default") ?
                <div>
                   <button className={style.uploadMediaSelector} onClick={openMediaUploadForm}><h3>Upload a Photo or Video File</h3></button>
                   <button className={style.uploadMediaSelector} onClick={openMediaLinkForm}><h3>Upload a YouTube Video</h3></button> 
                </div>
                : React.Fragment
            }

            { (displayMode === "localUpload") ?
                <div id={style.MediaInputBox}>
                    <InputBox type={"allMedia"} name={"localUpload"} headerText={"Post Media:"} buttonText={"Click to upload a Photo or Video"} onChange={updateLocalMedia}/>
                </div>
                :
                React.Fragment
            }

            { (displayMode === "linkUpload") ?
                <div>
                    <div id={style.MediaInputBox}>
                        <InputBox type={"text"} name={"mediaLink"} headerText={"Youtube Link:"} value={mediaLink} onChange={updateMediaLink}/>
                    </div>
                    <button className={standardStyle.submitButton} id={style.submitButtonFormatting} onClick={setNewMediaLink}>Attach YouTube Video</button> 
                </div>
                :
                React.Fragment
            }
        </div>
    );
}

export default MediaUploader;