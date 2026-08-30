import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useGetQuizQuery, useSubmitQuizAttemptMutation } from "@/features/api/quizApi";
import { CheckCircle2, HelpCircle, Loader2, XCircle, Award } from "lucide-react";
import { toast } from "sonner";

const QuizPlayer = ({ courseId, lectureId }) => {
  const { data, isLoading, isError, refetch } = useGetQuizQuery(
    { courseId, lectureId },
    { skip: !lectureId }
  );
  const [submitQuizAttempt, { isLoading: isSubmitting }] = useSubmitQuizAttemptMutation();

  const [responses, setResponses] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    setResponses({});
    setResult(null);
  }, [lectureId]);

  if (!lectureId) return null;

  if (isLoading) {
    return (
      <Card className="rounded-3xl border-slate-200 dark:border-slate-800">
        <CardContent className="p-6 text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Fetching AI generated quiz...
        </CardContent>
      </Card>
    );
  }

  if (isError || !data?.questions) {
    return (
      <Card className="rounded-3xl border-slate-200 dark:border-slate-800">
        <CardContent className="p-6 text-xs text-slate-500 flex flex-col items-center justify-center text-center gap-2">
          <HelpCircle className="w-6 h-6 text-slate-400" />
          <p className="font-semibold text-slate-800 dark:text-slate-200">No Quiz Available</p>
          <p className="text-[11px] max-w-xs text-slate-400">No automated AI quiz has been generated for this lecture yet.</p>
        </CardContent>
      </Card>
    );
  }

  const handleChange = (index, value) => {
    setResponses((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async () => {
    const answers = (data.questions || []).map((q) => ({
      questionIndex: q.index,
      studentAnswer: responses[q.index] || "",
    }));

    try {
      const res = await submitQuizAttempt({ courseId, lectureId, answers }).unwrap();
      setResult(res);
      toast.success("Quiz submitted!");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit quiz attempt. Please try again.");
    }
  };

  const scoreByIndex = new Map(
    (result?.answers || []).map((a) => [a.questionIndex, a])
  );

  return (
    <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
      <CardContent className="p-5 space-y-6">
        {/* Header Title */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Knowledge Check</h3>
            <p className="text-[10px] text-slate-400">{data.questions?.length || 0} Questions</p>
          </div>

          {result && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-extrabold border border-blue-200 dark:border-blue-800">
              <Award size={14} className="text-blue-600" />
              <span>Score: {Math.round((result.totalScore || 0) * 100)}%</span>
            </div>
          )}
        </div>

        {/* Questions */}
        {(data.questions || []).map((q) => {
          const graded = scoreByIndex.get(q.index);
          return (
            <div key={q.index} className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800/80 last:border-b-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                {q.index + 1}. {q.questionText}
              </p>

              {q.type === "mcq" ? (
                <div className="space-y-1.5">
                  {(q.options || []).map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        responses[q.index] === opt
                          ? "bg-blue-50/80 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-medium"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.index}`}
                        value={opt}
                        disabled={Boolean(result)}
                        checked={responses[q.index] === opt}
                        onChange={() => handleChange(q.index, opt)}
                        className="accent-blue-600 shrink-0"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-3 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:opacity-60"
                  rows={3}
                  placeholder="Type your answer here..."
                  disabled={Boolean(result)}
                  value={responses[q.index] || ""}
                  onChange={(e) => handleChange(q.index, e.target.value)}
                />
              )}

              {graded && (
                <div
                  className={`flex items-start gap-2 text-[11px] rounded-xl p-2.5 border ${
                    graded.score >= 0.7
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                  }`}
                >
                  {graded.score >= 0.7 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                  )}
                  <span>{graded.feedback}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Action Controls */}
        {!result ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-10 text-xs font-bold shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating...
              </>
            ) : (
              "Submit Quiz Answers"
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full rounded-xl text-xs font-semibold"
            onClick={() => {
              setResult(null);
              setResponses({});
              refetch();
            }}
          >
            Retake Quiz
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizPlayer;

