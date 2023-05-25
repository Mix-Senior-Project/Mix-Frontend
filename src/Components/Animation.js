import style from "./Animation.module.css";
import logo from "./Static-Images/MIX.png";
import React from "react";

const Animation = (props) => {

  return (
    <div id={style.body}>
        <div id={style.dot}><img id={style.logo} src={logo} alt=""></img></div>
    </div>
  );
}

export default Animation;
