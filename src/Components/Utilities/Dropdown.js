
import standardStyle from "./MixStandardizedStyle.module.css";
import React, { useState } from "react";

const InputBox = (props) => {
    //States
    const [selectedItem, setSelectedItem] = useState(null);

    //When the user selects a new option from the dropdown
    const dropdownSelect = (member) => {
        setSelectedItem(member.target.value);
    }

    //When the user clicks the submit button
    const userConfirmSelection = () => {
        if (selectedItem === null) return;
        props.confirmedSelection(selectedItem);
    }

    return (
        <div className={standardStyle.inputBlock}>
            <div className={standardStyle.inputHeaderBlock}>
                <p className={standardStyle.inputHeaderText}>{props.headerText}</p>
            </div>
            <br></br>
            <select name="list" className={standardStyle.dropdown} onChange={dropdownSelect}>
                { props.dropdownSubtitle !== null ?
                    <option value="">{props.dropdownSubtitle}</option> : React.Fragment
                }
                { props.list.map((item) => {
                return <option value={item.key} key={Math.random()}>{item.name}</option>; 
                })}
            </select>
            <button className={standardStyle.dropdownSubmit} onClick={userConfirmSelection}>{props.submitButtonText}</button>
        </div>
    );
}

export default InputBox;