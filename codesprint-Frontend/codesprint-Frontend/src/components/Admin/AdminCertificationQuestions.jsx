import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AdminCertificationQuestions.css";

const API_BASE_URL = "/api";

const emptyCustomProblem = {
  title: "",
  description: "",
  difficulty: "EASY",
  category: "",
  inputFormat: "",
  outputFormat: "",
  constraints: ""
};

const AdminCertificationQuestions = () => {
  const { certificationId } = useParams();
  const navigate = useNavigate();

  const [certification, setCertification] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [problems, setProblems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionType, setQuestionType] = useState("EXISTING");

  const [problemId, setProblemId] = useState("");
  const [questionOrder, setQuestionOrder] = useState("");
  const [percentageWeight, setPercentageWeight] = useState("");

  const [customProblem, setCustomProblem] = useState(emptyCustomProblem);
  const [createdCustomProblem, setCreatedCustomProblem] = useState(null);

  useEffect(() => {
    loadData();
  }, [certificationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadCertification(),
        loadQuestions(),
        loadProblems()
      ]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load certification data.");
    } finally {
      setLoading(false);
    }
  };

  const loadCertification = async () => {
    const response = await fetch(
      `${API_BASE_URL}/admin/certifications/${certificationId}`
    );

    if (!response.ok) {
      throw new Error("Failed to load certification.");
    }

    const data = await response.json();
    setCertification(data);
  };

  const loadQuestions = async () => {
    const response = await fetch(
      `${API_BASE_URL}/admin/certifications/${certificationId}/questions`
    );

    if (!response.ok) {
      throw new Error("Failed to load certification questions.");
    }

    const data = await response.json();

    setQuestions(
      Array.isArray(data) ? data : []
    );
  };

  const loadProblems = async () => {
    const response = await fetch(
      `${API_BASE_URL}/problems`
    );

    if (!response.ok) {
      throw new Error("Failed to load problems.");
    }

    const data = await response.json();

    const normalProblems =
      Array.isArray(data)
        ? data.filter(
            problem =>
              !problem.source ||
              problem.source === "NORMAL"
          )
        : [];

    setProblems(normalProblems);
  };

  // ============================================================
  // CUSTOM PROBLEM FORM
  // ============================================================

  const handleCustomProblemChange = (
    field,
    value
  ) => {
    setCustomProblem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setEditingQuestionId(null);
    setQuestionType("EXISTING");
    setProblemId("");
    setQuestionOrder("");
    setPercentageWeight("");

    setCustomProblem({
      ...emptyCustomProblem
    });

    setCreatedCustomProblem(null);

    clearMessages();
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateQuestionData = () => {
    if (!questionOrder) {
      setError(
        "Please enter question order."
      );
      return false;
    }

    if (Number(questionOrder) <= 0) {
      setError(
        "Question order must be greater than 0."
      );
      return false;
    }

    if (!percentageWeight) {
      setError(
        "Please enter percentage weight."
      );
      return false;
    }

    if (Number(percentageWeight) <= 0) {
      setError(
        "Percentage weight must be greater than 0."
      );
      return false;
    }

    if (Number(percentageWeight) > 100) {
      setError(
        "Percentage weight cannot be greater than 100%."
      );
      return false;
    }

    return true;
  };

  const validateCustomProblem = () => {
    if (!customProblem.title.trim()) {
      setError(
        "Please enter custom problem title."
      );
      return false;
    }

    if (!customProblem.description.trim()) {
      setError(
        "Please enter custom problem description."
      );
      return false;
    }

    if (!customProblem.difficulty.trim()) {
      setError(
        "Please select difficulty."
      );
      return false;
    }

    if (!customProblem.category.trim()) {
      setError(
        "Please enter problem category."
      );
      return false;
    }

    if (!customProblem.inputFormat.trim()) {
      setError(
        "Please enter input format."
      );
      return false;
    }

    if (!customProblem.outputFormat.trim()) {
      setError(
        "Please enter output format."
      );
      return false;
    }

    if (!customProblem.constraints.trim()) {
      setError(
        "Please enter constraints."
      );
      return false;
    }

    return true;
  };

  // ============================================================
  // WEIGHT
  // ============================================================

  const getCurrentTotalWeight = () => {
    return questions.reduce(
      (total, q) =>
        total +
        Number(
          q.percentageWeight || 0
        ),
      0
    );
  };

  const validateWeight = () => {
    const newWeight =
      Number(percentageWeight);

    const currentTotal =
      getCurrentTotalWeight();

    let totalAfterChange =
      currentTotal + newWeight;

    if (editingQuestionId) {
      const oldQuestion =
        questions.find(
          q =>
            q.id ===
            editingQuestionId
        );

      if (oldQuestion) {
        totalAfterChange =
          currentTotal -
          Number(
            oldQuestion.percentageWeight || 0
          ) +
          newWeight;
      }
    }

    if (totalAfterChange > 100) {
      setError(
        `Total weight cannot exceed 100%. Current total with this change would be ${totalAfterChange}%.`
      );

      return false;
    }

    return true;
  };

  // ============================================================
  // QUESTION LIMIT
  // ============================================================

  const hasReachedQuestionLimit = () => {
    if (!certification) {
      return false;
    }

    const totalQuestions =
      Number(
        certification.totalQuestions || 0
      );

    if (totalQuestions <= 0) {
      return false;
    }

    return (
      questions.length >=
      totalQuestions
    );
  };

  // ============================================================
  // ADD EXISTING PROBLEM
  // ============================================================

  const addExistingProblem = async () => {
    clearMessages();

    if (!validateQuestionData()) {
      return;
    }

    if (!problemId) {
      setError(
        "Please select a CodeSprint problem."
      );
      return;
    }

    if (
      !editingQuestionId &&
      hasReachedQuestionLimit()
    ) {
      setError(
        `This certification already has ${questions.length} of ${certification.totalQuestions} questions.`
      );

      return;
    }

    if (!validateWeight()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        problem: {
          id: Number(problemId)
        },
        questionOrder:
          Number(questionOrder),
        percentageWeight:
          Number(percentageWeight)
      };

      const url =
        editingQuestionId
          ? `${API_BASE_URL}/admin/certifications/questions/${editingQuestionId}`
          : `${API_BASE_URL}/admin/certifications/${certificationId}/questions`;

      const response =
        await fetch(
          url,
          {
            method:
              editingQuestionId
                ? "PUT"
                : "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(payload)
          }
        );

      let data = {};

      try {
        data =
          await response.json();
      } catch {
        // Ignore non-JSON response.
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          `Failed to save certification question. HTTP ${response.status}`
        );
      }

      setSuccess(
        editingQuestionId
          ? "Certification question updated successfully."
          : "Problem added to certification successfully."
      );

      await loadQuestions();

      resetForm();

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Failed to save certification question."
      );

    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // CREATE CUSTOM PROBLEM
  // ============================================================

  const createCustomProblem = async () => {
    clearMessages();

    if (!validateQuestionData()) {
      return;
    }

    if (!validateCustomProblem()) {
      return;
    }

    if (
      !editingQuestionId &&
      hasReachedQuestionLimit()
    ) {
      setError(
        `This certification already has ${questions.length} of ${certification.totalQuestions} questions.`
      );

      return;
    }

    if (!validateWeight()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        problem: {
          title:
            customProblem.title.trim(),

          description:
            customProblem.description.trim(),

          difficulty:
            customProblem.difficulty,

          category:
            customProblem.category.trim(),

          inputFormat:
            customProblem.inputFormat.trim(),

          outputFormat:
            customProblem.outputFormat.trim(),

          constraints:
            customProblem.constraints.trim(),

          source:
            "CERTIFICATION_ONLY"
        },

        questionOrder:
          Number(questionOrder),

        percentageWeight:
          Number(percentageWeight)
      };

      const response =
        await fetch(
          `${API_BASE_URL}/admin/certifications/${certificationId}/custom-problems`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(payload)
          }
        );

      let data = {};

      try {
        data =
          await response.json();
      } catch {
        // Ignore non-JSON response.
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          `Failed to create custom certification problem. HTTP ${response.status}`
        );
      }

      /*
       * Keep the returned custom problem/question.
       *
       * This allows the Configure Test Cases button to know
       * exactly which problem was just created.
       */
      setCreatedCustomProblem(data);

      setSuccess(
        "Custom certification problem created successfully."
      );

      await loadQuestions();

      setQuestionOrder("");
      setPercentageWeight("");

      setCustomProblem({
        ...emptyCustomProblem
      });

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Failed to create custom certification problem."
      );

    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // EDIT QUESTION
  // ============================================================

  const handleEdit = question => {
    clearMessages();

    setEditingQuestionId(
      question.id
    );

    setProblemId(
      question.problemId
        ? String(question.problemId)
        : ""
    );

    setQuestionOrder(
      question.questionOrder
        ? String(question.questionOrder)
        : ""
    );

    setPercentageWeight(
      question.percentageWeight !== null &&
      question.percentageWeight !== undefined
        ? String(
            question.percentageWeight
          )
        : ""
    );

    if (
      question.source ===
      "CERTIFICATION_ONLY"
    ) {
      setQuestionType("CUSTOM");

      setCustomProblem({
        title:
          question.problemTitle || "",

        description:
          question.description || "",

        difficulty:
          question.difficulty || "EASY",

        category:
          question.category || "",

        inputFormat:
          question.inputFormat || "",

        outputFormat:
          question.outputFormat || "",

        constraints:
          question.constraints || ""
      });

    } else {
      setQuestionType("EXISTING");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // ============================================================
  // DELETE QUESTION
  // ============================================================

  const handleDelete = async (
    questionId
  ) => {
    clearMessages();

    if (
      !window.confirm(
        "Are you sure you want to remove this question?"
      )
    ) {
      return;
    }

    try {
      setSaving(true);

      const response =
        await fetch(
          `${API_BASE_URL}/admin/certifications/questions/${questionId}`,
          {
            method: "DELETE"
          }
        );

      if (!response.ok) {
        let data = {};

        try {
          data =
            await response.json();
        } catch {
          // Ignore non-JSON response.
        }

        throw new Error(
          data.message ||
          data.error ||
          `Failed to delete certification question. HTTP ${response.status}`
        );
      }

      setSuccess(
        "Certification question removed successfully."
      );

      await loadQuestions();

      if (
        editingQuestionId ===
        questionId
      ) {
        resetForm();
      }

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Failed to delete certification question."
      );

    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // CUSTOM PROBLEM ID
  // ============================================================

  const getProblemIdFromCreatedProblem = () => {
    if (!createdCustomProblem) {
      return null;
    }

    return (
      createdCustomProblem.problemId ||
      createdCustomProblem.problem?.id ||
      null
    );
  };

  // ============================================================
  // MANAGE TEST CASES
  // ============================================================

  /*
   * TestCaseManagement.jsx already reads:
   *
   * ?problemId=...
   * ?problemTitle=...
   *
   * Certification-only problems do not appear in the normal
   * problem list, so we explicitly pass their ID/title.
   */
  const handleManageTestCases = (
    selectedProblemId,
    selectedProblemTitle = ""
  ) => {
    const id =
      Number(
        selectedProblemId ||
        getProblemIdFromCreatedProblem()
      );

    if (!id) {
      setError(
        "Problem ID was not returned by the server."
      );

      return;
    }

    const params =
      new URLSearchParams();

    params.set(
      "problemId",
      String(id)
    );

    if (selectedProblemTitle) {
      params.set(
        "problemTitle",
        selectedProblemTitle
      );
    }

    navigate(
      `/admin/test-cases?${params.toString()}`
    );
  };

  // ============================================================
  // SUMMARY
  // ============================================================

  const totalWeight =
    getCurrentTotalWeight();

  const questionCount =
    questions.length;

  const configuredQuestionCount =
    certification?.totalQuestions || 0;

  const remainingWeight =
    Math.max(
      0,
      100 - totalWeight
    );

  const questionLimitReached =
    hasReachedQuestionLimit();

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="admin-certification-questions-page">

        <div className="admin-cert-loading">

          <div className="admin-cert-spinner"></div>

          <p>
            Loading certification details...
          </p>

        </div>

      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="admin-certification-questions-page">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="admin-cert-question-page-header">

        <div>

          <button
            type="button"
            className="admin-cert-back-button"
            onClick={() =>
              navigate(
                "/admin/certifications"
              )
            }
          >
            ← Back to Certifications
          </button>

          <h1>
            Manage Certification Questions
          </h1>

          <p>
            {certification?.title ||
              certification?.name ||
              "CodeSprint Certification Track"}
          </p>

        </div>

      </div>

      {/* ========================================================
          ALERTS
      ======================================================== */}

      {error && (
        <div className="admin-cert-error">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            &times;
          </button>

        </div>
      )}

      {success && (
        <div className="admin-cert-success">

          <span>
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
          >
            &times;
          </button>

        </div>
      )}

      {/* ========================================================
          SUMMARY
      ======================================================== */}

      <div className="admin-cert-question-summary">

        <div className="admin-cert-summary-card">

          <span>
            Questions
          </span>

          <strong>
            {questionCount}
            {" "}
            {configuredQuestionCount
              ? `/ ${configuredQuestionCount}`
              : ""}
          </strong>

        </div>

        <div className="admin-cert-summary-card">

          <span>
            Total Weight
          </span>

          <strong
            className={
              totalWeight === 100
                ? "text-success"
                : ""
            }
          >
            {totalWeight}%
          </strong>

        </div>

        <div className="admin-cert-summary-card">

          <span>
            Remaining Weight
          </span>

          <strong
            className={
              remainingWeight === 0
                ? "text-success"
                : "text-warning"
            }
          >
            {remainingWeight}%
          </strong>

        </div>

        <div className="admin-cert-summary-card">

          <span>
            Problem Sources
          </span>

          <strong className="summary-breakdown">

            {
              questions.filter(
                q =>
                  q.source ===
                  "CERTIFICATION_ONLY"
              ).length
            }
            {" "}Custom •{" "}

            {
              questions.filter(
                q =>
                  q.source !==
                  "CERTIFICATION_ONLY"
              ).length
            }
            {" "}Existing

          </strong>

        </div>

      </div>

      {/* ========================================================
          FORM CARD
      ======================================================== */}

      <div className="admin-cert-question-form-card">

        <div className="admin-cert-question-form-header">

          <div>

            <h2>
              {editingQuestionId
                ? "Edit Certification Question"
                : "Add Certification Question"}
            </h2>

            <p>
              Choose an existing CodeSprint problem or create a problem specifically for this certification.
            </p>

          </div>

          {editingQuestionId && (

            <button
              type="button"
              className="admin-cert-secondary-button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>

          )}

        </div>

        {/* TYPE SWITCHER */}

        <div className="admin-cert-question-type-section">

          <label className="section-subtitle">
            Problem Type
          </label>

          <div className="admin-cert-question-type-options">

            <div
              className={`admin-cert-question-type-option ${
                questionType === "EXISTING"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setQuestionType(
                  "EXISTING"
                );

                setCreatedCustomProblem(
                  null
                );

                clearMessages();
              }}
            >

              <input
                type="radio"
                name="questionType"
                value="EXISTING"
                checked={
                  questionType ===
                  "EXISTING"
                }
                onChange={() => {}}
              />

              <div className="type-option-content">

                <strong>
                  Existing Problem
                </strong>

                <span>
                  Use a problem already available in CodeSprint.
                </span>

              </div>

            </div>

            <div
              className={`admin-cert-question-type-option ${
                questionType === "CUSTOM"
                  ? "active"
                  : ""
              }`}
              onClick={() => {

                if (
                  editingQuestionId &&
                  questions.find(
                    q =>
                      q.id ===
                      editingQuestionId
                  )?.source !==
                    "CERTIFICATION_ONLY"
                ) {
                  setEditingQuestionId(
                    null
                  );
                }

                setQuestionType(
                  "CUSTOM"
                );

                setCreatedCustomProblem(
                  null
                );

                clearMessages();
              }}
            >

              <input
                type="radio"
                name="questionType"
                value="CUSTOM"
                checked={
                  questionType ===
                  "CUSTOM"
                }
                onChange={() => {}}
              />

              <div className="type-option-content">

                <strong>
                  Custom Problem
                </strong>

                <span>
                  Create a problem only for this certification track.
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* ======================================================
            EXISTING PROBLEM
        ====================================================== */}

        {questionType === "EXISTING" && (

          <div className="form-grid">

            <div className="admin-cert-form-group full-width">

              <label htmlFor="problemSelector">
                CodeSprint Problem
              </label>

              <select
                id="problemSelector"
                value={problemId}
                onChange={e =>
                  setProblemId(
                    e.target.value
                  )
                }
                disabled={
                  questionLimitReached &&
                  !editingQuestionId
                }
              >

                <option value="">
                  Select a problem from the library
                </option>

                {problems.map(
                  problem => (

                    <option
                      key={problem.id}
                      value={problem.id}
                    >
                      {problem.title}
                      {" — ["}
                      {problem.difficulty}
                      {"] ("}
                      {problem.category ||
                        "General"}
                      {")"}
                    </option>

                  )
                )}

              </select>

              <small>
                Only standard CodeSprint challenges appear here.
              </small>

            </div>

          </div>

        )}

        {/* ======================================================
            CUSTOM PROBLEM
        ====================================================== */}

        {questionType === "CUSTOM" && (

          <div className="admin-cert-custom-problem-section">

            <div className="admin-cert-custom-problem-header">

              <div>

                <h3>
                  Certification-Only Problem
                </h3>

                <p>
                  This challenge is isolated exclusively to this track and will not appear in the library.
                </p>

              </div>

              <span className="problem-source-badge custom">
                Certification Only
              </span>

            </div>

            <div className="form-grid">

              <div className="admin-cert-form-group full-width">

                <label>
                  Problem Title *
                </label>

                <input
                  type="text"
                  value={
                    customProblem.title
                  }
                  onChange={e =>
                    handleCustomProblemChange(
                      "title",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Optimized LRU Cache"
                />

              </div>

              <div className="admin-cert-form-group full-width">

                <label>
                  Problem Description *
                </label>

                <textarea
                  rows="3"
                  value={
                    customProblem.description
                  }
                  onChange={e =>
                    handleCustomProblemChange(
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Describe requirements, inputs, and algorithmic objectives..."
                />

              </div>

              <div className="admin-cert-form-group">

                <label>
                  Difficulty *
                </label>

                <select
                  value={
                    customProblem.difficulty
                  }
                  onChange={e =>
                    handleCustomProblemChange(
                      "difficulty",
                      e.target.value
                    )
                  }
                >

                  <option value="EASY">
                    Easy
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="HARD">
                    Hard
                  </option>

                </select>

              </div>

              <div className="admin-cert-form-group">

                <label>
                  Category *
                </label>

                <input
                  type="text"
                  value={
                    customProblem.category
                  }
                  onChange={e =>
                    handleCustomProblemChange(
                      "category",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Dynamic Programming"
                />

              </div>

              <div className="admin-cert-form-group full-width">

                <label>
                  Input Format *
                </label>

                <textarea
                  rows="2"
                  value={
                    customProblem.inputFormat
                  }
                  onChange={e =>
                    handleCustomProblemChange(
                      "inputFormat",
                      e.target.value
                    )
                  }
                  placeholder="Describe input parameters..."
                />

              </div>

              <div className="admin-cert-form-group full-width">

                <label>
                  Output Format *
                </label>

                <textarea
                  rows="2"
                  value={
                    customProblem.outputFormat
                  }
                  onChange={e =>
                    handleCustomProblemChange(
                      "outputFormat",
                      e.target.value
                    )
                  }
                  placeholder="Describe output expectations..."
                />

              </div>

              <div className="admin-cert-form-group full-width">

                <label>
                  Constraints *
                </label>

                <textarea
                  rows="2"
                  value={
                    customProblem.constraints
                  }
                  onChange={e =>
                    handleCustomProblemChange(
                      "constraints",
                      e.target.value
                    )
                  }
                  placeholder="e.g. 1 <= N <= 10^5"
                />

              </div>

            </div>

          </div>

        )}

        {/* ======================================================
            ORDER + WEIGHT
        ====================================================== */}

        <div className="form-grid mt-4">

          <div className="admin-cert-form-group">

            <label htmlFor="questionOrder">
              Question Order *
            </label>

            <input
              id="questionOrder"
              type="number"
              min="1"
              value={questionOrder}
              onChange={e =>
                setQuestionOrder(
                  e.target.value
                )
              }
              placeholder="e.g. 1"
            />

          </div>

          <div className="admin-cert-form-group">

            <label htmlFor="percentageWeight">
              Percentage Weight (%) *
            </label>

            <input
              id="percentageWeight"
              type="number"
              min="0.01"
              max="100"
              step="0.5"
              value={
                percentageWeight
              }
              onChange={e =>
                setPercentageWeight(
                  e.target.value
                )
              }
              placeholder="e.g. 25"
            />

            <small>
              Total weight must sum to 100%.
            </small>

          </div>

        </div>

        {questionLimitReached &&
          !editingQuestionId && (

          <div
            className="admin-cert-error"
            style={{
              marginTop: "16px"
            }}
          >

            <span>
              This certification has reached its limit of{" "}
              <strong>
                {
                  certification?.totalQuestions
                }
              </strong>{" "}
              questions.
            </span>

          </div>

        )}

        {/* ======================================================
            FORM ACTIONS
        ====================================================== */}

        <div className="admin-cert-question-form-actions">

          <button
            type="button"
            className="admin-cert-secondary-button"
            onClick={resetForm}
            disabled={saving}
          >
            Clear
          </button>

          <button
            type="button"
            className="admin-cert-primary-button"
            disabled={
              saving ||
              (
                questionLimitReached &&
                !editingQuestionId
              )
            }
            onClick={
              questionType ===
              "EXISTING"
                ? addExistingProblem
                : createCustomProblem
            }
          >

            {saving
              ? "Saving..."
              : editingQuestionId
              ? "Update Question"
              : questionType ===
                "CUSTOM"
              ? "Create Custom Problem"
              : "Add Problem"}

          </button>

        </div>

        {/* ======================================================
            CUSTOM PROBLEM CREATED
        ====================================================== */}

        {createdCustomProblem && (

          <div className="admin-cert-custom-created">

            <div>

              <strong>
                Custom problem saved successfully.
              </strong>

              <p>
                Problem ID: #
                {
                  getProblemIdFromCreatedProblem() ||
                  "Generated"
                }
              </p>

              <span>
                Add test cases before candidates take this certification.
              </span>

            </div>

            <button
              type="button"
              className="manage-test-case-button"
              onClick={() =>
                handleManageTestCases(
                  getProblemIdFromCreatedProblem(),
                  createdCustomProblem?.problemTitle ||
                    createdCustomProblem?.problem?.title ||
                    ""
                )
              }
            >
              Configure Test Cases →
            </button>

          </div>

        )}

      </div>

      {/* ========================================================
          QUESTIONS TABLE
      ======================================================== */}

      <div className="admin-certification-questions-table-card">

        <div className="admin-certification-questions-table-header">

          <div>

            <h2>
              Certification Questions
            </h2>

            <p>
              Problems currently assigned to this track.
            </p>

          </div>

          <button
            type="button"
            className="admin-cert-refresh-button"
            onClick={loadQuestions}
            disabled={saving}
          >

            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>

            Refresh

          </button>

        </div>

        {questions.length === 0 ? (

          <div className="admin-cert-empty-state">

            <div className="admin-cert-empty-icon">
              📝
            </div>

            <h3>
              No questions added yet
            </h3>

            <p>
              Assign existing problems or build certification-only challenges above.
            </p>

          </div>

        ) : (

          <div className="admin-certification-questions-table-wrapper">

            <table>

              <thead>

                <tr>

                  <th style={{ width: "80px" }}>
                    Order
                  </th>

                  <th>
                    Problem
                  </th>

                  <th>
                    Source
                  </th>

                  <th>
                    Difficulty
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Weight
                  </th>

                  <th
                    style={{
                      textAlign: "right"
                    }}
                  >
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {questions
                  .slice()
                  .sort(
                    (a, b) =>
                      Number(
                        a.questionOrder
                      ) -
                      Number(
                        b.questionOrder
                      )
                  )
                  .map(
                    question => (

                      <tr key={question.id}>

                        <td>

                          <span className="question-order-badge">
                            #{question.questionOrder}
                          </span>

                        </td>

                        <td>

                          <div className="cert-problem-cell">

                            <strong>
                              {question.problemTitle}
                            </strong>

                            <small>
                              ID: #{question.problemId}
                            </small>

                          </div>

                        </td>

                        <td>

                          <span
                            className={`problem-source-badge ${
                              question.source ===
                              "CERTIFICATION_ONLY"
                                ? "custom"
                                : "existing"
                            }`}
                          >

                            {question.source ===
                            "CERTIFICATION_ONLY"
                              ? "Certification Only"
                              : "Existing"}

                          </span>

                        </td>

                        <td>

                          <span
                            className={`difficulty-badge ${String(
                              question.difficulty ||
                                ""
                            ).toLowerCase()}`}
                          >

                            {question.difficulty ||
                              "EASY"}

                          </span>

                        </td>

                        <td>
                          {question.category ||
                            "General"}
                        </td>

                        <td>

                          <strong>
                            {question.percentageWeight}%
                          </strong>

                        </td>

                        <td>

                          <div className="cert-question-actions">

                            <button
                              type="button"
                              className="admin-cert-action-btn edit"
                              onClick={() =>
                                handleEdit(
                                  question
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="admin-cert-action-btn delete"
                              onClick={() =>
                                handleDelete(
                                  question.id
                                )
                              }
                              disabled={saving}
                            >
                              Delete
                            </button>

                            {/* =================================
                                CERTIFICATION TEST CASE BUTTON
                            ================================= */}

                            {question.source ===
                              "CERTIFICATION_ONLY" && (

                              <button
                                type="button"
                                className="admin-cert-action-btn test-case"
                                onClick={() =>
                                  handleManageTestCases(
                                    question.problemId,
                                    question.problemTitle
                                  )
                                }
                              >
                                Test Cases
                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    )
                  )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ========================================================
          GUIDELINES
      ======================================================== */}

      <div className="admin-cert-information-box">

        <h3>
          Track Configuration Guidelines
        </h3>

        <ul>

          <li>
            Existing problems are pulled from the standard CodeSprint challenge pool.
          </li>

          <li>
            Custom problems are saved under{" "}
            <code>
              CERTIFICATION_ONLY
            </code>{" "}
            and hidden from normal public listings.
          </li>

          <li>
            Every custom problem must have valid input/output test cases configured before track publication.
          </li>

          <li>
            Combined question weights must total{" "}
            <strong>
              100%
            </strong>.
          </li>

          <li>
            The track can contain questions up to its configured{" "}
            <strong>
              Total Questions
            </strong>{" "}
            threshold.
          </li>

        </ul>

      </div>

    </div>
  );
};

export default AdminCertificationQuestions;