from fastapi import APIRouter, HTTPException
from models.schemas import StartRequest, NextQuestionRequest
from services.llm import first_question_chain, next_question_chain
from utils.helpers import format_qa

router = APIRouter(prefix="/assessment", tags=["Assessment"])


@router.post("/start")
async def start_assessment(req: StartRequest):
    """Returns the first adaptive question for a new session."""
    try:
        result = await first_question_chain.ainvoke({"patientId": req.patientId})
        return {"success": True, "question": result}
    except Exception as e:
        raise HTTPException(500, f"LLM error: {str(e)}")


@router.post("/next-question")
async def next_question(req: NextQuestionRequest):
    """Given full Q&A so far, returns next question OR done:true signal."""
    try:
        result = await next_question_chain.ainvoke({
            "qa_text":         format_qa(req.qa),
            "question_number": req.questionNumber,
            "next_num":        req.questionNumber + 1,
        })
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(500, f"LLM error: {str(e)}")
    
    