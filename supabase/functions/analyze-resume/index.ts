const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const prompt = `
You are an expert AI career assistant and professional resume analyzer.

Analyze the uploaded resume carefully.

Return ONLY valid JSON.

Do not use Markdown.
Do not add explanations outside JSON.
Do not invent information that is not present in the resume.

Use this exact JSON structure:

{
  "candidateName": "",
  "professionalSummary": "",
  "atsScore": 0,
  "careerReadiness": 0,
  "experienceLevel": "",
  "targetRoles": [],
  "skills": {
    "technical": [],
    "soft": [],
    "tools": []
  },
  "strengths": [],
  "weaknesses": [],
  "skillGaps": [],
  "recommendations": [],
  "education": [],
  "projects": [],
  "certifications": [],
  "keywords": []
}

Rules:

1. candidateName:
   Extract the candidate's name if clearly available.

2. professionalSummary:
   Give a concise professional summary based ONLY on the resume.

3. atsScore:
   Give a realistic ATS compatibility score from 0 to 100.

4. careerReadiness:
   Give a realistic career-readiness score from 0 to 100.

5. experienceLevel:
   Examples:
   "Fresher"
   "Entry Level"
   "Junior"
   "Mid Level"
   "Senior"
   "Not specified"

6. targetRoles:
   Suggest realistic job roles based on the candidate's actual resume.

7. skills.technical:
   List technical/programming skills explicitly found in the resume.

8. skills.soft:
   List soft skills explicitly found or strongly supported by the resume.

9. skills.tools:
   List frameworks, platforms, cloud services, databases, IDEs,
   developer tools and other technologies mentioned.

10. strengths:
    List important strengths demonstrated by the resume.

11. weaknesses:
    List realistic weaknesses in the resume.

12. skillGaps:
    Suggest skills that would improve the candidate's target career.

13. recommendations:
    Give practical resume and career improvement suggestions.

14. education:
    Extract education details.

15. projects:
    Extract project names and relevant descriptions.

16. certifications:
    Extract certifications.

17. keywords:
    Extract useful ATS keywords from the resume.

Important:
- Never invent a degree.
- Never invent work experience.
- Never invent certifications.
- Never invent projects.
- Never invent skills.
- If information is unavailable, use an empty string or empty array.
- Scores must be integers between 0 and 100.
`;

/* ---------------------------------------------------------
   WAIT HELPER
--------------------------------------------------------- */

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ---------------------------------------------------------
   GEMINI REQUEST
--------------------------------------------------------- */

async function callGemini(
  apiKey: string,
  model: string,
  pdfBase64: string,
) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },

    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64,
              },
            },
          ],
        },
      ],

      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  const responseText = await response.text();

  let responseData: any;

  try {
    responseData = JSON.parse(responseText);
  } catch {
    responseData = {
      error: {
        message: responseText,
      },
    };
  }

  return {
    response,
    data: responseData,
  };
}

/* ---------------------------------------------------------
   MAIN FUNCTION
--------------------------------------------------------- */

Deno.serve(async (req) => {
  /* -------------------------------------------------------
     CORS
  ------------------------------------------------------- */

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  /* -------------------------------------------------------
     METHOD CHECK
  ------------------------------------------------------- */

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Only POST requests are allowed.",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    /* -----------------------------------------------------
       API KEY
    ----------------------------------------------------- */

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY is missing.");

      return new Response(
        JSON.stringify({
          success: false,
          error: "GEMINI_API_KEY is not configured in Supabase.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    /* -----------------------------------------------------
       READ FORM DATA
    ----------------------------------------------------- */

    const formData = await req.formData();

    const resume = formData.get("resume");

    if (!(resume instanceof File)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No resume PDF was uploaded.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    /* -----------------------------------------------------
       FILE VALIDATION
    ----------------------------------------------------- */

    if (resume.type !== "application/pdf") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Only PDF resumes are supported.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (resume.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Resume must be smaller than 10 MB.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    console.log(
      `Resume received: ${resume.name} (${resume.size} bytes)`,
    );

    /* -----------------------------------------------------
       PDF → BASE64
    ----------------------------------------------------- */

    const pdfBytes = new Uint8Array(await resume.arrayBuffer());

    let binary = "";

    const chunkSize = 0x8000;

    for (let i = 0; i < pdfBytes.length; i += chunkSize) {
      const chunk = pdfBytes.subarray(
        i,
        Math.min(i + chunkSize, pdfBytes.length),
      );

      binary += String.fromCharCode(...chunk);
    }

    const pdfBase64 = btoa(binary);

    /* -----------------------------------------------------
       TRY GEMINI MODELS
    ----------------------------------------------------- */

    let lastError = "Gemini analysis failed.";

    for (const model of GEMINI_MODELS) {
      console.log(`Trying Gemini model: ${model}`);

      /*
       * Retry each model up to 3 times.
       *
       * 503 → wait 2 sec → retry
       * 503 → wait 4 sec → retry
       * 503 → wait 8 sec → retry
       */

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(
            `Model ${model}, attempt ${attempt}/3`,
          );

          const result = await callGemini(
            geminiApiKey,
            model,
            pdfBase64,
          );

          const { response, data } = result;

          /* -----------------------------------------------
             SUCCESS
          ------------------------------------------------ */

          if (response.ok) {
            console.log(
              `Gemini success using ${model}`,
            );

            const rawText =
              data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!rawText) {
              throw new Error(
                "Gemini returned an empty response.",
              );
            }

            let analysis;

            try {
              analysis = JSON.parse(rawText);
            } catch (parseError) {
              console.error(
                "Gemini JSON parsing error:",
                parseError,
              );

              console.error(
                "Raw Gemini response:",
                rawText,
              );

              throw new Error(
                "Gemini returned invalid JSON.",
              );
            }

            return new Response(
              JSON.stringify({
                success: true,
                model,
                analysis,
              }),
              {
                status: 200,
                headers: {
                  ...corsHeaders,
                  "Content-Type": "application/json",
                },
              },
            );
          }

          /* -----------------------------------------------
             503 HIGH DEMAND
          ------------------------------------------------ */

          if (response.status === 503) {
            lastError =
              data?.error?.message ||
              "Gemini is temporarily unavailable.";

            console.error(
              `Gemini 503 from ${model}, attempt ${attempt}:`,
              data,
            );

            if (attempt < 3) {
              const waitTime =
                Math.pow(2, attempt) * 1000;

              console.log(
                `Waiting ${waitTime}ms before retry...`,
              );

              await sleep(waitTime);

              continue;
            }

            break;
          }

          /* -----------------------------------------------
             429 RATE LIMIT
          ------------------------------------------------ */

          if (response.status === 429) {
            lastError =
              data?.error?.message ||
              "Gemini API rate limit reached.";

            console.error(
              `Gemini 429 from ${model}:`,
              data,
            );

            if (attempt < 3) {
              const waitTime =
                Math.pow(2, attempt) * 2000;

              console.log(
                `Rate limited. Waiting ${waitTime}ms...`,
              );

              await sleep(waitTime);

              continue;
            }

            break;
          }

          /* -----------------------------------------------
             OTHER GEMINI ERROR
          ------------------------------------------------ */

          lastError =
            data?.error?.message ||
            `Gemini API returned status ${response.status}`;

          console.error(
            `Gemini API error from ${model}:`,
            data,
          );

          /*
           * For authentication / bad request errors,
           * don't waste time retrying the same request.
           */

          if (
            response.status === 400 ||
            response.status === 401 ||
            response.status === 403 ||
            response.status === 404
          ) {
            break;
          }
        } catch (error) {
          lastError =
            error instanceof Error
              ? error.message
              : "Unknown Gemini error.";

          console.error(
            `Gemini request exception (${model}):`,
            error,
          );

          if (attempt < 3) {
            const waitTime =
              Math.pow(2, attempt) * 1000;

            await sleep(waitTime);

            continue;
          }
        }
      }

      console.log(
        `Model ${model} exhausted. Trying next model...`,
      );
    }

    /* -----------------------------------------------------
       ALL MODELS FAILED
    ----------------------------------------------------- */

    return new Response(
      JSON.stringify({
        success: false,
        error:
          "Gemini is temporarily unavailable. Please try again in a few seconds.",
        details: lastError,
      }),
      {
        status: 503,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error(
      "Unexpected Edge Function error:",
      error,
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});