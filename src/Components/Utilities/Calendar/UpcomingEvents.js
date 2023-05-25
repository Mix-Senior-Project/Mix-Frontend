import React, {useState, useEffect} from 'react';
import style from "./calendar.module.css";

const UpcomingEvents = (props) => {
    const [index, setIndex] = useState(0);

    const back = (e) => {
        if (index > 0) {
         let list = [];
         if(props.events[index - 2] !== undefined){
           list.push(props.events[index - 2]);
     
         }
         if(props.events[index - 1] !== undefined){
           list.push(props.events[index - 1]);
         }
         props.setDisplay(list);
         setIndex(index - 2);
        }
    }
     
    const forward = (e) => {
         if (index < props.events.length - 2) {
           let list = [];
           if(props.events[index + 2] !== undefined){
             list.push(props.events[index + 2]);
           }
           if(props.events[index + 3] !== undefined){
             list.push(props.events[index + 3]);
           }
           props.setDisplay(list);
           setIndex(index + 2);
         }
    }

    const deleteEvent = async (e) => {
        try {
          await fetch ("/* DELETE EVENT API */" + e.target.id, {
            method: "DELETE",
          })
          console.log("Delete Event API Request Sent");
        } catch (error) {
          console.log(error);
          console.log("Delete Event API Failed");
          return;
        }
    
        let eventsList = [];
        for (var i = 0; i < props.events.length; i++){
          if (props.events[i].eventID !== e.target.id){
            eventsList.push(props.events[i]);
          }
        }
        props.setEvents(eventsList);
    
        let displayList = [];
        for (var k = 0; k < props.display.length; k++){
          if (props.display[k].eventID !== e.target.id){
            displayList.push(props.display[k]);
          }
        }
        props.setDisplay(displayList);
    
        props.updateAccount({
          user_id: props.account.user_id,
          banner_picture: props.account.banner_picture,
          bio: props.account.bio,
          email: props.account.email,
          friends_list: props.account.friends_list,
          groups_joined: props.account.groups_joined,
          interests: props.account.interests,
          profile_picture: props.account.profile_picture,
          username: props.account.username,
          timestamp: props.account.timestamp,
          posts_made: props.account.posts_made,
          events: eventsList,
          blocked: props.account.blocked
        })
    }

    const leaveEvent = async(e) => {
        let response = "";
    
        try {
          response = await fetch ('/* LEAVE EVENT API */', {
            method: 'PATCH',
            body: JSON.stringify({
              "eventID": e.target.id,
              "userID": props.account.user_id
            }),
          })
          if (response.status === 400) {
            props.setHost(true);
          } else {
            let eventsList = [];
            for (var i = 0; i < props.events.length; i++){
              if (props.events[i].eventID !== e.target.id){
                eventsList.push(props.events[i]);
              }
            }
            props.setEvents(eventsList);
    
            let displayList = [];
            for (var k = 0; k < props.display.length; k++){
              if (props.display[k].eventID !== e.target.id){
                displayList.push(props.display[k]);
              }
            }
            props.setDisplay(displayList);
    
            props.updateAccount({
              user_id: props.account.user_id,
              banner_picture: props.account.banner_picture,
              bio: props.account.bio,
              email: props.account.email,
              friends_list: props.account.friends_list,
              groups_joined: props.account.groups_joined,
              interests: props.account.interests,
              profile_picture: props.account.profile_picture,
              username: props.account.username,
              timestamp: props.account.timestamp,
              posts_made: props.account.posts_made,
              events: eventsList,
              blocked: props.account.blocked
            })
          }
        } catch (error) {
          console.log("LeaveEvent API Request Failed");
          console.log(error);
          return;
        }
        console.log("LeaveEvent API Request Sent");
    }

    useEffect(() => {
      props.setEvents(props.account.events);
      let list = [];
      if (props.events.length > 0) {
        for (let i = 0; i < 2; i++){
          if (props.events[i] !== undefined){
            list.push(props.events[i]);
          }
        }
      }
      if (props.selectedDay === "") {
        props.setDisplay(list);
      } else {
        props.todaysEvents();
      }
    }, [props.events, props.account.events, props.selectedDay]);

    return ( 
    <div className={style.upcomingEvents}>
                <h3>Upcoming Events</h3>
                {props.display.map((idxVal) => {
                    let date = idxVal.dateTime.substring(0, 10);
                    let time = idxVal.dateTime.substring(11, 16);
                      if (idxVal.hostName === props.account.username) {
                        return <div className={style.event} key={Math.random()}><b>{idxVal.eventName}</b><br></br><b>Hosted by: </b>{idxVal.groupName}<br></br><b>Date: </b>{date}<br></br><b>Time:</b> {time}<br></br><b>Description:</b> {idxVal.description}<br></br><button className={style.delete} id={idxVal.eventID} onClick={deleteEvent}>Delete</button></div>
                      } else {
                        return <div className={style.event} key={Math.random()}><b>{idxVal.eventName}</b><br></br><b>Hosted by: </b>{idxVal.groupName}<br></br><b>Date: </b>{date}<br></br><b>Time:</b> {time}<br></br><b>Description:</b> {idxVal.description}<br></br><button className={style.leave} id={idxVal.eventID} onClick={leaveEvent}>Leave</button></div>
                      }
                  return null;
                })}
                {props.events.length > 2 ?
                  <div>
                    <button className={style.arrow} onClick={back}>{"<<"}</button>
                    <button className={style.arrow} onClick={forward}>{">>"}</button>
                  </div>
                :React.Fragment}

        </div>
    );
}

export default UpcomingEvents;