import style from "./EventDisplay.module.css";
import React, { useEffect, useCallback, useState } from "react";
import Animation from './Animation';

const EventDisplay = (props) => {

    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState("null");
    const [totalAttendees, setTotalAttendees] = useState(0);

    const fetchData = useCallback(async () => {
        //Get event info
        let eventObj = "";
        try {
        await fetch(("/* GET EVENT API */" + props.event_id))
            .then(response => response.json())
            .then(json => eventObj = json)
        } catch (error) {
        console.log("API Failure for GetEvent!");
        props.updatePage("group-profile", props.group_id);
        return;
        }

        setTotalAttendees(eventObj.attendees.length);

        setEvent(eventObj);
        setLoading(false);
    }, []);
    
    //Initializes component metadata
    useEffect(() => {
        fetchData();
    }, [fetchData])

    //Bring the user back to the regular post feed for the group profile
    const navigateHome = () => {
        props.updatePage("group-profile", props.group_id);
    }
      
    return (
        <div>
            { loading ?
                <Animation />
                :
                <div id={style.body}>
                    <button className={style.navigationBtn} onClick={navigateHome}>View Group Posts</button>
                    <br></br><br></br> <br></br>
                    <h1 id={style.eventHeader}>{event.eventName}</h1>
                    <div id={style.eventDetails}>
                        <p><b id={style.eventLabel}>Event Time:</b> {event.dateTime}</p>
                        <p><b id={style.eventLabel}>Hosted By:</b> {event.hostName} from {event.groupName}</p>
                        <p><b id={style.eventLabel}>Event Description:</b> {event.description}</p>
                        <p><b id={style.eventLabel}>Total Attendees:</b> {totalAttendees} {(totalAttendees === 1) ? "Person" : "People"}</p>
                    </div>
                    
                </div>
            }
        </div>
    );
}

export default EventDisplay;