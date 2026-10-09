import React, { useState } from "react";
import "./CodeSpiritAI.css";

const API_BASE_URL = `${(import.meta.env.VITE_API_URL || "").replace(/\/$/, "")}/api`;

function CodeSpiritAI() {

    // ========================================
    // GET LOGGED-IN USER
    // ========================================

    const getLoggedInUser = () => {

        const storedUser =
            localStorage.getItem("user");

        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser);
        } catch (error) {

            console.error(
                "Invalid user data in localStorage:",
                error
            );

            return null;
        }
    };


    // ========================================
    // INITIAL GREETING
    // ========================================

    const currentUser = getLoggedInUser();

    const initialGreeting =
        currentUser?.role === "ADMIN"
            ? "Hi! 👋 I'm CodeSpirit AI. I can help you with CodeSprint platform statistics, users, problems, submissions, contests, and certifications."
            : "Hi! 👋 I'm CodeSpirit AI. I can help you with coding, programming concepts, errors, problems, and your CodeSprint progress.";


    // ========================================
    // STATE
    // ========================================

    const [isOpen, setIsOpen] = useState(false);

    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState([
        {
            role: "ai",
            content: initialGreeting
        }
    ]);

    const [loading, setLoading] = useState(false);


    // ========================================
    // SEND MESSAGE
    // ========================================

    const sendMessage = async () => {

        const trimmedMessage =
            message.trim();

        if (!trimmedMessage || loading) {
            return;
        }


        // ========================================
        // USER MESSAGE
        // ========================================

        const userMessage = {
            role: "user",
            content: trimmedMessage
        };

        setMessages((previous) => [
            ...previous,
            userMessage
        ]);

        setMessage("");
        setLoading(true);


        try {

            // ========================================
            // GET LOGGED-IN USER
            // ========================================

            const user =
                getLoggedInUser();

            const userId =
                user?.id || null;

            const userRole =
                user?.role || null;


            console.log(
                "CodeSpirit logged-in user:",
                user
            );

            console.log(
                "CodeSpirit user role:",
                userRole
            );

            console.log(
                "CodeSpirit user ID:",
                userId
            );


            // ========================================
            // DETERMINE ADMIN / USER
            // ========================================

            const isAdmin =
                userRole === "ADMIN";


            // ========================================
            // SELECT BACKEND ENDPOINT
            // ========================================

            const aiEndpoint =
                isAdmin
                    ? `${API_BASE_URL}/admin/ai/chat`
                    : `${API_BASE_URL}/ai/chat`;


            console.log(
                "CodeSpirit endpoint:",
                aiEndpoint
            );


            // ========================================
            // REQUEST BODY
            // ========================================

            const requestBody =
                isAdmin
                    ? {
                        message: trimmedMessage
                    }
                    : {
                        message: trimmedMessage,
                        userId: userId
                    };


            console.log(
                "CodeSpirit request:",
                requestBody
            );


            // ========================================
            // SEND MESSAGE TO BACKEND
            // ========================================

            const response =
                await fetch(
                    aiEndpoint,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                requestBody
                            )
                    }
                );


            // ========================================
            // READ RESPONSE
            // ========================================

            const data =
                await response.json();


            console.log(
                "CodeSpirit response:",
                data
            );


            // ========================================
            // HANDLE ERROR
            // ========================================

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.response ||
                    "Failed to get response from CodeSpirit AI."
                );
            }


            // ========================================
            // ADD AI RESPONSE
            // ========================================

            setMessages((previous) => [
                ...previous,

                {
                    role: "ai",

                    content:
                        data.response ||
                        "I couldn't generate a response."
                }
            ]);

        } catch (error) {

            console.error(
                "CodeSpirit AI error:",
                error
            );


            setMessages((previous) => [
                ...previous,

                {
                    role: "ai",

                    content:
                        "Sorry, I couldn't connect to CodeSpirit AI right now. Please try again."
                }
            ]);

        } finally {

            setLoading(false);
        }
    };


    // ========================================
    // ENTER KEY
    // ========================================

    const handleKeyDown = (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    };


    // ========================================
    // CLEAR CHAT
    // ========================================

    const clearChat = () => {

        const user =
            getLoggedInUser();

        const greeting =
            user?.role === "ADMIN"
                ? "New conversation started. 👋 How can I help you with your CodeSprint platform?"
                : "New conversation started. 👋 How can I help you?";


        setMessages([
            {
                role: "ai",
                content: greeting
            }
        ]);
    };


    // ========================================
    // UI
    // ========================================

    return (
        <>

            {/* ========================================
                FLOATING BUTTON
            ======================================== */}

            {!isOpen && (

                <button
                    className="codespirit-floating-button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open CodeSpirit AI"
                >

                    <span className="codespirit-bot-icon">
                        🤖
                    </span>

                    <span className="codespirit-floating-text">
                        CodeSpirit AI
                    </span>

                </button>

            )}


            {/* ========================================
                CHAT WINDOW
            ======================================== */}

            {isOpen && (

                <div className="codespirit-chat-window">


                    {/* ========================================
                        HEADER
                    ======================================== */}

                    <div className="codespirit-header">

                        <div className="codespirit-header-info">

                            <div className="codespirit-avatar">
                                🤖
                            </div>


                            <div>

                                <div className="codespirit-title">
                                    CodeSpirit AI
                                </div>


                                <div className="codespirit-status">

                                    <span className="codespirit-status-dot">
                                        ●
                                    </span>

                                    Online

                                </div>

                            </div>

                        </div>


                        <div className="codespirit-header-actions">

                            {/* NEW CHAT */}

                            <button
                                className="codespirit-header-button"
                                onClick={clearChat}
                                title="New conversation"
                            >
                                ↻
                            </button>


                            {/* CLOSE */}

                            <button
                                className="codespirit-header-button"
                                onClick={() =>
                                    setIsOpen(false)
                                }
                                title="Close"
                            >
                                ×
                            </button>

                        </div>

                    </div>


                    {/* ========================================
                        MESSAGES
                    ======================================== */}

                    <div className="codespirit-messages">

                        {messages.map(
                            (item, index) => (

                                <div
                                    key={index}
                                    className={`codespirit-message-row ${
                                        item.role === "user"
                                            ? "user-message-row"
                                            : "ai-message-row"
                                    }`}
                                >

                                    {/* AI AVATAR */}

                                    {item.role === "ai" && (

                                        <div className="codespirit-small-avatar">
                                            🤖
                                        </div>

                                    )}


                                    {/* MESSAGE */}

                                    <div
                                        className={`codespirit-message ${
                                            item.role === "user"
                                                ? "user-message"
                                                : "ai-message"
                                        }`}
                                    >
                                        {item.content}
                                    </div>

                                </div>

                            )
                        )}


                        {/* ========================================
                            TYPING INDICATOR
                        ======================================== */}

                        {loading && (

                            <div className="codespirit-message-row ai-message-row">

                                <div className="codespirit-small-avatar">
                                    🤖
                                </div>


                                <div className="codespirit-message ai-message codespirit-typing">

                                    <span></span>
                                    <span></span>
                                    <span></span>

                                </div>

                            </div>

                        )}

                    </div>


                    {/* ========================================
                        INPUT
                    ======================================== */}

                    <div className="codespirit-input-area">

                        <textarea
                            value={message}

                            onChange={(event) =>
                                setMessage(
                                    event.target.value
                                )
                            }

                            onKeyDown={handleKeyDown}

                            placeholder="Ask CodeSpirit AI..."

                            rows="1"

                            disabled={loading}
                        />


                        <button
                            onClick={sendMessage}

                            disabled={
                                loading ||
                                !message.trim()
                            }

                            className="codespirit-send-button"

                            aria-label="Send message"
                        >
                            ➤
                        </button>

                    </div>


                    {/* ========================================
                        FOOTER
                    ======================================== */}

                    <div className="codespirit-footer">
                        CodeSpirit AI can make mistakes. Verify important information.
                    </div>

                </div>

            )}

        </>
    );
}

export default CodeSpiritAI;