import React, {useState} from "react";
import style from "./GroupInvite.module.css";

const GroupInviteSearchItem = (props) => {
    //States
    const [inviteSent, setInviteSent] = useState(false);

    const sendInvite = () => {
        props.sendInvite(props.account.user_id, props.account.username);
        setInviteSent(true);
    }

    return (
        <div>
        {inviteSent ? 
            React.Fragment
            :
            <div className={style.searchItem} onClick={sendInvite} key={Math.random()}>
                <h3 onClick={sendInvite} className={style.searchItemText}>@{props.account.username}</h3>
            </div>
        }    
        </div>
        
        
    );

}
 
export default GroupInviteSearchItem;