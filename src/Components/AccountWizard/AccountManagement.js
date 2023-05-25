import style from "./AccountManagement.module.css";
import React, {useState} from "react";
import CreateAccount from "./CreateAccount";
import LoginAccount from "./LoginAccount";
import InterestSelectionStep from "./InterestSelectionStep";
import FindGroup from "./FindGroup";
import Verification from "./Verification";

const AccountManagement = (props) => {
  //Account Management states
  const [currentWizardPage, setCurrentWizardPage] = useState("default");
  const [formErrorDisplay, setFormErrorDisplay] = useState(false);
  const [formErrorText, setFormErrorText] = useState("Incorrect Login Credentials");
  const [subtype, setSubtype] = useState("createAccount");

  //Account metadata
  const [verified, setVerified] = useState(false);
  const [accountInfo, setAccountInfo] = useState({
    user_id: "null",
    banner_picture: "null",
    bio: "null",
    email: "null",
    friends_list: "null",
    groups_joined: [],
    interests: [],
    profile_picture: "null",
    username: "null",
    posts_made: [],
    events: []
  });

  //Updates Account Wizard Page
  const updateWizardPage = (key, subtype) => {
    if (key !== "createAccountStepTwo") {
      setCurrentWizardPage(key);  
    } else {
      setSubtype(subtype);
      setCurrentWizardPage(key);
    }
    
  }

  //Updates account verification status locally
  const setVerificationStatus = (status) => {
    setVerified(status);
  }

  //Login button event listener
  const renderLoginElements = e => {
    setCurrentWizardPage("login");
  }

  //Account creation button event listener
  const renderAccountCreationElements = e => {
    setCurrentWizardPage("createAccountStepOne");
  }

  //Update account info
  const setLogin = (accountMetadata) => {
    props.closeWindow();
    console.log(accountMetadata)
    props.setAccount(accountMetadata);
    props.updatePage("default", "null");
  }

  //Updates account metadata
  const updateAccountInfo = (metadata) => {
    setAccountInfo(metadata);
  }

  //Toggle error banner
  const toggleErrorBanner = (state, text) => {
    setFormErrorDisplay(state);
    setFormErrorText(text);
  }

  //Minimize error banner
  const minimizeErrorBanner = () => {
    setFormErrorDisplay(false);
  }

  return (
    <div id={style.body} className={style.expandedBody}>
        <br></br>
        {formErrorDisplay ?
            <div id={style.errorBanner}>
                <div id={style.errorBannerText}>
                    <h2>{formErrorText}</h2>
                </div>
                  <button className={style.minimizeErrorBannerButton} onClick={minimizeErrorBanner}><b>Minimize</b></button>
            </div>
        : React.Fragment }

        {/** Handles rendering of login & account creation buttons & elements*/}
        {(() => {
          if (currentWizardPage === "default") {
            return <div>
              <div id={style.headerGrouping}>
                <div id={style.header}>
                    <h2>Login & Create Account</h2>
                </div>
                <button className={style.closeWindow} onClick={props.closeWindow}>Close Window</button>
              </div>
              <br></br>
              <button className={style.button} onClick={renderLoginElements} data-testid="loginButton"><b>Login to Account</b></button>
              <br></br>
              <button className={style.button} onClick={renderAccountCreationElements} data-testid="createAccountButton"><b>Create Account</b></button>
            </div>;
          } else if (currentWizardPage === "login") {
            return <LoginAccount  setAccount={setLogin} updateAccountInfo={updateAccountInfo} updateWizardPage={updateWizardPage} updatePage={props.updatePage} toggleErrorBanner={toggleErrorBanner} key={Math.random()}/>;
          } else if (currentWizardPage === "createAccountStepOne") {
            return <CreateAccount  updateAccount={updateAccountInfo} account={props.account} toggleErrorBanner={toggleErrorBanner} updateWizardPage={updateWizardPage}  key={Math.random()}/>;
          } else if (currentWizardPage === "createAccountStepTwo") {
            return <Verification setVerified={setVerificationStatus} setLogin={setLogin} subtype={subtype} verified={verified} account={accountInfo} updateWizardPage={updateWizardPage} key={Math.random()}/>
          } else if (currentWizardPage === "createAccountStepThree") {
            return <InterestSelectionStep  account={accountInfo} updateAccountInfo={updateAccountInfo} toggleErrorBanner={toggleErrorBanner} updateWizardPage={updateWizardPage} key={Math.random()}/>;
          } else if (currentWizardPage === "createAccountStepFour") {
            return <FindGroup account={accountInfo} setLogin={setLogin} updateWizardPage={updateWizardPage} key={Math.random()}/>;
          } 
        })()}
    </div>
  );
}

export default AccountManagement;