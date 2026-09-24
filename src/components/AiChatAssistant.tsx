import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { DefinitionItem } from "../services/GetDefinitionHelper";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatAssistantProps {
  onCheatResults: (results: DefinitionItem[]) => void;
  onPosFilter: (pos: string | null) => void;
  onReset: () => void;
  onAIAnagram: (availableLetters: string[], letterPositions: string[]) => void;
}

const AIChatAssistant = ({
  onCheatResults,
  onPosFilter,
  onReset,
  onAIAnagram,
}: AIChatAssistantProps) => {
  const initialMessage: Message = {
    role: "assistant",
    content:
      "Hi! I'm your anagram assistant. What letters would you like to find anagrams for?",
  };
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getPosFilter = (text: string): string | null | undefined => {
    const lowerText = text.trim().toLowerCase();

    if (/\b(noun|nouns)\b/.test(lowerText)) return "Noun";
    if (/\b(verb|verbs)\b/.test(lowerText)) return "Verb";
    if (/\b(adjective|adjectives)\b/.test(lowerText)) return "Adjective";
    if (/\b(adverb|adverbs)\b/.test(lowerText)) return "Adverb";

    if (/\b(all|everything)\b/.test(lowerText)) return null;

    return undefined;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      role: "user",
      content: input,
    };
    const posFilter = getPosFilter(input);

    if (posFilter !== undefined) {
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          role: "assistant",
          content:
            posFilter === null
              ? "Showing all parts of speech."
              : `Showing ${posFilter.toLowerCase()}s only.`,
        },
      ]);

      onPosFilter(posFilter);
      setInput("");
      return;
    }

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
        }),
      });

      if (!response.ok) {
        let errorMessage = "The AI service returned an error.";

        try {
          const errorData = await response.json();

          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Response wasn't JSON, so use the default message
        }

        throw new Error(`HTTP_${response.status}:${errorMessage}`);
      }

      const data = await response.json();

      if (data.reset) {
        onReset();
        setMessages([initialMessage]);
        setInput("");
        return;
      }

      if (data.availableLetters && data.letterPositions) {
        onAIAnagram(data.availableLetters, data.letterPositions);
      }

      if (data.cheatResults) {
        onCheatResults(data.cheatResults);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      let friendlyMessage: string;

      if (error instanceof Error) {
        const [status] = error.message.split(":");

        switch (status) {
          case "HTTP_400":
            friendlyMessage =
              "I couldn't understand that request. Please try asking in a different way.";
            break;

          case "HTTP_401":
            friendlyMessage =
              "The AI assistant isn't authorised to respond right now. Please try again later.";
            break;

          case "HTTP_429":
            friendlyMessage =
              "The AI assistant is a little busy right now. Please wait a moment and try again.";
            break;

          case "HTTP_500":
            friendlyMessage =
              "Something went wrong with the AI assistant. Please try again in a moment.";
            break;

          case "HTTP_502":
          case "HTTP_503":
            friendlyMessage =
              "The AI assistant is temporarily unavailable. Please try again shortly.";
            break;

          case "HTTP_504":
            friendlyMessage =
              "The AI assistant took too long to respond. Please try again in a moment.";
            break;

          default:
            friendlyMessage =
              "I couldn't connect to the AI assistant. Please try again shortly.";
        }
      } else {
        friendlyMessage =
          "I couldn't connect to the AI assistant. Please check your connection and try again.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: friendlyMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#ed800f] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-orange-600 transition-all"
        aria-label="Open AI chat assistant"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#045626] to-[#ed800f] text-white px-4 py-3">
            <h3 className="text-sm font-semibold">Anagram Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white"
              aria-label="Close chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M6.28 5.22a.75 .75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>{" "}
          {/* Messages */}{" "}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {" "}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-[#ed800f] text-white rounded-br-[4px]"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-[4px]"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-500">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Input */}
          <div className="border-t border-gray-200 p-3 flex items-center gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask for hints..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed800f]/50"
              aria-label="Chat input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-[#ed800f] text-white rounded-full p-2 hover:bg-orange-600 disabled:opacity-50 transition"
              aria-label="Send message"
            >
              Go
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatAssistant;
