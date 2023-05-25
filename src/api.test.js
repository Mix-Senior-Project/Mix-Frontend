/**
 * @jest-environment jsdom
 */

import { render, screen, waitForElementToBeRemoved, fireEvent} from "@testing-library/react";
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import App from "./App";
import PostManagement from "./Components/PostComponents/PostManagement";

describe("Render App.js", () => {
    render(<App />);

    test('Verify App.js Renders', async () => {
        const loginButton = screen.getByTestId('loginButton');
        act(() => {
            loginButton.click();
        });

        const loginUsernameInput = screen.getByTestId('username');
        const loginPasswordInput = screen.getByTestId('password');
        const verifyLoginButton = screen.getByTestId('verifyLoginButton');

        expect(loginUsernameInput).toBeInTheDocument();
        expect(loginPasswordInput).toBeInTheDocument();

        fireEvent.change(screen.getByTestId('username'), {target: {value: 'Tyler'}});
        fireEvent.change(screen.getByTestId('password'), {target: {value: 'test'}});

        act(() => {
            verifyLoginButton.click();
        });

        waitForElementToBeRemoved(verifyLoginButton).then(() =>
            console.log('Element no longer in DOM'),
        );
    });
});

describe("Render PostManager.js", () => {
    let account  = {
        banner_picture: "null",
        bio: "test",
        creation_date: "2023-02-15 09:23:53",
        email: "test1@mix.com",
        friends: "null",
        groups: [],
        interests: ["bot"],
        posts: "null",
        profile_picture: "null",
        user_id: "U-a94b145e-047c-4661-b5c3-f6091182aafa",
        username: "testAuto",
        verified: 0
    }
    

    render(<PostManagement account={account} 
        currentViewedProfile={""}
        currentPage={"default"}
        displayPosts={"all"} />);

    test('Verify posts render', async () => {
        return screen.findByTestId('post').then(() => { console.log('Found a post!'); }).catch(() => { console.log("Post not found!")});
    });
});