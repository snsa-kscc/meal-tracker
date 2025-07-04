"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { WheelPicker } from "@/components/ui/wheel-picker";
import { DualWheelPicker } from "@/components/ui/dual-wheel-picker";
import { ArrowLeft, Check, Circle, CheckCircle2 } from "lucide-react";
import type { QuizQuestionType } from "@/data/quiz-questions";

interface QuizQuestionProps {
  question: QuizQuestionType;
  currentAnswer?: string | string[] | number;
  onNext: (questionId: string, answer: string | string[] | number) => void;
  onPrevious: () => void;
  onSkip: () => void;
  showPrevious: boolean;
}

export function QuizQuestion({ question, currentAnswer, onNext, onPrevious, onSkip, showPrevious }: QuizQuestionProps) {
  const [answer, setAnswer] = useState<string | string[] | number>(() => {
    if (currentAnswer !== undefined) {
      // Ensure slider questions always have a numeric answer
      if (question.type === "slider" && typeof currentAnswer !== "number") {
        return question.min || 0;
      }
      // For multiple choice, ensure we have an array
      if (question.type === "multiple" && !Array.isArray(currentAnswer)) {
        return [];
      }
      return currentAnswer;
    }
    if (question.type === "multiple") return [];
    if (question.type === "slider") return question.min || 0;
    return "";
  });

  const handleNext = () => {
    // Only proceed if the answer is valid
    if (isAnswerValid()) {
      onNext(question.id, answer);
    }
  };

  const handleSingleChoice = (value: string) => {
    setAnswer(value);
  };

  const handleMultipleChoice = (value: string) => {
    const currentAnswers = Array.isArray(answer) ? answer : [];
    if (currentAnswers.includes(value)) {
      setAnswer(currentAnswers.filter((a) => a !== value));
    } else {
      // Check if we've reached the maximum number of selections
      if (question.maxSelections && currentAnswers.length >= question.maxSelections) {
        // If we've reached the limit, don't add the new selection
        return;
      }
      setAnswer([...currentAnswers, value]);
    }
  };

  const isAnswerValid = () => {
    if (question.type === "multiple") {
      // For multiple choice questions, ensure at least one option is selected
      return Array.isArray(answer) && answer.length > 0;
    }
    if (question.type === "single") {
      // For single choice questions, ensure an option is selected
      return !!answer && answer !== "";
    }
    if (question.type === "slider") {
      // For slider questions, ensure it's a number
      return typeof answer === "number";
    }
    // For text and input questions, ensure non-empty string
    return !!answer && (typeof answer !== "string" || answer.trim() !== "");
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] relative overflow-hidden">
      {/* Decorative background elements - blobs similar to landing page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-r from-green-300 to-teal-300 opacity-10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 rounded-full bg-gradient-to-r from-purple-200 to-indigo-200 opacity-10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-pink-200 to-orange-200 opacity-10 blur-3xl" />
      </div>

      {/* Header with back button */}
      <div className="relative z-10 flex items-center p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          disabled={!showPrevious}
          className="h-12 w-12 rounded-full bg-[#11B364] text-white hover:bg-[#0ea55a] disabled:opacity-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Progress bar */}
        <div className="flex-1 ml-4 mr-4">
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-[#11B364] rounded-full"
              style={{
                width: question.questionNumber && question.totalQuestions ? `${(question.questionNumber / question.totalQuestions) * 100}%` : "10%",
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Title and Description - outside the card */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-4 pb-6">
        <div className="text-center space-y-3 mb-6 max-w-md">
          <h2 className="text-3xl font-bold leading-tight text-[#1A1A1A]">{question.title}</h2>
          {question.description && <p className="text-base text-[#1A1A1A] leading-relaxed">{question.description}</p>}
        </div>

        {/* Main content - white card */}
        <Card className="w-full max-w-md border-none bg-white rounded-3xl">
          <CardContent className="p-6">
            {/* Question indicator */}
            <div className="pb-4">
              <p className="text-sm text-[#1A1A1A]">
                Question {question.questionNumber}/{question.totalQuestions}
                {question.type !== "slider" && (
                  <>
                    {" "}
                    {question.type === "single" && <>- pick one answer</>}
                    {question.type === "multiple" && question.maxSelections && (
                      <>
                        - pick {question.maxSelections === 1 ? "one" : `up to ${question.maxSelections}`} {question.maxSelections === 1 ? "answer" : "answers"}
                      </>
                    )}
                    {question.type === "multiple" && !question.maxSelections && <>- pick all that apply</>}
                    {question.description?.includes("most present") ? " that are the most present" : ""}
                  </>
                )}
              </p>
            </div>

            {/* Horizontal divider */}
            <div className="border-b border-gray-100 mb-6"></div>
            {/* Single choice options with radio buttons */}
            {question.type === "single" && question.options && (
              <div className="space-y-3">
                {question.options.map((option) => {
                  const isSelected = answer === option.value;
                  return (
                    <Button
                      key={option.value}
                      variant="outline"
                      onClick={() => handleSingleChoice(option.value)}
                      className={`w-full h-14 justify-start text-left rounded-lg transition-all ${
                        isSelected ? "border-[#11B364] hover:bg-gray-50" : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className={`flex-shrink-0 h-5 w-5 rounded-full border ${
                            isSelected ? "border-[#11B364] text-[#11B364]" : "border-gray-300"
                          } flex items-center justify-center`}
                        >
                          {isSelected && <Circle className="h-2.5 w-2.5 fill-current" />}
                        </div>
                        {option.icon && <span className="text-xl">{option.icon}</span>}
                        <span className={`${isSelected ? "text-[#11B364] font-medium" : ""}`}>{option.label}</span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Multiple choice options with checkboxes */}
            {question.type === "multiple" && question.options && (
              <div className="space-y-3">
                {question.options.map((option) => {
                  const isSelected = Array.isArray(answer) && answer.includes(option.value);
                  return (
                    <Button
                      key={option.value}
                      variant="outline"
                      onClick={() => handleMultipleChoice(option.value)}
                      className={`w-full h-14 justify-start text-left rounded-lg transition-all ${
                        isSelected ? "border-[#11B364] hover:bg-gray-50" : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className={`flex-shrink-0 h-5 w-5 rounded-md border ${
                            isSelected ? "border-[#11B364] bg-[#11B364] text-white" : "border-gray-300"
                          } flex items-center justify-center`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </div>
                        {option.icon && <span className="text-xl">{option.icon}</span>}
                        <span className={`${isSelected ? "text-[#11B364] font-medium" : ""}`}>{option.label}</span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Text input */}
            {question.type === "text" && (
              <Textarea
                placeholder={question.placeholder || "Type your answer..."}
                value={typeof answer === "string" ? answer : ""}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[120px] rounded-lg border-gray-200 bg-white resize-none"
              />
            )}

            {/* Input field */}
            {question.type === "input" && (
              <Input
                placeholder={question.placeholder || "Enter your answer"}
                value={typeof answer === "string" ? answer : ""}
                onChange={(e) => setAnswer(e.target.value)}
                className="h-12 rounded-lg border-gray-200 bg-white"
              />
            )}

            {/* Slider input with appropriate picker based on unit type */}
            {question.type === "slider" && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-center mb-2">
                    <div className="text-lg font-medium text-gray-500">Select your {question.title.toLowerCase()}</div>
                  </div>

                  {/* Use dual wheel picker for weight in kg */}
                  {question.unit === "kg" ? (
                    <div className="px-4">
                      <DualWheelPicker
                        value={typeof answer === "number" ? answer * 1000 : (question.min || 0) * 1000}
                        onChange={(value) => setAnswer(value / 1000)}
                        minKg={question.min || 40}
                        maxKg={question.max || 150}
                        kgStep={question.step || 1}
                        gramStep={100}
                        unit="kg"
                      />
                    </div>
                  ) : question.unit === "lbs" || question.unit === "cm" || question.unit === "ft" ? (
                    /* Use single wheel picker for height and other weight units */
                    <div className="px-4">
                      <WheelPicker
                        value={typeof answer === "number" ? answer : question.min || 0}
                        onChange={(value) => setAnswer(value)}
                        min={question.min || 0}
                        max={question.max || 100}
                        step={question.step || 1}
                        unit={question.unit}
                      />
                    </div>
                  ) : (
                    /* Use regular slider for other measurements */
                    <div className="px-4">
                      <div className="text-center mb-4">
                        <div className="inline-block bg-[#E7F6EF] px-6 py-2 rounded-md">
                          <span className="text-2xl font-bold text-[#1A1A1A]">
                            {typeof answer === "number" ? answer : question.min || 0} <span className="text-lg">{question.unit}</span>
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={[typeof answer === "number" ? answer : question.min || 0]}
                        onValueChange={(value) => setAnswer(value[0])}
                        min={question.min || 0}
                        max={question.max || 100}
                        step={question.step || 1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>
                          {question.min} {question.unit}
                        </span>
                        <span>
                          {question.max} {question.unit}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/*horizontal divider*/}
            <div className="border-b border-gray-100 my-6"></div>
            {/* Next button */}
            <div className="pt-6 flex flex-col items-center justify-center">
              <Button
                onClick={handleNext}
                disabled={!isAnswerValid()}
                className="h-14 px-14 bg-[#1A1A1A] hover:bg-black text-white rounded-full font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="next-question-button"
              >
                {question.nextButtonText || "Continue"}
              </Button>

              {/* Skip link */}
              <div className="text-center mt-4">
                <button onClick={onSkip} className="text-sm text-gray-900 underline hover:text-gray-500 font-medium">
                  Skip onboarding
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
