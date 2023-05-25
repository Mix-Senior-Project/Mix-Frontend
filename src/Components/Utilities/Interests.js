import style from "./Interests.module.css";
import standardizedStyle from "./MixStandardizedStyle.module.css";
import React, {useState, useEffect} from "react"; 
import defaultIcon from "../Static-Images/pencil.png";

const Interests = (props) => {
  const [showInterests, setShowInterests] = useState(true);
  const [interestOptions , setInterestOptions] = useState([]);
  const [selected, setSelected] = useState((props.preSelectInterests !== "null" && props.preSelectInterests !== null) ? props.preSelectInterests : []);

  const handleClick = (event) => {
    if (event.target.id === '') return;

    let interestMetadata = null;
    for (let i = 0; i < interestOptions.length; i++) {
      if (interestOptions[i].interestID == event.target.id) {
        interestMetadata = interestOptions[i];
      }
    }
    for (let i = 0; i < selected.length; i++) {
      if (selected[i].interestID == event.target.id) {
        interestMetadata = selected[i];
      }
    }

    var updatedList = [];

    if (selected.length === 0) {
      if (props.account.interests !== "null") {
        if ((props.preSelectInterests.length) > 10) {
          console.log("Maximum interests, remove an interest before adding a new one!");
          return;
        }
      }

      updatedList.push(interestMetadata);
      props.updateChangeLog(interestMetadata, "add");
      setSelected(updatedList);
      return;
    }
    
    //True if we want to add and false if we want to remove
    var addInterest = true;

    //Check if the user is wishing to unselect an interest
    if (selected.length > 0) {
      for (let i = 0; i < selected.length; i++) {
        if (selected[i].interestID !== interestMetadata.interestID) {
          updatedList.push(selected[i]);
        } else {
          addInterest = false;
        }
      }
    } 

    //If we removed the interest, then we can update the interest list and exit the method now.
    if (!addInterest) { 
      props.updateChangeLog(interestMetadata, "remove");
      setSelected(updatedList); 
      return; 
    };

    //If an interest wasn't removed then we should add the interest selected to the list.
    if (props.account.interests !== "null") {
      if ((props.preSelectInterests.length) > 10) {
        console.log("Maximum interests, remove an interest before adding a new one!");
        return;
      }
    }

    updatedList.push(interestMetadata);
    props.updateChangeLog(interestMetadata, "add");
    setSelected(updatedList);
  };

  //Eventually this function will send saved interests up to the parent component if it wishes to save choices (when in edit mode)
  const toggleInterestDisplay = (e) => {
    if (showInterests) {
      props.saveChanges();
    }
    setShowInterests(!showInterests);
  }

  //Fetches data on component mount
  useEffect(() => {
    let interestOptions = [];
    if (props.editable) {
      for (let i = 0; i < props.trendingInterests.length; i++) {
        let isTrendingInterestSelected = false;
        for (let k = 0; k < props.preSelectInterests.length; k++) {
          if (props.preSelectInterests[k].interestID === props.trendingInterests[i].interestID) {
            isTrendingInterestSelected = true;
          }
        }
        if (!isTrendingInterestSelected) {
          interestOptions.push(props.trendingInterests[i]);
        }
      }
    }

    setInterestOptions(interestOptions);
  }, [props.trendingInterests, props.preSelectInterests, props.editable]);

  const collapseToggle = () => { props.updateRecommendedInterestCollapse(); }

  return (
    <div>
      { showInterests ? 
        <div id={style.interests}>
          { (props.editable) ? 
            <div id={style.interestBox}>
              <div className={style.recommendedInterestHeader} onClick={collapseToggle}>
                <h3 id={style.interestBoxHeader}>Recommended Interests</h3>
                { (props.recommendedInterestCollapse) ?
                  <p id={style.interestBoxSubtitle}><i>Click an interest to save it to your account.</i></p> : <p id={style.interestBoxSubtitle}><i>Click to view your recommended interests!</i></p>
                }
                <br></br>
              </div>
              { (props.recommendedInterestCollapse) ?
                <div id={style.interestSection}>
                  { interestOptions.map((interest) => {
                    let foundInterest = false;
                    for (let i = 0; i < selected.length; i++) {
                      if (selected[i] === interest.interestID) {
                        foundInterest = true;
                      }
                    }
                    if (foundInterest === false) {
                      return <button id={interest.interestID} className={standardizedStyle.bubbleItem} onClick={handleClick}  key={Math.random()}> 
                                {(interest.interestIcon === "null") ? 
                                  <img src={defaultIcon} height='14px' alt="Unable to load"></img> 
                                  : 
                                  <img src={interest.interestIcon} height='14px' alt="Unable to load"></img>
                                }
                                {interest.interestName}
                              </button>;
                    }
                    return null;
                  })}  
                </div> : React.Fragment  
              }
            </div>  
            : 
            props.preSelectInterests.map((interest) => { return <button id={interest.interestID} className={standardizedStyle.bubbleItem} key={Math.random()}>{interest.interestIcon === "null" ? <img src={defaultIcon} height='14px' alt=""></img> : <img src={interest.interestIcon} height='14px'alt=""></img> } {interest.interestName}</button>; })
          }
          { (props.editable) ? 
            <div id={style.interestBox}>
              <div className={style.recommendedInterestHeader}>
                <h3 id={style.interestBoxHeader}>My Interests</h3>
                <p id={style.interestBoxSubtitle}><i>Select an interest to remove it from your interests.</i></p>  
                <br></br>
              </div>
              <div id={style.interestSection}>
                { selected.map((interest) => {
                  return <button id={interest.interestID} className={standardizedStyle.bubbleItem} onClick={handleClick}  key={Math.random()}> 
                              {(interest.interestIcon === "null") ? 
                                <img src={defaultIcon} height='14px' alt="Unable to load"></img> 
                                : 
                                <img src={interest.interestIcon} height='14px' alt="Unable to load"></img>
                              }
                              {interest.interestName}
                            </button>;
                })}  
              </div>
            </div>
            : React.Fragment
          }
        </div> 
      : React.Fragment
      }
      { (props.editable) ? 
        <button className={style.interests} onClick={toggleInterestDisplay}>{showInterests ? "Save Interest Selection" :  "Change Interests"}</button> : React.Fragment
      }
    </div>
  );  
}
 
export default Interests;