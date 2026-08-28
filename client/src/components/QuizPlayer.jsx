import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useGetQuizQuery, useSubmitQuizAttemptMutation } from "@/features/api/quizApi";
import { CheckCircle2, HelpCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

const QuizPlayer = ({ courseId, lectureId }) => {
  const { data, isLoading, isError, refetch } = useGetQuizQuery(
    { courseId, lectureId },
    { skip: !lectureId }
  );
  const [submitQuizAttempt, { isLoading: isSubmitting }] =
    useSubmitQuizAttemptMutation();

  const [responses, setResponses] = useState({});
  const [result, setResult] = useState(null);

  // Reset local state whenever the student switches to a different lecture
  useEffect(() => {
    setResponses({});
    setResult(null);
  }, [lectureId]);

  if (!lectureId) return null;

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4 text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading quiz...
        </CardContent>
      </Card>
    );
  }

  if (isError || !data?.questions) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4 text-sm text-muted-foreground flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          No quiz has been generated for this lecture yet.
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
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit quiz attempt. Please try again.");
    }
  };

  const scoreByIndex = new Map(
    (result?.answers || []).map((a) => [a.questionIndex, a])
  );

  return (
    <Card className="mt-4">
      <CardContent className="p-4 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Quiz: {data.lectureTitle}</h3>
          {result && (
            <span className="text-sm font-medium">
              Score: {Math.round(result.totalScore * 100)}%
            </span>
          )}
        </div>

        {(data.questions || []).map((q) => {
          const graded = scoreByIndex.get(q.index);
          return (
            <div key={q.index} className="space-y-2 pb-4 border-b last:border-b-0">
              <p className="text-sm font-medium">
                {q.index + 1}. {q.questionText}
              </p>

              {q.type === "mcq" ? (
                <div className="space-y-1">
                  {(q.options || []).map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`q-${q.index}`}
                        value={opt}
                        disabled={Boolean(result)}
                        checked={responses[q.index] === opt}
                        onChange={() => handleChange(q.index, opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  rows={3}
                  placeholder="Type your answer..."
                  disabled={Boolean(result)}
                  value={responses[q.index] || ""}
                  onChange={(e) => handleChange(q.index, e.target.value)}
                />
              )}

              {graded && (
                <div
                  className={`flex items-start gap-2 text-xs rounded-md p-2 ${
                    graded.score >= 0.7
                      ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                  }`}
                >
                  {graded.score >= 0.7 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  )}
                  <span>{graded.feedback}</span>
                </div>
              )}
            </div>
          );
        })}

        {!result ? (
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Grading...
              </>
            ) : (
              "Submit Quiz"
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full"
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
