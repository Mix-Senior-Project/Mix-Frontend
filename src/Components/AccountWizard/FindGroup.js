import style from "./AccountManagement.module.css";
import CreateGroupForm from "./CreateGroupForm";
import RecommendedGroups from '../Utilities/RecommendedGroups';
import interestStyle from "../Utilities/Interests.module.css";
import React, {useState} from "react";

const FindGroup = (props) => {
    const [collapseGroupCreation, setCollapseGroupCreation] = useState(false);

    const createdGroup = (group) => {
        let groupList = [];
        groupList.push(group);
        props.setLogin({
          user_id: props.account.user_id,
          banner_picture: props.account.banner_picture,
          bio: props.account.bio,
          email: props.account.email,
          friends_list: [],
          groups_joined: groupList,
          interests: props.account.interests,
          profile_picture: props.account.profile_picture,
          username: props.account.username,
          posts_made: [],
          events: [],
          blocked: []
        });
    }

    const skipStep = () => {
      //Add the user to the groups they selected.
      props.setLogin(props.account);
    }

    //For when the user joins a recommended group
    const onGroupClick = async (group_id) => {
      console.log(group_id);
      //Handle API Request
      try {
        await fetch('/* JOIN GROUP API */', {
          method: 'PATCH',
          body: JSON.stringify({ 
            "user_id": props.account.user_id,
            "group_id" : group_id
        }),
        })
        .then((response) => response.json());
        console.log("JoinGroup API Request Sent");
      } catch (error) {
        console.log("API Request Failed: JoinGroup");
        console.log(error);
        return;
      }

      let groupObj = "";
      try {
        await fetch(("/* GET GROUP API */" + group_id))
        .then(response => response.json())
        .then(json => groupObj = json)
      } catch (error) {
        console.log("API Request Failed: GetGroup");
        console.log(error);
        return;
      } 
      console.log("Group Profile GetGroup Request Sent");

      let groupList = [];
      groupList.push(groupObj);
      props.setLogin({
        user_id: props.account.user_id,
        banner_picture: props.account.banner_picture,
        bio: props.account.bio,
        email: props.account.email,
        friends_list: [],
        groups_joined: groupList,
        interests: props.account.interests,
        profile_picture: props.account.profile_picture,
        username: props.account.username,
        posts_made: [],
        events: [],
        blocked: []
      });
    }

    //Navigates the user to the previous account wizard page
    const goBack = () => {
      props.updateWizardPage("createAccountStepThree");
    }

    //Toggle Create Group Form
    const onToggleCollapse = () => {
      setCollapseGroupCreation(!collapseGroupCreation);
    }

    return (
        <div>
          <div id={style.headerGrouping}>
            <div id={style.header}>
              <h2>Join or Create a Group</h2>
            </div>
            <button className={style.closeWindow} onClick={goBack}>Go Back</button>
          </div>
          <div id={style.groupSelection}>    
              <RecommendedGroups updatePage={props.updatePage} dontNavigate={true} onGroupClick={onGroupClick}/>

              <div className={interestStyle.recommendedGroupHeader} onClick={onToggleCollapse}>
                <h3 id={interestStyle.interestBoxHeader}>Create a Group</h3>
                { collapseGroupCreation ?
                  <p id={interestStyle.interestBoxSubtitle}><i>Click to hide group form.</i></p> : <p id={interestStyle.interestBoxSubtitle}><i>Click to begin making a group!</i></p>
                }
                <br></br>
            </div>
                { collapseGroupCreation ?
                  <CreateGroupForm newGroup={createdGroup} skipStep={skipStep} account={props.account} setLogin={props.setLogin} updateWizardPage={props.updateWizardPage} key={Math.random()} displayMode="accountCreation" /> 
                  : React.Fragment
                }
          </div>
          <br></br>  
        </div>
        
    );
}

export default FindGroup;