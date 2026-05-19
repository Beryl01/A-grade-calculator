"use strict";
var LetterGrade;
(function (LetterGrade) {
    LetterGrade["A"] = "A";
    LetterGrade["B"] = "B";
    LetterGrade["C"] = "C";
    LetterGrade["D"] = "D";
    LetterGrade["F"] = "F";
})(LetterGrade || (LetterGrade = {}));
// ── DOM elements ──────────────────────────────────────────────────────────────
const subjectNameInput = document.getElementById("subject-name");
const subjectScoreInput = document.getElementById("subject-score");
const addSubjectBtn = document.getElementById("add-subject-btn");
const subjectsList = document.getElementById("subjects-list");
const calculateBtn = document.getElementById("calculate-btn");
const inputError = document.getElementById("input-error");
const resultCard = document.getElementById("result-card");
// ── localStorage ──────────────────────────────────────────────────────────────
const STORAGE_KEY = "gradeSubjects";
function loadSubjects() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data === null)
        return [];
    return JSON.parse(data);
}
function saveSubjects(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
// ── Grade logic ───────────────────────────────────────────────────────────────
function getLetterGrade(score) {
    if (score >= 70)
        return LetterGrade.A;
    if (score >= 60)
        return LetterGrade.B;
    if (score >= 50)
        return LetterGrade.C;
    if (score >= 40)
        return LetterGrade.D;
    return LetterGrade.F;
}
function getRemark(grade) {
    switch (grade) {
        case LetterGrade.A: return "Excellent work! Keep it up.";
        case LetterGrade.B: return "Good job! A little more effort and you'll hit an A.";
        case LetterGrade.C: return "Average. There's room to improve.";
        case LetterGrade.D: return "Below average. Consider revisiting the material.";
        case LetterGrade.F: return "Unfortunately a fail. Don't give up — try again.";
    }
}
function calculateResult(subjectList) {
    const total = subjectList.reduce((sum, s) => sum + s.score, 0);
    const average = parseFloat((total / subjectList.length).toFixed(1));
    const grade = getLetterGrade(average);
    const remark = getRemark(grade);
    return { average, grade, remark };
}
// ── Error helper ──────────────────────────────────────────────────────────────
const DEFAULT_ERROR = "Please enter a subject name and a valid score (0–100)";
function showError(message) {
    inputError.textContent = message;
    inputError.classList.add("visible");
}
function hideError() {
    inputError.classList.remove("visible");
    inputError.textContent = DEFAULT_ERROR;
}
// ── Render ────────────────────────────────────────────────────────────────────
// Builds each subject row using createElement + textContent to avoid XSS
function buildSubjectItem(subject, index) {
    const grade = getLetterGrade(subject.score);
    const item = document.createElement("div");
    item.className = "subject-item";
    const nameSpan = document.createElement("span");
    nameSpan.className = "subject-name";
    nameSpan.textContent = subject.name; // textContent — never innerHTML for user data
    const right = document.createElement("div");
    right.className = "subject-right";
    const scoreSpan = document.createElement("span");
    scoreSpan.className = "subject-score";
    scoreSpan.textContent = `${subject.score}/100`;
    const badge = document.createElement("span");
    badge.className = `grade-badge grade-${grade}`;
    badge.textContent = grade;
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "✕";
    removeBtn.dataset.index = String(index);
    right.appendChild(scoreSpan);
    right.appendChild(badge);
    right.appendChild(removeBtn);
    item.appendChild(nameSpan);
    item.appendChild(right);
    return item;
}
function renderSubjects() {
    subjectsList.innerHTML = "";
    if (subjects.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "No subjects added yet.";
        subjectsList.appendChild(empty);
        return;
    }
    subjects.forEach((subject, index) => {
        subjectsList.appendChild(buildSubjectItem(subject, index));
    });
}
// ── Event: Add subject ────────────────────────────────────────────────────────
let subjects = loadSubjects();
addSubjectBtn.addEventListener("click", () => {
    const name = subjectNameInput.value.trim();
    const score = Number(subjectScoreInput.value);
    if (name === "" || isNaN(score) || score < 0 || score > 100 || subjectScoreInput.value === "") {
        showError(DEFAULT_ERROR);
        return;
    }
    hideError();
    subjects.push({ name, score });
    saveSubjects(subjects);
    subjectNameInput.value = "";
    subjectScoreInput.value = "";
    resultCard.classList.remove("visible");
    renderSubjects();
});
// ── Event: Remove subject ─────────────────────────────────────────────────────
subjectsList.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("remove-btn")) {
        const index = Number(target.dataset.index);
        subjects.splice(index, 1);
        saveSubjects(subjects);
        resultCard.classList.remove("visible");
        renderSubjects();
    }
});
// ── Event: Calculate ──────────────────────────────────────────────────────────
calculateBtn.addEventListener("click", () => {
    if (subjects.length === 0) {
        showError("Please add at least one subject before calculating.");
        return;
    }
    hideError();
    const result = calculateResult(subjects);
    document.getElementById("out-total").textContent = String(subjects.length);
    document.getElementById("out-average").textContent = String(result.average);
    document.getElementById("out-grade").textContent = result.grade;
    document.getElementById("out-remark").textContent = result.remark;
    resultCard.classList.add("visible");
});
// ── On page load ──────────────────────────────────────────────────────────────
renderSubjects();
