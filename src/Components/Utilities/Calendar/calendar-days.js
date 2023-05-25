import style from "./calendar.module.css";

const CalendarDays = (props) => {
    const firstDayOfMonth = new Date(props.day.getFullYear(), props.day.getMonth(), 1);
    const weekdayOfFirstDay = firstDayOfMonth.getDay();
    let currentDays = [];
  
    for (let day = 0; day < 42; day++) {
      if (day === 0 && weekdayOfFirstDay === 0) {
        firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 7);
      } else if (day === 0) {
        firstDayOfMonth.setDate(firstDayOfMonth.getDate() + (day - weekdayOfFirstDay));
      } else {
        firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
      }
  
      let calendarDay = {
        currentMonth: (firstDayOfMonth.getMonth() === props.day.getMonth()),
        date: (new Date(firstDayOfMonth)),
        month: firstDayOfMonth.getMonth(),
        number: firstDayOfMonth.getDate(),
        selected: (firstDayOfMonth.toDateString() === props.day.toDateString()),
        year: firstDayOfMonth.getFullYear()
      }
  
      currentDays.push(calendarDay);
    }

    return (
      <div className={style.tableContent}>
        {
          currentDays.map((day) => {
            if(day.number === props.today.getDate() && day.month === props.today.getMonth()){
              return (
                <div className={style.calendarDay}
                    key={Math.random()} onClick={event => {
                      props.todaysEvents();
                      props.setSelectedDay(day);}}>
                  <p className={style.today}><b>{day.number}</b></p>
                </div>
              )
            } else if(day.currentMonth){
              return (
                <div className={style.calendarDay}
                    key={Math.random()} onClick={event => {
                      props.todaysEvents();
                      props.setSelectedDay(day);}}>
                  <p className={style.current}>{day.number}</p>
                </div>
              )
            } else {
              return (
                <div className={style.calendarDay}
                    key={Math.random()} onClick={event => {
                      props.todaysEvents();
                      props.setSelectedDay(day);}}>
                  <p>{day.number}</p>
                </div>
              )
            }
          })
        }
      </div>
    );
  }
  
  export default CalendarDays;