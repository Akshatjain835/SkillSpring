import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAskTutorMutation } from "@/features/api/tutorApi";
import { Loader2, Send, Sparkles } from "lucide-react";

const CourseTutorChat = ({ courseId }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Ask me anything about this course's lectures — I'll only answer from what's actually taught here, and I'll tell you if it isn't covered.",
    },
  ]);
  const [input, setInput] = useState("");
  const [askTutor, { isLoading }] = useAskTutorMutation();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");

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
            "Something went wrong reaching the tutor. Please try again.",
        },
      ]);
    }
  };

  return (
    <div className="border rounded-lg flex flex-col h-[480px] bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">AI Course Tutor</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.sources?.length > 0 && (
                <p className="mt-1 text-xs opacity-70">
                  Sources: {m.sources.join(", ")}
                </p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 p-3 border-t">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about this course..."
          disabled={isLoading}
        />
        <Button size="icon" onClick={handleSend} disabled={isLoading}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CourseTutorChat;
