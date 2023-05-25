import React from 'react';
import style from "./calendar.module.css";

const EventCreation = (props) => {

    const handleName = (e) => {
        let input = props.event.name;
        input = e.target.value;
    
            let newEvent = {
              name: input,
              group: props.group,
              eventDate: props.event.eventDate,
              eventTime: props.event.eventTime,
              dateTime: "",
              description: ""
            }
        
            props.setEvent(newEvent);
      }
    
      const handleDate = (e) => {
        let input = props.event.eventDate;
        input = e.target.value;
    
            let newEvent = {
              name: props.event.name,
              group: props.group,
              eventDate: input,
              eventTime: props.event.eventTime,
              dateTime: "",
              description: props.event.description
            }
        
            props.setEvent(newEvent);
      }
    
      const handleTime = (e) => {
        let input = props.event.eventTime;
        input = e.target.value;
    
            let newEvent = {
              name: props.event.name,
              group: props.group,
              eventDate: props.event.eventDate,
              eventTime: input,
              dateTime: "",
              description: props.event.description
            }
        
            props.setEvent(newEvent);
      }
    
      const handleDesc = (e) => {
        let input = props.event.description;
        input = e.target.value;
    
        let newEvent = {
          name: props.event.name,
          group: props.group,
          eventDate: props.event.eventDate,
          eventTime: props.event.eventTime,
          dateTime: "",
          description: input
        }
        
        props.setEvent(newEvent);
    }

    
    const handleGroup = () => {
        props.setGroup(document.getElementById("search").value);
    }

    const createEvent = (e) => {
        let year = props.event.eventDate.substring(6,10);
        if (props.event.name !== "" && props.event.eventDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/) && props.event.eventTime.match(/^\d{1,2}:\d{1,2}$/) && props.today.getFullYear() <= year){
          if (props.events.length > 0) {
            var findItem = props.events.find((x) => x.name === props.event.name);
            if (!findItem){
              props.makeEvent();
            } else {
              props.setDuplicate(true);
            }
          } else {
            props.makeEvent();
          }
        } else {
          props.setError(true);
        }
    }

    return (
        <div className={style.eventForm}>
            <b>What is the name of your event?</b>
            <textarea name='text' value={`${props.event.name}`} onChange={handleName} maxLength='20'></textarea>
            <b>Day:</b>
            <textarea name='text' value={`${props.event.eventDate}`} placeholder="MM/DD/YYYY" onChange={handleDate} maxLength='10' ></textarea>
            <b>Time:</b>
            <textarea name='text' value={`${props.event.eventTime}`} placeholder="00:00" onChange={handleTime} maxLength='5'></textarea>
            <b>Tell us about your event!</b>
            <textarea name='text' value={`${props.event.description}`} onChange={handleDesc} maxLength='50'></textarea>
            <b>What group is this for?</b>
            <select className={style.search} id="search" onChange={handleGroup}>
              <option></option>
              {props.groups.map(item => {
                return <option value={item.value} key={Math.random()}>{item.group_name}</option>;
              })}
            </select><br></br>
            <button className={style.submitButton} onClick={props.makeEvent}>Create Event</button><br></br><br></br><br></br>
            {props.error ?
            <div id={style.error}>
              Please check your input values and try again
            </div>
            : React.Fragment}
            {props.duplicate ?
            <div id={style.duplicate}>
              An event by this name already exists
            </div>
            : React.Fragment}
        </div>
    );
}

export default EventCreation;
