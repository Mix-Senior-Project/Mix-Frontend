import style from "./AccountManagement.module.css";
import standardStyle from "../Utilities/MixStandardizedStyle.module.css";
import React, {useState, useEffect, useCallback} from "react";
import InterestSelection from "../Utilities/InterestSelection";

const InterestSelectionStep = (props) => {
  //Account Management states
  const [userInterests, setUserInterests] = useState(props.account.interests);
  const [trendingInterests, setTrendingInterests] = useState([]);

  //Moves the user onto the next Account Creation step
  const nextPage = () => {
    props.updateAccountInfo({
      user_id: props.account.user_id,
      banner_picture: props.account.banner_picture,
      bio: props.account.bio,
      email: props.account.email,
      friends_list: props.account.friends_list,
      groups_joined: props.account.groups_joined,
      interests: userInterests,
      profile_picture: props.account.profile_picture,
      username: props.account.username,
      posts_made: [],
      events: [],
      blocked: []
    })
    props.updateWizardPage("createAccountStepFour");
  }

  //Adds newly selected interests to the user's account
  const addInterests = async (newInterests) => {
    let addedInterestNames = [];
    for (let i = 0; i < newInterests.length; i++) {
      addedInterestNames.push(newInterests[i].interestName);
    }

    try {
      await fetch('/* ADD USER INTEREST API */', {
        method: 'PATCH',
        body: JSON.stringify({
          "user_id": props.account.user_id,
          "interests": addedInterestNames
        }),
      })
      .then((response) => console.log(response.json()))
      console.log("Account Creation Interest Addition Request Sent");
    } catch (error) {
      console.log("API Request Failed: AddUserInterest");
      console.log(error);
      return;
    }

    //Save data
    let newInterestArray = [];
    for (let i = 0; i < userInterests.length; i++) {
      newInterestArray.push(userInterests[i]);
    }
    for (let i = 0; i < newInterests.length; i++) {
      let interestAlreadySaved = false;
      for (let j = 0; j < newInterestArray.length; j++) {
        if (newInterestArray[j].interestID === newInterests[i].interestID) {
          interestAlreadySaved = true;
        }
      }

      if (!interestAlreadySaved) {
        newInterestArray.push(newInterests[i]);
      }
    }
    setUserInterests(newInterestArray);
  }

  //Removes set interests from the user's account
  const removeInterests = async (removedInterests) => {
    let removedInterestNames = [];
    for (let i = 0; i < removedInterests.length; i++) {
      removedInterestNames.push(removedInterests[i].interestName);
    }
    try {
      await fetch('/* REMOVE USER INTEREST API */', {
        method: 'PATCH',
        body: JSON.stringify({
          "user_id": props.account.user_id,
          "interests": removedInterestNames
        }),
      })
      .then((response) => response.json())
      console.log("User Settings Interest Removal Request Sent");
    } catch (error) {
      console.log("API Request Failed: RemoveUserInterest");
      console.log(error);
      return;
    }

     //Save data on frontend
     let newInterestArray = [];
     for (let i = 0; i < userInterests.length; i++) {
      let keepInterest = true;
      for (let j = 0; j < removedInterests.length; j++) {
        if (userInterests[i].interestID === removedInterests[j].interestID) {
          keepInterest = false;
        }
      }

      if (keepInterest) {
        newInterestArray.push(userInterests[i]);
      }
     }
     setUserInterests(newInterestArray);
  }

  //Fetches trending interests and passes it to be populated
  const fetchData = useCallback(async () => { 
    let trendingInterestsObj;
    try {
        let fetchResp = await fetch("/* GET TRENDING INTERESTS API */");
        trendingInterestsObj = await fetchResp.json();
    } catch (error) {
        console.log("GetTrendingInterests API Failure");
        return;
    }
    let interestOptions = [];
    for (let i = 0; i < trendingInterestsObj.interests.length; i++) {
      interestOptions.push(trendingInterestsObj.interests[i]);
    }
    setTrendingInterests(interestOptions);
  }, []);

  //Fetches data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div id={style.createAccountBody}>
        <div id={style.headerGrouping}>
            <div id={style.header}>
                <h2>What are your interests?</h2>
                <p><b>Select some topics you are interested in. Note, these will be visible to other users.</b></p> 
            </div>
        </div>
         <InterestSelection editable={true} addInterests={addInterests} removeInterests={removeInterests} preSelectInterests={userInterests} trendingInterests={trendingInterests} account={props.account} key={Math.random()}/>
         <button onClick={nextPage} className={standardStyle.submitButton}>Continue</button>
    </div>
  );
}
 
export default InterestSelectionStep;