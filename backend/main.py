import json
import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from typing import Optional
file: UploadFile | None = File(None)

app = FastAPI(title="GenQuiz Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Explicitly use the provided API key
genai.configure(api_key="AIzaSyDeIka1N8Ib5yDx2hyPYFkQaJ04SWSMVWk")
model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})

@app.post("/api/generate-quiz")
async def generate_quiz(
    sections: str = Form(...),
    count_per_section: int = Form(...),
    difficulty: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    section_list = json.loads(sections)
    
    file_bytes = b""
    mime_type = ""
    if file:
        file_bytes = await file.read()
        mime_type = file.content_type

    sections_str = ", ".join(section_list)

    prompt = f"""You are the backend brain of an aptitude quiz application called GenQuiz.
Your job is to generate highly dynamic, real-world aptitude test questions. These should be modeled after actual corporate placement exams (like TCS, Infosys, Amazon, etc.) and standard competitive assessments.
The questions must test practical problem-solving, critical thinking, and real-world application of concepts covering the requested sections: {sections_str}.

Difficulty level requested: {difficulty}
Please generate EXACTLY {count_per_section} questions for EACH requested section.

If a file/image (like a syllabus) is attached alongside this prompt, USE IT. Base the questions deeply on the topics and difficulty indicated in that uploaded document.

You MUST respond with ONLY a valid JSON object in EXACTLY this structure - no markdown, no backticks:
{{
  "{section_list[0] if len(section_list) > 0 else 'english'}": [
    {{
      "q": "Question text here?",
      "opts": ["Option A", "Option B", "Option C", "Option D"],
      "ans": 1,
      "exp": "Brief explanation of the correct answer.",
      "section": "{section_list[0] if len(section_list) > 0 else 'english'}"
    }}
  ]
}}
Include ALL these sections in the root object: {sections_str}.
Rules you must follow strictly:
- "ans" is the ZERO-BASED index of the correct answer in "opts"
- All 4 options must be plausible, only one correct
- "exp" must be concise (1-2 sentences max)
- Questions must match the requested difficulty: {difficulty}
- Never repeat questions across calls
- JSON MUST BE STRICTLY FORMATTED!
"""

    try:
        if file and mime_type:
            part = {
                "mime_type": mime_type,
                "data": file_bytes
            }
            response = model.generate_content([prompt, part])
        else:
            response = model.generate_content(prompt)
        
        output_text = response.text.strip()
        quiz_data = json.loads(output_text)
        return quiz_data

    except Exception as e:
        print(f"Error generating quiz: {e}")
        return {"error": "Failed to generate quiz from LLM. Check console."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
