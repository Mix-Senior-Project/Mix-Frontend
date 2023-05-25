
import standardStyle from "./MixStandardizedStyle.module.css";
import interestStyle from "./Interests.module.css";
import React, { useEffect, useState } from "react";

const RecommendedGroups = (props) => {
    const [collapseGroups, setCollapseGroups] = useState(false);
    const [recommendedGroups, setRecommendedGroups] = useState([]);

    const fetchData = async () => {
        let groupObj = "";
        try {
            await fetch("/* GET RECOMMENDED GROUPS API */")
                .then(response => response.json())
                .then(json => groupObj = json);  
        } catch (error) {
            console.log("API Failure for GetRecommendedGroups!");
            return;
        }
        setRecommendedGroups(groupObj.groups);
    };

    useEffect(() => {
        fetchData();
    }, []);

    //Take the user to the group profile they click on
    const onGroupClick = (e) => {
        if (props.dontNavigate === true) {
            props.onGroupClick(e.target.id);
        } else {
            props.updatePage("group-profile", e.target.id);
        }
        
    }

    const onToggleCollapse = () => {
        setCollapseGroups(!collapseGroups);
    }

    return (
        <div id={interestStyle.recommendedGroups}>
            <div className={interestStyle.recommendedGroupHeader} onClick={onToggleCollapse}>
                <h3 id={interestStyle.interestBoxHeader}>Recommended Groups</h3>
                { collapseGroups ?
                  ( (props.dontNavigate) ?
                    <p id={interestStyle.interestBoxSubtitle}><i>Select a group to join!</i></p> : <p id={interestStyle.interestBoxSubtitle}><i>Click a group to visit their profile!</i></p>
                  )
                  : <p id={interestStyle.interestBoxSubtitle}><i>Click to view your recommended groups.</i></p>
                }
                <br></br>
            </div>
            { collapseGroups ? 
                <div className={interestStyle.recommendedGroupBackground}>
                    { recommendedGroups.map((group) => {
                        return <button className={standardStyle.bubbleItem} id={group.group_id} onClick={onGroupClick} key={Math.random()}>{group.group_name}</button>  
                        })
                    }
                </div> : React.Fragment
            }
        </div>
        
    );
}

export default RecommendedGroups;