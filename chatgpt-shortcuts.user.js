// ==UserScript==
// @name         ChatGPT Extended Shortcuts
// @namespace    https://github.com/wallandteen/chatgpt-shortcuts
// @version      0.1.0
// @description  Enhance your ChatGPT experience by providing convenient keyboard shortcuts.
// @author       Valentin Chizhov
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    /**
     * Platform-agnostic modifier detection.
     *   – macOS   → ⌘ + ⇧ + J
     *   – others  → Ctrl + ⇧ + J
     */
    const isMac = /Mac|iP[oa]d|iPhone/i.test(navigator.platform);
    const SHORTCUT_CODE = "KeyJ";

    /**
     * Check whether the current keyboard event matches our shortcut.
     */
    function isShortcut(event) {
        return (
            event.code === SHORTCUT_CODE &&
            event.shiftKey &&
            (isMac ? event.metaKey : event.ctrlKey)
        );
    }

    function isEmptyTemporaryChat() {
        return window.location.search.includes('temporary-chat=true') && document.querySelector('article') == null;
    }

    function preventBrowserDefault(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    /**
     * Unified shortcut handler for both keydown & keyup to fully cancel browser defaults.
     */
    function handleShortcut(e, runAction = false) {
        if (!isShortcut(e)) return;

        preventBrowserDefault(e); // Stop Chrome default (downloads / dev-tools) completely.

        if (!runAction) return; // keyup just cancels default, nothing more.

        if (isEmptyTemporaryChat()) return;
        
        switchToTemporaryChat();
    }

    function findAndClickButton() {
        const header = document.querySelector('#page-header');
        if (header) {
            const firstLevelDivs = Array.from(header.children).filter(child => child.tagName === 'DIV');
            const thirdDiv = firstLevelDivs[2];
            if (thirdDiv) {
                const span = thirdDiv.querySelector('span');
                if (span) {
                    const button = span.querySelector('button');
                    if (button) {
                        button.click();
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function switchToTemporaryChat() {
        if (findAndClickButton()) return;

        // Simulate Command/Ctrl + Shift + O
        const event = new KeyboardEvent('keydown', {
            key: 'o',
            code: 'KeyO',
            keyCode: 79,
            charCode: 79,
            shiftKey: true,
            ctrlKey: !isMac,
            metaKey: isMac,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);

        // Continuously try to find and click the button until timeout
        const interval = setInterval(() => {
            if (findAndClickButton()) {
                clearInterval(interval);
                clearTimeout(timeout);
                return;
            }
        }, 100);

        const timeout = setTimeout(() => {
            clearInterval(interval);
            // Fallback to URL navigation if button is not found
            window.location.href = '/?temporary-chat=true';
        }, 1000);
    }

    document.addEventListener("keydown", (e) => handleShortcut(e, true), true);
    document.addEventListener("keyup", (e) => handleShortcut(e, false), true);
})(); 