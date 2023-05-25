import React, {useState, useEffect} from 'react';
import CalendarDays from './calendar-days';
import style from "./calendar.module.css";
import UpcomingEvents from './UpcomingEvents';
import EventCreation from './EventCreation';

const Calendar = (props) => {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

  const [date, setDate] = useState(new Date());
  const [form, setForm] = useState(false);
  const [event, setEvent] = useState({
    name: "",
    group: "",
    eventDate: "",
    eventTime: "",
    dateTime: "",
    description: ""
  });
  const [events, setEvents] = useState([]);
  const [display, setDisplay] = useState([]);
  const [error, setError] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [group, setGroup] = useState("");
  const [host, setHost] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(true);

  const today = new Date();

  const eventForm = (e) => {
    setForm(!form);
  }

  const makeEvent = async () => {
    let newEvent = {
      name: event.name,
      group: group,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      dateTime: "",
      description: event.description
    }
    setEvent(newEvent);

    let month = event.eventDate.substring(0,2);
    let day = event.eventDate.substring(3,5);
    let year = event.eventDate.substring(6,10);

    let formattedDate = "" + year + "-"+ month + "-" + day;
    let dateTime = formattedDate + " " + event.eventTime + ":00";

    let selectedGroup;
    for (var i = 0; i < props.groups.length; i++){
      if (group === props.groups[i].group_name) {
        selectedGroup = props.groups[i];
      }
    }

    let response = "";
    let responseObj = "";
    try {
      response = await fetch("/* MAKE EVENT API */", {
        method: "POST",
        body: JSON.stringify({
          "eventName": event.name,
          "hostName": props.account.username,
          "hostID": props.account.user_id,
          "groupName": selectedGroup.group_name,
          "groupID": selectedGroup.group_id,
          "description": event.description,
          "dateTime": dateTime
        }),
      })
      if (response.status === 403) {
        setDuplicate(true);
      }
      responseObj = await response.json();
      console.log("MakeEvent API Request Sent");

      let newEvent = {
        attendees: responseObj.attendees,
        eventID: responseObj.eventID,
        eventName: responseObj.eventName,
        hostName: responseObj.hostName,
        hostID: responseObj.hostID,
        groupName: responseObj.groupName,
        groupID: responseObj.groupID,
        dateTime: responseObj.dateTime,
        description: responseObj.description
      }
      setEvent(newEvent);
  
      let list = events;
      list.push(newEvent);
      setEvents(list);

      setForm(false);
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
        posts_made: props.account.posts_made,
        events: events,
        blocked: props.account.blocked
      })

      if(display.length < 2){
        display.push(events[events.length - 1]);
      }

    } catch (error) {
      console.log("MakeEvent API Failed");
      return;
    }

        let clearEvent ={
          name: "",
          group: "",
          eventDate: "",
          eventTime: "",
          dateTime: "",
          description: ""
        }
        setEvent(clearEvent);
  }

  useEffect(() => {
    setEvents(props.account.events);
    let list = [];
    if (events.length > 0) {
      for (let i = 0; i < 2; i++){
        if (events[i] !== undefined){
          list.push(events[i]);
        }
      }
    }
    if (selectedDay === "") {
      setDisplay(list);
    } else {
      todaysEvents();
    }
    setShowUpcoming(true);
  }, [events, props.account.events, selectedDay]);

  const nextMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() + 1);
    setDate(newDate);
  }

  const prevMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() - 1);
    setDate(newDate);
  }

  const todaysEvents = (e) => {
    let list = [];
    let month;
    let day;
    let year = selectedDay.year;

    if (selectedDay.month < 10) {
      let mo = selectedDay.month + 1;
      month = "0" + mo;
    } else {
      month = selectedDay.month + 1;
    }

    if (selectedDay.number < 10) {
      let da = selectedDay.number;
      day = "0" + da;
    } else {
      day = selectedDay.number;
    }   
    let selectedDate = "" + year + "-" + month + "-" + day;
    for (let i = 0; i < events.length; i++){
      let eventDate = events[i].dateTime.substring(0,10);
      if (eventDate === selectedDate){
        list.push(events[i]);
      }
    }
    if (list.length > 0) {
      setDisplay(list);
    } else {
      setDisplay([]);
    }
  }

  const showAll = () => {
    let list = [];
    if (events.length > 0) {
      for (let i = 0; i < 2; i++){
        if (events[i] !== undefined){
          list.push(events[i]);
        }
      }
    }
    setDisplay(list);
    setShowUpcoming(!showUpcoming);
  }

  const toggleHost = () => {
    setHost(false);
  }

  const hideAll = () => {
    setDisplay([]);
    setShowUpcoming(!showUpcoming);
  }

  return (
    <div className={style.calendar}>
        <div className={style.calendarHeader}>
          <div className={style.title}>
            <h2>{months[date.getMonth()]} {date.getFullYear()}</h2>
          </div>
          <div className={style.tools}>
            <button onClick={prevMonth}>{"<<"}</button>
            <p className={style.monthTool}>{months[date.getMonth()]}</p>
            <button onClick={nextMonth}>{">>"}</button>
          </div>
        </div>
        <div className={style.calendarBody}>
          <div className={style.tableHeader}>
            {
              weekdays.map((weekday) => {
                return <div className={style.weekday} key={Math.random()}><p>{weekday}</p></div>
              })
            }
          </div>
          <CalendarDays day={date} today={today} key={Math.random()} todaysEvents={todaysEvents} setSelectedDay={setSelectedDay} selectedDay={selectedDay}/>
        </div>
        Click on a day to see events on that day
        {showUpcoming ?
          <div>
            Click here to hide your events
            <button className={style.submitButton} onClick={hideAll}>Hide All Events</button>
          </div>
          :<div>
            Click here to show your events!
            <button className={style.submitButton} onClick={showAll}>Show All Events</button>
          </div>
        }
        <button className={style.submitButton} onClick={eventForm}>New Event</button>
        {form ?
          <EventCreation event={event} setEvent={setEvent} group={group} groups={props.groups} setGroup={setGroup} makeEvent={makeEvent} error={error} setError={setError} duplicate={duplicate} setDuplicate={setDuplicate} today={today}/>
        :React.Fragment}
        {host ?
        <div id={style.host}>
          The host cannot leave the event.&nbsp;&nbsp;&nbsp;&nbsp;<button id={style.ok} onClick={toggleHost}>Ok</button>
        </div>
        :React.Fragment}
        <UpcomingEvents display={display} setDisplay={setDisplay} events={events} setEvents={setEvents}setHost={setHost} account={props.account} updateAccount={props.updateAccount} selectedDay={selectedDay} todaysEvents={todaysEvents}/>
      </div>
  );
}

export default Calendar;