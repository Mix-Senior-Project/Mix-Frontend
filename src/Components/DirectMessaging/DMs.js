import style from "./DMs.module.css";
import React, {useEffect, useState} from "react";
import add from '../Static-Images/add-square.png';
import pfp from '../Static-Images/default_pfp.png';
import back from '../Static-Images/arrow-left.png';
import refresh from '../Static-Images/refresh.png';
import DMSearch from "./DMSearch";
import Animation from "../Animation";

const DMs = (props) => {
  const [newMessage, setNewMessage] = useState(false);
  const [displayMessage, setDisplayMessage] = useState(false);  
  const [message, setMessage] = useState({
    pfp: "",
    sender: "",
    text: "",
    date: null,
    time: null,
    recipients: [],
    id: ""
  });
  const [messagePreviews, setMessagePreviews] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [failed, setFailed] = useState(false);
  const [scroll, setScroll] = useState(0);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mutual, setMutual] = useState(false);
  const [unread, setUnread] = useState(false);

  //Date props
  var date = new Date();
  let currentDate = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
  let hours = "";
  let minutes = "";
  if (date.getHours() > 12){
    hours = date.getHours()%12;
  } else{
    hours = date.getHours();
  }
  if (date.getMinutes() < 10){
    minutes = `0${date.getMinutes()}`;
  } else {
    minutes = date.getMinutes();
  }
  let currentTime = `${hours}:${minutes}`;

  //toggles new message form
  const toggleNewMessage = e => {
    setNewMessage(!newMessage);
    setMessagePreviews(!messagePreviews);
  }

    //toggles message display
    const startMessage = (e) => {
      setConversation([]);
      setDisplayMessage(true);
      setMessagePreviews(false);
      setNewMessage(false);
    }

    //handles message creation
    const handleMessage = e => {
        let input = message.text;
    
        if (e.target.name === "text") {
          input = e.target.value;
        }
    
        let newMessage = {
          pfp: props.account.profile_picture,
          sender: props.account.username,
          text: input,
          date: currentDate,
          time: currentTime,
          recipients: recipients,
          id: message.id
        }
    
        setMessage(newMessage);
    }   
      
  //sending a message
  const sendMessage = async () => {
    let month;
    let day;
    let year = date.getFullYear();
    let min;

    if (date.getMonth() < 10) {
      let m = date.getMonth() + 1;
      month = "0" + m;
    } else {
      month = date.getMonth() + 1;
    }

    if (date.getDate() < 10) {
      day = "0" + date.getDate();
    } else {
      day = date.getDate();
    }   

    if (date.getMinutes() < 10) {
      min = "0" + date.getMinutes();
    } else {
      min = date.getMinutes();
    }

    let da = "" + year + "-"+ month + "-" + day;
    da = da + " " + date.getHours() + ":" + min + ":" + date.getSeconds();

    let url;
    if (message.pfp !== null && message.pfp !== "null"){
      let index = message.pfp.indexOf("?");
      url = "s3://mixbucket/" + message.pfp.substring(35, index);
    } else {
      url = "null";
    }

    let DMObj = "";

    if (message.text === "") {
      return;
    }

    try {
      await fetch('/* SEND DM API */', {
        method: 'PUT',
        body: JSON.stringify({
          "sender": message.sender,
          "receivers": recipients,
          "message": message.text,
          "message_time": da,
          "sender_pfp": url
        }),
      })
      .then((response) => response.json())
      .then((json) => DMObj = json);
      let newMessages = conversation;
        let newMessage = {
          "conversation_id": DMObj.conversation_id,
          "sender": DMObj.sender,
          "receivers": DMObj.receivers,
          "message": DMObj.message,
          "message_time": DMObj.message_time,
          "sender_pfp": DMObj.sender_pfp,
          "participants": DMObj.participants,
          "message_id": DMObj.message_id
        }
        newMessages.push(newMessage);
        setConversation(newMessages);
        setScroll(scroll+1);
          if (scroll > 4) {
            autoScroll();
          }
    } catch (error) {
      console.log("API Request Failed: sendDM");
      console.log(error);
      return;
    }
    console.log("Send DM API Request Sent");

    let clearMessage = {
      pfp: null,
      sender: null,
      text: "",
      date: null,
      time: null,
      recipients: [],
      id: null
    }
    setMessage(clearMessage);
  }

  //back button functionality
  const backToDMs = e => {
    setDisplayMessage(false);
    setMessagePreviews(true);
    getConvos();
    setMutual(false);
  }

  const openConvo = async (e) => {
    let id = "";
    //console.log(conversation[0].conversation_id);
    if (conversation[0]!== undefined){
       id = conversation[0].conversation_id;
    } else {
      id = e.target.id;
    }

        try {
          await fetch("/* GET CONVERSATION API */" + id + "&username=" + props.account.username)
          .then((response) => response.json())
          .then((data) => {
            setConversation(data);
              let list = [];
              for (var i = 0; i < data[0].participants.length; i++){
                if (data[0].participants[i].username !== props.account.username) {
                  list.push(data[0].participants[i].username);
                }
              }
              setRecipients(list);
          });
        } catch (error) {
          console.log("API Request Failed: GetConversation");
          return;
        }
        console.log("Get Conversation API Request Sent");
        setDisplayMessage(true);
        setMessagePreviews(false);
        setNewMessage(false);
  }

  //Fetches data on component mount
  useEffect(() => {
    getConvos();
  }, []);

  const getConvos = async () => {
      setLoading(true);
        try {
          let endpoint = "/* GET CONVERSATIONS API */" + props.account.username;
          await fetch(endpoint)
          .then((response) => response.json())
          .then((data) => {
            setConversations(data);
          });
        } catch (error) {
          console.log("API Request Failed: GetUserConversations");
          console.log(error);
          return;
        }
        console.log("Get User Conversations API Request Sent");
        setLoading(false);

        for (let i = 0; i < conversations.length; i++){
          for (let j = 0; j < conversations[i].participants.length; j++){
            if ((conversations[i].participants[j].username === props.account.username) && (conversations[i].participants[j].readMessage === 0)) {
              setUnread(true);
            }
          }
        }
  }

  const autoScroll = e => {
    window.scrollTo(0,document.body.scrollHeight);
  }

  const deleteDM = async (e) => {
    try {
      await fetch("/* DELETE MESSAGE API */", {
        method: 'DELETE',
        body: JSON.stringify({
          "messageID": e.target.id
        }),
      })
      console.log("Delete Message Request Sent");
    } catch (error) {
      console.log(error);
      console.log("DeleteDM API Failure");
      return;
    }
    openConvo();
  }

  const onUsernameClick = async (e) => {
    let uuid = "";
    let tempObj = "";
    try {
        await fetch(("/* GET USER FRIENDS API */" + props.account.user_id))
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

    console.log(list);
    for (let i = 0; i < list.length; i++){
      if (list[i].username === e.target.id){
        uuid = list[i].user_id;
      }
    }
    props.updatePage("user-profile", uuid);
  }

  return (
    <div>
        <div id={style.header}>
            {displayMessage ?
              <div id={style.header}>
                <button id={style.backBtn}><img src={back} id={style.backToDMs} onClick={backToDMs} alt=""></img></button>
                <h3>
                  {recipients.map((user) => {
                    return <b className={style.name} id={user} onClick={onUsernameClick} key={Math.random()}>{user}&nbsp;&nbsp;&nbsp;&nbsp;</b>
                  })}
                </h3>
                <button id={style.refreshBtn}><img src={refresh} id={style.refresh} onClick={openConvo} alt =""></img></button>
              </div>
            :<div>
              {newMessage ?
                <button id={style.backBtnOther}><img src={back} id={style.back} onClick={toggleNewMessage} alt=""></img></button>
              :React.Fragment}
              <h3>Messages</h3>
              {!newMessage ?
              <button id={style.add} onClick={toggleNewMessage}><img src={add} id={style.addImg} alt=""></img></button>
              :React.Fragment}
            </div>}
        </div>
        {messagePreviews ? 
          (conversations.length > 0) ? 
            React.Fragment
            :
            (loading) ?
            <div id={style.loading}><Animation/></div>
            :<b>You have no conversations! Click the plus button to start a message</b>
        :React.Fragment}
        {messagePreviews ?
            conversations.map((idxVal) => {
                let list = [];
                let users = idxVal.participants;
                for (var i = 0; i < users.length; i++) {
                  if (users[i].username !== props.account.username){
                    list.push(users[i].username);
                  }
                }
                return <button id={idxVal.conversation_id} className={style.messagePreview} key={Math.random()} onClick={openConvo}>
                  {unread ?
                  <div id={style.notification}></div>
                  :React.Fragment
                  }
                  {list.map((user) => {
                      return <b id={idxVal.conversation_id} className={style.textPreview} key={Math.random()}>{user}</b>
                    })
                  }
                    <div id={style.datePreview}>{idxVal.message_time.substr(0,10)}</div>
                </button>
            })
        :React.Fragment}
        {newMessage ?
            <div>
              <DMSearch startMessage={startMessage} setRecipients={setRecipients} recipients={recipients} account={props.account} mutual={mutual} setMutual={setMutual}/>
              {!mutual ?
              React.Fragment
              :<button id ={style.startMessage} onClick={startMessage}>Start Message</button>
              }
            </div>
        :React.Fragment}
        {displayMessage ?
          <div>
            <h2 id={style.today}>{currentDate}</h2>
            <div className={style.conversation} key={Math.random()}>
                {conversation.map((idxVal) => {
                  if (idxVal.sender === props.account.username){
                    if (idxVal.message !== null){
                      if (idxVal.sender_pfp === "null") {
                        return <div key={Math.random()}> 
                          <div className={style.myMessage} key={Math.random()}>
                            {idxVal.message}
                            <img id={style.default_pfp} src={pfp} alt=""></img>
                            <button id={idxVal.message_id} className={style.delete} onClick={deleteDM}>Delete</button>
                          </div>
                          <div id={style.myDate}>{idxVal.message_time.substr(10,6)}</div>
                        </div>
                      } else {
                        return <div key={Math.random()}> 
                          <div className={style.myMessage} key={Math.random()}>
                            {idxVal.message}
                            <img id={style.pfp} src={props.account.profile_picture} alt=""></img>
                            <button id={idxVal.message_id} className={style.delete} onClick={deleteDM}>Delete</button>
                          </div>
                          <div id={style.myDate}>{idxVal.message_time.substr(10,6)}</div>
                        </div>
                      }
                    } else {
                      return <div key={Math.random()}> 
                        <div className={style.myMessage} key={Math.random()}>
                          This message has been deleted.
                        </div>
                        <div id={style.myDate}>{idxVal.sender}{idxVal.message_time.substr(10,6)}</div>
                      </div>
                    }
                  }else{
                    if (idxVal.message !== null) {
                      if (idxVal.sender_pfp === "null") {
                        return <div key={Math.random()}>
                          <div className={style.otherMessage} key={Math.random()}>
                            <img id={style.default_pfp} src={pfp} alt=""></img>
                            {idxVal.message}
                          </div>
                          <div id={style.otherDate}>{idxVal.sender}{idxVal.message_time.substr(10,6)}</div>
                        </div>
                      } else {
                        return <div key={Math.random()}>
                          <div className={style.otherMessage} key={Math.random()}>
                            <img id={style.pfp} src={idxVal.sender_pfp} alt=""></img>
                            {idxVal.message}
                          </div>
                          <div id={style.otherDate}>{idxVal.sender}{idxVal.message_time.substr(10,6)}</div>
                        </div>
                      }
                    } else {
                      return <div key={Math.random()}> 
                        <div className={style.otherMessage} key={Math.random()}>
                          This message has been deleted.
                        </div>
                        <div id={style.otherDate}>{idxVal.sender}{idxVal.message_time.substr(10,6)}</div>
                      </div>
                    }
                  }
                })}  
            </div>  
            <div id={style.input}>
                <textarea name="text" id={style.messageInput} value={`${message.text}`} onChange={handleMessage} placeholder="What would you like to say?"/><br></br>
                <button id={style.sendMessage} onClick={sendMessage}>Send Message</button>
            </div>
          </div>
        : React.Fragment}
    </div>
  );
}

export default DMs;
