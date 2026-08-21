import { useEffect, useRef, useState } from 'react';
import {
    Bot,
    ChevronRight,
    Copy,
    History,
    Languages,
    Mic,
    MicOff,
    Plus,
    Send,
    ShieldCheck,
    User
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

import { api } from '../api';
import { useData } from '../context/DataContext';

const prompts = [
    'Will my area face flooding this week?',
    'What emergency supplies should I keep?',
    'What should I do during a heatwave?',
    'Where is the nearest shelter?'
];

export default function Chat() {
    const { risks } = useData();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [lang, setLang] = useState('en');
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [sessionId, setSessionId] = useState(
        crypto.randomUUID()
    );
    const [listening, setListening] = useState(false);

    const bottom = useRef(null);

    // --------------------------------------------------
    // Load previous chat sessions
    // --------------------------------------------------
    useEffect(() => {
        const loadSessions = async () => {
            try {
                const response = await api.get('/chat/sessions');

                setSessions(response.data);
            } catch (error) {
                console.error(
                    'Failed to load chat sessions:',
                    error
                );
            }
        };

        loadSessions();
    }, []);

    // --------------------------------------------------
    // Scroll chat to bottom
    // IMPORTANT: Do not implicitly return scrollIntoView()
    // --------------------------------------------------
    useEffect(() => {
        if (bottom.current) {
            bottom.current.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }, [messages, loading]);

    // --------------------------------------------------
    // Send chat message
    // --------------------------------------------------
    async function send(text = input) {
        text = text.trim();

        if (!text || loading) {
            return;
        }

        const outgoing = [
            ...messages,
            {
                role: 'user',
                content: text,
                timestamp: new Date().toISOString()
            }
        ];

        // Immediately show user's message
        setMessages(outgoing);
        setInput('');
        setLoading(true);

        try {
            console.log('Sending chat request...');

            const { data } = await api.post('/chat', {
                messages: outgoing,
                lang,
                sessionId,
                contextData: {
                    risks,
                    weather: {
                        city: 'Lucknow'
                    }
                }
            });

            console.log('Chat API response:', data);

            // Update session ID
            setSessionId(data.sessionId);

            // Add AI response
            setMessages((currentMessages) => [
                ...currentMessages,
                {
                    role: 'assistant',
                    content: data.reply,
                    timestamp: new Date().toISOString()
                }
            ]);

            // Add session to history if it doesn't exist
            setSessions((currentSessions) =>
                currentSessions.some(
                    (session) =>
                        session.sessionId === data.sessionId
                )
                    ? currentSessions
                    : [
                          {
                              sessionId: data.sessionId,
                              title: text.slice(0, 45),
                              updatedAt: new Date()
                          },
                          ...currentSessions
                      ]
            );
        } catch (error) {
            console.error(
                'CHAT REQUEST FAILED:',
                error
            );

            console.error(
                'Status:',
                error.response?.status
            );

            console.error(
                'Response:',
                error.response?.data
            );

            toast.error(
                'ResQAI is unavailable. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    }

    // --------------------------------------------------
    // Voice input
    // --------------------------------------------------
    function voice() {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error(
                'Voice input is not supported in this browser.'
            );
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang =
            lang === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.interimResults = false;

        recognition.onstart = () => {
            setListening(true);
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognition.onerror = () => {
            setListening(false);

            toast.error(
                'Could not capture speech.'
            );
        };

        recognition.onresult = (event) => {
            setInput(
                event.results[0][0].transcript
            );
        };

        recognition.start();
    }

    // --------------------------------------------------
    // Start a new conversation
    // --------------------------------------------------
    function reset() {
        setMessages([]);
        setSessionId(crypto.randomUUID());
        setInput('');
    }

    return (
        <div className="mx-auto flex h-[calc(100vh-72px)] max-w-[1500px] overflow-hidden bg-white lg:my-5 lg:h-[calc(100vh-112px)] lg:rounded-2xl lg:border lg:shadow-card">

            {/* ------------------------------------------
                SIDEBAR
            ------------------------------------------ */}
            <aside className="hidden w-72 shrink-0 border-r bg-slate-50/80 p-4 md:flex md:flex-col">

                <button
                    onClick={reset}
                    className="btn-primary w-full"
                >
                    <Plus size={17} />
                    New conversation
                </button>

                <div className="mt-6 flex items-center gap-2 px-2">
                    <History size={14} />
                    <span className="eyebrow">
                        Recent
                    </span>
                </div>

                <div className="scrollbar mt-3 flex-1 space-y-1 overflow-y-auto">

                    {sessions.length ? (
                        sessions.map((session) => (
                            <button
                                key={session.sessionId}
                                className={`w-full rounded-xl px-3 py-3 text-left text-xs font-semibold transition ${
                                    session.sessionId ===
                                    sessionId
                                        ? 'bg-white text-ink shadow-sm'
                                        : 'text-slate-500 hover:bg-white'
                                }`}
                                onClick={() => {
                                    setSessionId(
                                        session.sessionId
                                    );

                                    toast(
                                        'Conversation history is stored; continue with a new message.'
                                    );
                                }}
                            >
                                {session.title}

                                <ChevronRight
                                    className="float-right"
                                    size={13}
                                />
                            </button>
                        ))
                    ) : (
                        <p className="px-3 text-xs leading-5 text-slate-400">
                            Your recent conversations will
                            appear here.
                        </p>
                    )}

                </div>

                <div className="rounded-xl bg-ink p-4 text-white">

                    <ShieldCheck
                        size={20}
                        className="text-teal-300"
                    />

                    <p className="mt-3 text-xs font-bold">
                        Emergency?
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-slate-400">
                        Call 112. AI guidance does not replace
                        emergency services.
                    </p>

                </div>
            </aside>

            {/* ------------------------------------------
                MAIN CHAT
            ------------------------------------------ */}
            <section className="flex min-w-0 flex-1 flex-col">

                {/* HEADER */}
                <header className="flex h-16 shrink-0 items-center border-b px-4 sm:px-6">

                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
                        <Bot size={19} />
                    </span>

                    <div className="ml-3">

                        <b className="block text-sm text-ink">
                            ResQAI Assistant
                        </b>

                        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">

                            <i className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            Ready to help

                        </span>

                    </div>

                    <button
                        onClick={() =>
                            setLang((currentLang) =>
                                currentLang === 'en'
                                    ? 'hi'
                                    : 'en'
                            )
                        }
                        className="btn-ghost ml-auto !py-2"
                    >
                        <Languages size={15} />

                        {lang === 'en'
                            ? 'English'
                            : 'हिन्दी'}
                    </button>

                </header>

                {/* --------------------------------------
                    MESSAGES
                -------------------------------------- */}
                <div className="scrollbar flex-1 overflow-y-auto px-4 py-6 sm:px-8">

                    {!messages.length ? (

                        /* EMPTY CHAT */
                        <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">

                            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-ink text-white shadow-xl">
                                <Bot size={30} />
                            </span>

                            <p className="eyebrow mt-6">
                                Disaster preparedness assistant
                            </p>

                            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">
                                What can I help you prepare for?
                            </h1>

                            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
                                Get clear, local and actionable
                                guidance based on current
                                conditions. In an emergency,
                                always contact official services
                                first.
                            </p>

                            <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">

                                {prompts.map((prompt) => (
                                    <button
                                        onClick={() =>
                                            send(prompt)
                                        }
                                        key={prompt}
                                        className="group rounded-xl border bg-white p-4 text-left text-xs font-semibold text-slate-600 transition hover:border-teal-400 hover:shadow-md"
                                    >
                                        {prompt}

                                        <ChevronRight
                                            className="float-right text-slate-300 group-hover:text-teal-600"
                                            size={15}
                                        />
                                    </button>
                                ))}

                            </div>

                        </div>

                    ) : (

                        /* MESSAGE LIST */
                        <div className="mx-auto max-w-3xl space-y-6">

                            {messages.map((message, index) => (

                                <div
                                    key={index}
                                    className={`flex gap-3 ${
                                        message.role === 'user'
                                            ? 'justify-end'
                                            : ''
                                    }`}
                                >

                                    {/* AI ICON */}
                                    {message.role ===
                                        'assistant' && (
                                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-white">
                                            <Bot size={16} />
                                        </span>
                                    )}

                                    {/* MESSAGE */}
                                    <div
                                        className={`group max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                                            message.role ===
                                            'user'
                                                ? 'rounded-br-sm bg-teal-700 text-white'
                                                : 'rounded-tl-sm bg-slate-100 text-slate-700'
                                        }`}
                                    >

                                        <div className="prose-chat">
                                            <ReactMarkdown>
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>

                                        {/* COPY BUTTON */}
                                        {message.role ===
                                            'assistant' && (
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(
                                                        message.content
                                                    );

                                                    toast.success(
                                                        'Copied'
                                                    );
                                                }}
                                                className="mt-2 flex items-center gap-1 text-[10px] font-bold text-slate-400 opacity-0 transition group-hover:opacity-100"
                                            >
                                                <Copy size={11} />
                                                Copy
                                            </button>
                                        )}

                                    </div>

                                    {/* USER ICON */}
                                    {message.role ===
                                        'user' && (
                                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-200 text-slate-600">
                                            <User size={16} />
                                        </span>
                                    )}

                                </div>

                            ))}

                            {/* LOADING INDICATOR */}
                            {loading && (
                                <div className="flex gap-3">

                                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-white">
                                        <Bot size={16} />
                                    </span>

                                    <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-4">

                                        {[0, 1, 2].map(
                                            (index) => (
                                                <i
                                                    key={index}
                                                    className="pulse-dot h-2 w-2 rounded-full bg-slate-500"
                                                />
                                            )
                                        )}

                                    </div>

                                </div>
                            )}

                            {/* Scroll target */}
                            <div ref={bottom} />

                        </div>
                    )}

                </div>

                {/* --------------------------------------
                    INPUT
                -------------------------------------- */}
                <div className="shrink-0 border-t bg-white p-3 sm:p-5">

                    <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border bg-white p-2 shadow-[0_8px_30px_rgba(15,23,42,.08)] focus-within:border-teal-500">

                        <textarea
                            rows={1}
                            value={input}
                            onChange={(event) =>
                                setInput(
                                    event.target.value
                                )
                            }
                            onKeyDown={(event) => {
                                if (
                                    event.key === 'Enter' &&
                                    !event.shiftKey
                                ) {
                                    event.preventDefault();
                                    send();
                                }
                            }}
                            placeholder={
                                lang === 'hi'
                                    ? 'अपना सवाल लिखें…'
                                    : 'Ask about risks, safety or preparedness…'
                            }
                            className="max-h-32 min-h-[44px] flex-1 resize-none border-0 px-3 py-3 text-sm outline-none"
                        />

                        {/* VOICE */}
                        <button
                            onClick={voice}
                            className={`grid h-10 w-10 place-items-center rounded-xl ${
                                listening
                                    ? 'bg-red-50 text-red-500'
                                    : 'text-slate-400 hover:bg-slate-100'
                            }`}
                        >
                            {listening ? (
                                <MicOff size={18} />
                            ) : (
                                <Mic size={18} />
                            )}
                        </button>

                        {/* SEND */}
                        <button
                            disabled={
                                !input.trim() || loading
                            }
                            onClick={() => send()}
                            className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white disabled:opacity-30"
                        >
                            <Send size={17} />
                        </button>

                    </div>

                    <p className="mt-2 text-center text-[10px] text-slate-400">
                        ResQAI can make mistakes. Verify
                        critical advice with local authorities.
                    </p>

                </div>

            </section>
        </div>
    );
}