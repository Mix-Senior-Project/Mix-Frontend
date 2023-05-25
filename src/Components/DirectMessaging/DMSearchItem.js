import React, {useState} from "react";
import style from "./DMs.module.css";

const DMSearchItem = (props) => {
    const [selected, setSelected] = useState(false);

    const toggleMessage = (e) => {
        let users = props.recipients;
        users.push(props.user.username);
        const unique = [];
        users.map((item) => {
            var findItem = unique.find((x) => x === item);
            if (!findItem) unique.push(item);
        });
        props.setRecipients(unique);

        if (props.recipients.length > 5){
            props.setMax(true);
        }
        setSelected(true);

        let list = [];
        for (var i = 0; i < props.searchResults.length; i++){
            if (props.user.username !== props.searchResults[i].username) {
                list.push(props.searchResults[i]);
            }
        }
        props.setSearchResults(list);

        getFollowers();
    }

    const getFollowers = async () => {
        let tempObj = "";
            try {
                await fetch(("/* GET USER FRIENDS API */" + props.user.user_id))
                .then(response => response.json())
                .then(json => tempObj = json)
                console.log(tempObj);
                console.log("API Request Sent: GetUserFriends");
            } catch (error) {
                console.log("API Request Failed: GetUserFriends");
                console.log(error);
                return;
        }            

        let list = [];
        if ((tempObj.friend_list !== null) && (tempObj.friend_list !== "null")) {
            for (let i = 0; i < tempObj.friend_list.length; i++) {
              list.push({
                  username: tempObj.friend_list[i].username,
                  user_id: tempObj.friend_list[i].id,
                  role: "userFriend",
                  profile_picture: tempObj.friend_list[i].profile_picture
              });
            }
        }
        
        let followsMe = false;
        let followThem = false;

        for (let i = 0; i < list.length; i++){
            if (list[i].user_id === props.account.user_id){
                     followsMe = true;
            }
        }

        for (let i = 0; i < props.account.friends_list.length; i++){
            if (props.account.friends_list[i] === props.user.user_id){
                followThem = true;
            }
        }

        if (followsMe && followThem) {
            props.setMutual(true);
        }
        props.setVerified(true);
    }

    return (
        <div>
            {selected ?
                React.Fragment
                :
                <div className={style.searchItem} onClick={toggleMessage} key={Math.random()}>
                    <h3 onClick={toggleMessage} className={style.searchItemText}>@{props.user.username}</h3>
                </div>
            }
        </div>
    );

}
 
export default DMSearchItem;