import style from "./InterestSelection.module.css";
import standardStyle from "./MixStandardizedStyle.module.css";
import React, {useState} from "react"; 
import Interests from "./Interests";
import InputBox from "../Utilities/InputBox";

const InterestSelection = (props) => {
    const [interestChangeLog, setInterestChangeLog] = useState([]);
    const [recommendedInterestCollapse, setRecommendedInterestCollapse] = useState(false);
    const [preSelectedInterests, setPreSelectedInterests] = useState(((props.preSelectInterests === "null" || props.preSelectInterests === null || props.preSelectInterests === []) ? [] : props.preSelectInterests));
    const [input, setInput] = useState("");
    const [uploadIcon, setUploadIcon] = useState("null");

    const handleInput = (name, value) => {
        setInput(value);
    }

    const updateChangeLog = (interest, action) => {
        let newInterestChangeLog = [];
        let newPreSelectedInterests = [];

        if (action === "add") {
            newPreSelectedInterests = preSelectedInterests;
            newPreSelectedInterests.push(interest);
        }
        if (action === "remove") {
            for (let i = 0; i < preSelectedInterests.length; i++) {
                if (preSelectedInterests[i] !== interest) {
                    newPreSelectedInterests.push(preSelectedInterests[i]);
                }
            }
        }

        setPreSelectedInterests(newPreSelectedInterests);
        
        //Check if we need to remove a request from changelog
        let undoRequest = false;
        for (let i = 0; i < interestChangeLog.length; i++) {
            if (interestChangeLog[i].interest === interest) {
                undoRequest = true;
            } else {
                newInterestChangeLog.push(interestChangeLog[i]);
            }
        }

        if (undoRequest) {
            setInterestChangeLog(newInterestChangeLog);
            return;
        }

        newInterestChangeLog.push({
            action: action,
            interest: interest
        });
        setInterestChangeLog(newInterestChangeLog);
    }

    const saveChanges = async () => {
        let interestsToRemove = [];
        let interestsToAdd = [];

        for (let i = 0; i < interestChangeLog.length; i++) {
            if (interestChangeLog[i].action === "add") {
                interestsToAdd.push(interestChangeLog[i].interest);
            }
            if (interestChangeLog[i].action === "remove") {
                interestsToRemove.push(interestChangeLog[i].interest);
            }
        }

        if (interestsToRemove.length > 0) {
           props.removeInterests(interestsToRemove); 
        }
        
        if (interestsToAdd.length > 0) {
            props.addInterests(interestsToAdd);
        }
    }

    const createInterest = async (e) => {
        if (input === "") return;

        //See if the interest already exists
        let endpoint = ("/* SEARCH ALL API */" + input);
        let returnObj;

        try {
            await fetch(endpoint, {
             method: 'GET',
           })
           .then((response) => response.json())
           .then((json) => returnObj = json);
        } catch (error) {
            console.log("API Request Failed: SearchAll");
            console.log(error);
           return;
        }
        console.log("Search API Fired!");

        let interest = null;
        console.log(returnObj);
        if (returnObj !== "No results found") {
            for(let i = 0; i < returnObj.interests.length; i++) {
                if (returnObj.interests[i].interest_name === input) {
                    interest = returnObj.interests[i];
                    break;
                }
            }    
        }
        

        if (interest === null) {
            let result = "";
            try {
                await fetch('/* MAKE INTEREST API */', {
                method: 'PUT',
                body: JSON.stringify({
                    "interest_name": input,
                    "userID": props.account.user_id,
                    "uri": uploadIcon
                    }),
                })
                .then((response) => response.json())
                .then((json) => result = json);
                console.log("Make Interest API Request Sent");
            } catch (error) {
                console.log("Interest Already Exists or Interest Creation API Failure!");
            }

            //If we got this far then we have successfully made a new interest & it should already be attached to an account.
            props.addInterests([{
                interestID: result.ID,
                interestName: result.interest_name,
                interestIcon: result.interest_s3_icon
            }]);

            //Update selected interests
            let newPreSelectedInterests = preSelectedInterests;
            newPreSelectedInterests.push({
                interestID: result.ID,
                interestName: result.interest_name,
                interestIcon: result.interest_s3_icon
            });
            setPreSelectedInterests(newPreSelectedInterests);
        } else {
            props.addInterests([{
                interestID: interest.interest_id,
                interestName: interest.interest_name,
                interestIcon: "null"
            }]);

            //Update selected interests
            let newPreSelectedInterests = preSelectedInterests;
            newPreSelectedInterests.push({
                interestID: interest.interest_id,
                interestName: interest.interest_name,
                interestIcon: "null"
            });
            setPreSelectedInterests(newPreSelectedInterests);
        }
    }

    const uploadIconMedia = (e) => {
        let fileType = e.target.files[0].type.split("/")[1];
        if ((fileType !== "jpeg") && (fileType !== "png") && (fileType !== "jpg") && (fileType !== "apng")) {
            return;
        }

        let file = e.target.files[0];
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = async () => {
            let fileName = (Math.round(100000000*Math.random())) + "." + file.type.split("/")[1];
            let binaryString = fileReader.result + "=="; 
            let s3Response = "";
            let response;

            //Save image as an S3 Object with AWS
            try {
                response = await fetch("/* MAKE S3 IMAGE V2 API */", {
                method: 'POST',
                body: JSON.stringify({
                    "name": fileName,
                    "file": binaryString
                }),
                });
                s3Response = await response.json();
            } catch (error) {
                console.log("MakeS3ImageV2 API Failure");
                return;
            }
            setUploadIcon(s3Response.URI);
        }
    }

    const updateRecommendedInterestCollapse = () => {
        setRecommendedInterestCollapse(!recommendedInterestCollapse);
    }

    return (
        <div id={style.InterestSelection}>
            <div id={style.input}>
                <h3>Update your Account Interests</h3>
            </div>
            { (props.account.interests !== "null") ?
                (props.account.interests.length <= 10) ?
                    <div id={style.inputBar}>
                        <label htmlFor={"iconUpload"} id={style.uploadIcon}></label>
                        <input name={props.name} id={"iconUpload"} className={style.cancelStyle} type="file" accept="image/*" onChange={uploadIconMedia}></input> 
                        <div id={style.inputFormatting}>
                            <InputBox type={"text"} name={"newInterest"} headerText={"Add an interest"} value={input} onChange={handleInput}/>
                        </div>
                        <button className={standardStyle.submitButton} onClick={createInterest}>Add Interest</button>
                    </div> : <div id={style.inputBar}> You have hit the maximum amount of interests! <br></br> First remove an interest before adding a new one. </div> 
                :
                <div id={style.inputBar}>
                    <label htmlFor={"iconUpload"} id={style.uploadIcon}></label>
                    <input name={props.name} id={"iconUpload"} className={style.cancelStyle} type="file" accept="image/*" onChange={uploadIconMedia}></input> 
                    <div id={style.inputFormatting}>
                        <InputBox type={"text"} name={"newInterest"} headerText={"Add an interest"} value={input} onChange={handleInput}/>
                    </div>
                    <button className={standardStyle.submitButton} onClick={createInterest}>Add Interest</button>
                </div>
            }
            
            <div id={style.results}>
                <Interests editable={true} 
                    preSelectInterests={preSelectedInterests} 
                    updateChangeLog={updateChangeLog} 
                    saveChanges={saveChanges} 
                    trendingInterests={props.trendingInterests} 
                    recommendedInterestCollapse={recommendedInterestCollapse} 
                    updateRecommendedInterestCollapse={updateRecommendedInterestCollapse}
                    account={props.account}
                    key={Math.random()}/>
            </div>
        </div>
    );
}
export default InterestSelection;