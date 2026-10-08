import {
  BrazilFlag,
  FranceFlag,
  GermanyFlag,
  IndiaFlag,
  ItalyFlag,
  JapanFlag,
  KoreaFlag,
  NetherlandsFlag,
  SpainFlag,
} from "@/components/ui/flags";

export interface CourseOption {
  code: string;
  name: string;
  Flag: (p: { className?: string }) => React.JSX.Element;
}

/**
 * Course catalogue shown on the landing page and course picker. Only the course that exists in
 * the database (Spanish, see GET /api/me -> course.code) is playable; the rest are "Coming soon"
 * placeholders, which the brief explicitly allows.
 */
export const COURSE_CATALOG: CourseOption[] = [
  { code: "es", name: "Spanish", Flag: SpainFlag },
  { code: "fr", name: "French", Flag: FranceFlag },
  { code: "ja", name: "Japanese", Flag: JapanFlag },
  { code: "de", name: "German", Flag: GermanyFlag },
  { code: "ko", name: "Korean", Flag: KoreaFlag },
  { code: "hi", name: "Hindi", Flag: IndiaFlag },
  { code: "it", name: "Italian", Flag: ItalyFlag },
  { code: "pt", name: "Portuguese", Flag: BrazilFlag },
  { code: "nl", name: "Dutch", Flag: NetherlandsFlag },
];

export const AVAILABLE_COURSE = "es";
