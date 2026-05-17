// This enum maps letter grades to their score ranges.
// in multiple places — I define them once and reference the enum.
enum LetterGrade {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  F = "F",
}

// Each subject has a name and a numeric score.
interface Subject {
  name: string;
  score: number;
}

// This interface defines what the final result looks like
interface GradeResult {
  average: number;
  grade: LetterGrade;
  remark: string;
}

// Our in-memory list of subjects the user has added
let subjects: Subject[] = [];

// DOM elements
const subjectNameInput = document.getElementById("subject-name") as HTMLInputElement;
const subjectScoreInput = document.getElementById("subject-score") as HTMLInputElement;
const addSubjectBtn = document.getElementById("add-subject-btn") as HTMLButtonElement;
const subjectsList = document.getElementById("subjects-list") as HTMLDivElement;
const calculateBtn = document.getElementById("calculate-btn") as HTMLButtonElement;
const inputError = document.getElementById("input-error") as HTMLParagraphElement;
const resultCard = document.getElementById("result-card") as HTMLDivElement;

// This function takes a numeric score and returns the correct LetterGrade.
function getLetterGrade(score: number): LetterGrade {
  if (score >= 70) return LetterGrade.A;
  if (score >= 60) return LetterGrade.B;
  if (score >= 50) return LetterGrade.C;
  if (score >= 40) return LetterGrade.D;
  return LetterGrade.F;
}

// Returns a motivational remark based on the letter grade.
function getRemark(grade: LetterGrade): string {
  switch (grade) {
    case LetterGrade.A:
      return "Excellent work! Keep it up.";
    case LetterGrade.B:
      return "Good job! A little more effort and you'll hit an A.";
    case LetterGrade.C:
      return "Average. There's room to improve.";
    case LetterGrade.D:
      return "Below average. Consider revisiting the material.";
    case LetterGrade.F:
      return "Unfortunately a fail. Don't give up — try again.";
  }
}

// This function takes the full subjects array and returns a GradeResult.
function calculateResult(subjectList: Subject[]): GradeResult {
  const total = subjectList.reduce((sum, s) => sum + s.score, 0);
  const average = parseFloat((total / subjectList.length).toFixed(1));
  const grade = getLetterGrade(average);
  const remark = getRemark(grade);

  return { average, grade, remark };
}

// Renders the subjects list to the DOM.
function renderSubjects(): void {
  if (subjects.length === 0) {
    subjectsList.innerHTML = `<div class="empty-state">No subjects added yet.</div>`;
    return;
  }

  subjectsList.innerHTML = subjects
    .map((subject, index) => {
      const grade = getLetterGrade(subject.score);
      return `
        <div class="subject-item">
          <span class="subject-name">${subject.name}</span>
          <div class="subject-right">
            <span class="subject-score">${subject.score}/100</span>
            <span class="grade-badge grade-${grade}">${grade}</span>
            <button class="remove-btn" data-index="${index}">✕</button>
          </div>
        </div>
      `;
    })
    .join("");
}

// Handle clicking the Add button
addSubjectBtn.addEventListener("click", () => {
  const name = subjectNameInput.value.trim();
  const score = Number(subjectScoreInput.value);

  // Validate: name must not be empty, score must be a number between 0 and 100
  if (name === "" || isNaN(score) || score < 0 || score > 100) {
    inputError.classList.add("visible");
    return;
  }

  inputError.classList.remove("visible");

  const newSubject: Subject = { name, score };
  subjects.push(newSubject);

  subjectNameInput.value = "";
  subjectScoreInput.value = "";

  // Hide the result card when new subjects are added so the user knows they need to recalculate
  resultCard.classList.remove("visible");

  renderSubjects();
});

// Handle removing a subject by clicking the ✕ button.
subjectsList.addEventListener("click", (e: MouseEvent) => {
  const target = e.target as HTMLElement;

  if (target.classList.contains("remove-btn")) {
    const index = Number(target.dataset.index);
    subjects.splice(index, 1);
    resultCard.classList.remove("visible");
    renderSubjects();
  }
});

// Handle the Calculate button click. It can only calculate if there's at least one subject in the list.
calculateBtn.addEventListener("click", () => {
  if (subjects.length === 0) {
    inputError.textContent = "Please add at least one subject before calculating.";
    inputError.classList.add("visible");
    return;
  }

  inputError.classList.remove("visible");

  const result = calculateResult(subjects);

  // Populate the result card with the calculated values
  (document.getElementById("out-total") as HTMLSpanElement).textContent = String(subjects.length);
  (document.getElementById("out-average") as HTMLSpanElement).textContent = String(result.average);
  (document.getElementById("out-grade") as HTMLSpanElement).textContent = result.grade;
  (document.getElementById("out-remark") as HTMLParagraphElement).textContent = result.remark;

  resultCard.classList.add("visible");
});

// Initial render
renderSubjects();
