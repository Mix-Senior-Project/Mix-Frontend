import interestStyle from "../Utilities/Interests.module.css";
import React from "react";

const PrivacyPopup = (props) => {
    return (
        <div id={interestStyle.recommendedGroups}>
            <div className={interestStyle.recommendedGroupBackground}>
                { props.privacyType === "blocked" ?
                    <div>
                        <h3 id={interestStyle.interestBoxHeader}>You currently have this user blocked.</h3> <br></br>
                        <p>If you wish to see their posts, first unblock them through your settings tab</p>
                    </div> : React.Fragment
                }

                { props.privacyType === "banned" ?
                    <div>
                        <h3 id={interestStyle.interestBoxHeader}>You are currently banned from viewing content from this group.</h3> <br></br>
                        <p>If you wish to be unbanned, contact a the group owner or a group moderator</p>
                    </div> : React.Fragment
                }
                <br></br>    
            </div>
            
        </div>
    );
}

export default PrivacyPopup;