import React, {useState, useEffect} from "react";
import style from'./Header.module.css';
import SearchBar from './SearchBar';
import logo from './Static-Images/MIX.png';

const Header = (props) => {
    //Navigate to default page
    const homePage = () => {
        props.updatePage("default", "null");
    }

    //Navigate to DMs page
    const openDirectMessages = () => {
        props.updatePage("direct-messages", "null");
    }

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
        <div id={style.headerDiv}>
            <button onClick={homePage} id={style.logo} data-testid="home"><img src={logo} id={style.logoSize} alt="Logo"></img></button>
            <div id={style.searchArea}>
                <SearchBar account={props.account} updatePage={props.updatePage} showEventDisplay={props.showEventDisplay}/>
            </div>
            { (windowWidth > 1080) ?
                (props.account.user_id !== "null") ?
                    <button className={style.DM} onClick={openDirectMessages}>Private Messages</button> : React.Fragment
                : React.Fragment
            }
        </div>
    );
}

export default Header;