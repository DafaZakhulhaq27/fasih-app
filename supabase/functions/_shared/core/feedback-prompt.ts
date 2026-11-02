import type { Criterion } from './feedback.ts';

// Fills prompts/feedback.v*.md. The template text is passed in, so this stays free of file APIs.

export type PromptTemplate = {
  version: string;
  system: string;
  user: string;
};

export type FeedbackPromptInput = {
  question: string;
  answer: string;
  /** Counted by the app, never by the model. */
  wordCount: number;
  targetBand: number | null;
  weakestCriterion: Criterion | null;
  /** Most frequent mistake labels, most frequent first. */
  frequentMistakes: readonly string[];
  explanationLanguage: 'en' | 'id';
};

export type RenderedPrompt = PromptTemplate;

const criterionNames: Record<Criterion, string> = {
  task: 'task response',
  coherence: 'coherence and cohesion',
  lexical: 'lexical resource',
  grammar: 'grammatical range and accuracy',
  fluency: 'fluency and coherence',
  pronunciation: 'pronunciation',
};

const languageNames: Record<FeedbackPromptInput['explanationLanguage'], string> = {
  en: 'English',
  id: 'Indonesian',
};

function section(markdown: string, name: string): string {
  const match = markdown.match(
    new RegExp(`<!-- ${name} -->\\r?\\n([\\s\\S]*?)\\r?\\n<!-- /${name} -->`),
  );
  if (!match?.[1]) {
    throw new Error(`Prompt template has no "${name}" section`);
  }
  return match[1].trim();
}

/** Reads the version marker and the system and user sections from a prompt file. */
export function parsePromptTemplate(markdown: string): PromptTemplate {
  const version = markdown.match(/<!-- version: ([\w.-]+) -->/)?.[1];
  if (!version) {
    throw new Error('Prompt template has no version marker');
  }
  return { version, system: section(markdown, 'system'), user: section(markdown, 'user') };
}

// Student text goes inside <question> and <answer>; stop it from closing those tags early.
function neutralizeTags(text: string): string {
  return text.replace(/<(\/?)(question|answer)>/gi, '&lt;$1$2&gt;');
}

function fill(template: string, values: Record<string, string>): string {
  // One pass over the template only, so placeholders typed inside the essay stay as they are.
  return template.replace(/\{\{(\w+)\}\}/g, (_match, name: string) => {
    const value = values[name];
    if (value === undefined) {
      throw new Error(`Unknown placeholder {{${name}}} in prompt template`);
    }
    return value;
  });
}

export function renderFeedbackPrompt(
  template: PromptTemplate,
  input: FeedbackPromptInput,
): RenderedPrompt {
  const values: Record<string, string> = {
    target_band: input.targetBand === null ? 'not set yet' : input.targetBand.toFixed(1),
    weakest_criterion:
      input.weakestCriterion === null ? 'not known yet' : criterionNames[input.weakestCriterion],
    frequent_mistakes:
      input.frequentMistakes.length === 0 ? 'none recorded yet' : input.frequentMistakes.join('; '),
    explanation_language: languageNames[input.explanationLanguage],
    word_count: String(input.wordCount),
    question: neutralizeTags(input.question.trim()),
    answer: neutralizeTags(input.answer),
  };
  return {
    version: template.version,
    system: fill(template.system, values),
    user: fill(template.user, values),
  };
}
