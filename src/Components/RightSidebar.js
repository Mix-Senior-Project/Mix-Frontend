import React, {useState, useEffect} from "react";
import Calendar from "./Utilities/Calendar/Calendar.js"
import style from "./RightSidebar.module.css";


const RightSidebar = (props) => {
    //Window Width State
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    //Update state if width changes
    const detectSize = () => {
        setWindowWidth( window.innerWidth);
    }

    //Monitors browser width for collapsing sidebars
    useEffect(() => {
        window.addEventListener('resize', detectSize)

        return () => {
        window.removeEventListener('resize', detectSize)
        }
    }, [windowWidth]);

    return (
        <div>
            { (props.windowWidth > 1080) ?
            <div id={style.right}>
                <div id={style.topTrend}>
                    <h3>Trend 1 Name</h3>
                    <p>Description</p>
                </div>
                <div className={style.trend}>
                    <h3>Trend 2 Name</h3>
                    <p>Description</p>
                </div>
                <div className={style.trend}>
                    <h3>Trend 3 Name</h3>
                    <p>Description</p>
                </div>
            </div> : React.Fragment
            }
            <Calendar account={props.account} updateAccount={props.updateAccount} groups={props.account.groups_joined}/>
        </div>
    );
}

export default RightSidebar;