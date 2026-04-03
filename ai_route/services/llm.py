from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from config import GEMINI_API_KEY

# ── LLM ──────────────────────────────────────────────────────────────────────
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GEMINI_API_KEY,
    temperature=0.3,
)

# ── Prompts ───────────────────────────────────────────────────────────────────

FIRST_Q_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a compassionate AI health assistant for rural Indian patients.
Ask the first question to understand their main health concern.
Respond ONLY with valid JSON, no extra text:
{{
  "questionId": "q1",
  "question": "<simple friendly question in English>",
  "category": "symptom"
}}"""),
    ("human", "Start a health assessment for patient {patientId}"),
])

NEXT_Q_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a compassionate AI health assistant for rural Indian patients.
Based on Q&A so far, return the next question OR signal done.

Respond ONLY valid JSON:
If next question:
{{
  "done": false,
  "question": {{
    "questionId": "q{next_num}",
    "question": "<adaptive follow-up, simple English>",
    "category": "<symptom|duration|severity|history|lifestyle|mental_health>"
  }}
}}
If enough info collected (8+ questions OR clear picture):
{{
  "done": true
}}

Flow: symptoms → duration → severity → related symptoms → history → lifestyle
Stop at 8 questions max."""),
    ("human", "Q&A so far (question {question_number} just answered):\n{qa_text}"),
])

REPORT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a medical AI generating a pre-consultation summary for a doctor.
Respond ONLY with valid JSON:
{{
  "symptomsSummary": "<1-2 sentence summary>",
  "duration": "<how long symptoms present>",
  "severity": "<mild|moderate|severe>",
  "keyObservations": ["<obs1>", "<obs2>", "..."],
  "possibleConcerns": ["<non-diagnostic flag>", "..."],
  "urgencyLevel": "<routine|priority|urgent>",
  "recommendedTests": ["<test1>", "..."]
}}

Rules:
- Do NOT diagnose. Use "pattern consistent with", "may suggest"
- keyObservations: 3-5 points from Q&A
- possibleConcerns: non-diagnostic only (e.g. "Low hemoglobin pattern")
- urgencyLevel: urgent=alarming symptoms, priority=needs soon, routine=otherwise"""),
    ("human", "Patient Q&A:\n{qa_text}\n\nVitals:\n{vitals_text}\n\nGenerate report."),
])

# ── Chains ────────────────────────────────────────────────────────────────────
parser = JsonOutputParser()

first_question_chain = FIRST_Q_PROMPT | llm | parser
next_question_chain  = NEXT_Q_PROMPT  | llm | parser
report_chain         = REPORT_PROMPT  | llm | parser

