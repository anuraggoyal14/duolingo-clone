"use client";

import type { AnswerValue, Exercise } from "@/lib/types";
import { FillBlank } from "./exercises/FillBlank";
import { MatchPairs } from "./exercises/MatchPairs";
import { MultipleChoice } from "./exercises/MultipleChoice";
import type { ExerciseProps } from "./exercises/shared";
import { Translate } from "./exercises/Translate";
import { TypeAnswer } from "./exercises/TypeAnswer";

/** Dispatches an exercise to the component for its type. */
export function ExerciseView(props: ExerciseProps<Exercise>) {
  const { exercise, ...rest } = props;
  switch (exercise.type) {
    case "multiple_choice":
      return <MultipleChoice exercise={exercise} {...rest} />;
    case "translate":
      return <Translate exercise={exercise} {...rest} />;
    case "match_pairs":
      return <MatchPairs exercise={exercise} {...rest} />;
    case "fill_blank":
      return <FillBlank exercise={exercise} {...rest} />;
    case "type_answer":
      return <TypeAnswer exercise={exercise} {...rest} />;
  }
}

/** The answer sent when the learner presses SKIP: always graded as incorrect. */
export function skipAnswer(exercise: Exercise): AnswerValue {
  switch (exercise.type) {
    case "multiple_choice":
      return -1;
    case "translate":
      return [];
    case "match_pairs":
      return [];
    case "fill_blank":
    case "type_answer":
      return "";
  }
}
