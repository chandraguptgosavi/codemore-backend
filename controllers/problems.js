const asyncHandler = require("express-async-handler");
const axios = require("axios").default;
const { throwError } = require("../utils/errorHandler");
const Problem = require("../models/problem");
const { areTestCasesValid } = require("../utils/problemsController");
const User = require("../models/user");

const getAllProblems = asyncHandler(async (req, res) => {
  const page = req.query.page ? req.query.page : 1,
    size = req.query.size ? req.query.size : 50;
  const problems = await Problem.find()
    .limit(size)
    .skip((page - 1) * size);
  res.status(200).json(problems);
});

const createProblem = asyncHandler(async (req, res) => {
  const {
    title,
    statement,
    input,
    output,
    sampleInput,
    sampleOutput,
    testCases,
  } = req.body;

  if (
    !title ||
    !statement ||
    !input ||
    !output ||
    !sampleInput ||
    !sampleOutput ||
    !testCases ||
    !testCases.count ||
    !testCases.stdInput ||
    !testCases.stdOutput
  ) {
    throwError(res, 400, "Fields are missing!");
  }

  if (!areTestCasesValid(testCases)) {
    throwError(res, 400, "Test case format is invalid!");
  }

  const problem = await Problem.create({
    title,
    statement,
    input,
    output,
    sampleInput,
    sampleOutput,
    testCases: {
      count: testCases.count,
      stdInput: testCases.stdInput.replaceAll(",", "\r\n"),
      stdOutput: testCases.stdOutput.replaceAll(",", "\r\n"),
    },
  });
  res.status(200).json(problem);
});

const getProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const problem = await Problem.findById(id).exec();
  if (!problem) {
    throwError(res, 404, "Problem doesn't exists!");
  }
  res.status(200).json(problem);
});

const updateProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!Object.keys(req.body).length) {
    throwError(res, 400, "At least one field required!");
  }
  const problem = await Problem.findById(id).exec();
  if (!problem) {
    throwError(res, 404, "Problem doesn't exists!");
  }

  if (req.body.testCases && !areTestCasesValid(req.body.testCases)) {
    throwError(res, 400, "Test case format is invalid!");
  }

  const update = {
    ...req.body,
    testCases: {
      count: !req.body.testCases
        ? problem.testCases.count
        : problem.testCases.count + req.body.testCases.count,
      stdInput:
        req.body.testCases && req.body.testCases.stdInput !== undefined
          ? `${
              problem.testCases.stdInput
            }\r\n${req.body.testCases.stdInput.replaceAll(",", "\r\n")}`
          : problem.testCases.stdInput,
      stdOutput:
        req.body.testCases && req.body.testCases.stdOutput !== undefined
          ? `${
              problem.testCases.stdOutput
            },${req.body.testCases.stdOutput.replaceAll(",", "\r\n")}`
          : problem.testCases.stdOutput,
    },
  };

  const updatedProblem = await Problem.findByIdAndUpdate(id, update, {
    new: true,
  }).exec();
  res.status(200).json(updatedProblem);
});

const runCode = asyncHandler(async (req, res) => {
  const { srcCode, langID, userInput } = req.body;

  if (!srcCode || !langID || !userInput) {
    throwError(res, 404, "Fields are missing!");
  }

  const axiosConfig = {
    method: "post",
    url: `https://judge0-ce.p.rapidapi.com/submissions/?wait=true`,
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
    },
    data: {
      source_code: srcCode,
      language_id: langID,
      stdin: userInput,
      cpu_time_limit: "2.0",
      memory_limit: "262144",
    },
  };
  const submissionRes = (await axios(axiosConfig)).data;
  res.status(200).json(submissionRes);
});

const submitProblem = asyncHandler(async (req, res) => {
  const { id } = req.params,
    { srcCode, langID } = req.body;
  if (!srcCode || !langID) {
    throwError(res, 400, "Fields are missing!");
  }

  const problem = await Problem.findById(id).exec();
  if (!problem) {
    throwError(res, 404, "Problem doesn't exists!");
  }

  const axiosConfig = {
    method: "post",
    url: `https://judge0-ce.p.rapidapi.com/submissions/?wait=true`,
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
    },
    data: {
      source_code: srcCode,
      language_id: langID,
      stdin: problem.testCases.stdInput,
      expected_output: problem.testCases.stdOutput,
      cpu_time_limit: "2.0",
      memory_limit: "262144",
    },
  };
  const submissionRes = (await axios(axiosConfig)).data;
  await User.findByIdAndUpdate(req.user._id, {
    problems: [
      ...req.user.problems,
      { problemID: id, status: submissionRes.status },
    ],
  });
  res.status(200).json(submissionRes);
});

module.exports = {
  getAllProblems,
  createProblem,
  getProblem,
  updateProblem,
  runCode,
  submitProblem,
};
