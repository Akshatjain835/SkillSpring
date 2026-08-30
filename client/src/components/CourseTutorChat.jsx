import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAskTutorMutation } from "@/features/api/tutorApi";
import { Loader2, Send, Sparkles, Bot, User } from "lucide-react";

const CourseTutorChat = ({ courseId }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm your AI Course Tutor. Ask me any question about the lectures in this course — I'll answer based directly on the course content!",
    },
  ]);
  const [input, setInput] = useState("");
  const [askTutor, { isLoading }] = useAskTutorMutation();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (customQuestion) => {
    const question = (customQuestion || input).trim();
    if (!question || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    if (!customQuestion) setInput("");

    try {
      const res = await askTutor({ courseId, question }).unwrap();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.answer, sources: res.sources },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            err?.data?.message ||
            "Something went wrong reaching the AI tutor. Please try again.",
        },
      ]);
    }
  };

  const sampleQuestions = [
    "What are the main key takeaways?",
    "Summarize the active lecture",
  ];

  return (
    <div className="border border-slate-200/80 dark:border-slate-800 rounded-3xl flex flex-col h-[500px] bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">AI Course Assistant</h3>
            <p className="text-[10px] text-slate-400">Powered by Course RAG Engine</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Online
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${m.role === "user"
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm"
                }`}
            >
              {m.role === "user" ? <User size={14} /> : <Sparkles size={14} />}
            </div>

            <div
              className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${m.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50"
                }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.sources?.length > 0 && (
                <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] opacity-75">
                  <span className="font-semibold">Sources: </span>
                  {m.sources.join(", ")}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Analyzing lectures & formulating answer...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length < 3 && (
        <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
          {sampleQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="flex items-center gap-2 p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question about this course..."
          disabled={isLoading}
          className="rounded-xl border-slate-200 dark:border-slate-800 text-xs focus-visible:ring-blue-500 h-10"
        />
        <Button
          size="icon"
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 w-10 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CourseTutorChat;

