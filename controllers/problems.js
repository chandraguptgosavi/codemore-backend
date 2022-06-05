const asyncHandler = require("express-async-handler");
const axios = require("axios").default;
const { throwError } = require("../utils/errorHandler");
const Problem = require("../models/problem");
const {
  areTestCasesValid,
  getUpdatedTestCases,
} = require("../utils/problemsController");
const User = require("../models/user");

const getAllProblems = asyncHandler(async (req, res) => {
  const page = req.query.page ? req.query.page : 1,
    size = req.query.size ? req.query.size : 50;

  const [totalProblems, problems] = await Promise.all([
    Problem.estimatedDocumentCount(),
    Problem.find()
      .limit(size)
      .skip((page - 1) * size),
  ]);
  res.status(200).json({ totalProblems, problems });
});

const createProblem = asyncHandler(async (req, res) => {
  const { title, statement, input, output, sampleTestCases, testCases } =
    req.body;

  if (
    !title ||
    !statement ||
    !input ||
    !output ||
    !sampleTestCases ||
    !sampleTestCases.count ||
    !sampleTestCases.input ||
    !sampleTestCases.output ||
    !testCases ||
    !testCases.count ||
    !testCases.input ||
    !testCases.output
  ) {
    throwError(res, 400, "Fields are missing!");
  }

  if (!areTestCasesValid(sampleTestCases) || !areTestCasesValid(testCases)) {
    throwError(res, 400, "Test case format is invalid!");
  }

  const problem = await Problem.create({
    title,
    statement,
    input,
    output,
    sampleTestCases: {
      count: sampleTestCases.count,
      input: sampleTestCases.input.replaceAll(",\r\n", "\r\n"),
      output: sampleTestCases.output.replaceAll(",\r\n", "\r\n"),
    },
    testCases: {
      count: testCases.count,
      input: testCases.input.replaceAll(",\r\n", "\r\n"),
      output: testCases.output.replaceAll(",\r\n", "\r\n"),
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

  let updatedProblem;

  if (req.body.testCases) {
    const testCases = req.body.testCases;
    if (testCases && !areTestCasesValid(testCases)) {
      throwError(res, 400, "Test case format is invalid!");
    }

    const update = {
      testCases: getUpdatedTestCases(testCases, problem.testCases),
    };

    updatedProblem = await Problem.findByIdAndUpdate(id, update, {
      new: true,
    }).exec();
  } else {
    updatedProblem = await Problem.findByIdAndUpdate(id, req.body, {
      new: true,
    }).exec();
  }
  res.status(200).json(updatedProblem);
});

const runCode = asyncHandler(async (req, res) => {
  const { srcCode, langID, userInput } = req.body;

  if (!srcCode || !langID || !userInput) {
    throwError(res, 404, "Fields are missing!");
  }

  try {
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
  } catch (error) {
    if (error.message === "Request failed with status code 429") {
      throwError(res, 429, "Rapid-API's request limit exceeded!");
    }
    throwError(res, 500, "Internal Server Error");
  }
});

const submitProblem = asyncHandler(async (req, res) => {
  const { id } = req.params,
    { problemTitle, srcCode, language } = req.body;
  if (!srcCode || !langID || !problemTitle) {
    throwError(res, 400, "Fields are missing!");
  }

  const problem = await Problem.findById(id).exec();
  if (!problem) {
    throwError(res, 404, "Problem doesn't exists!");
  }

  try {
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
        language_id: language.id,
        stdin: problem.testCases.input,
        expected_output: problem.testCases.output,
        cpu_time_limit: "2.0",
        memory_limit: "262144",
      },
    };
    const submissionRes = (await axios(axiosConfig)).data;
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        problems: {
          problemTitle,
          languageName: language.name,
          problemID: id,
          status: submissionRes.status,
        },
      },
    });
    res.status(200).json(submissionRes);
  } catch (error) {
    if (error.message === "Request failed with status code 429") {
      throwError(res, 429, "Rapid-API's request limit exceeded!");
    }
    throwError(res, 500, "Internal Server Error");
  }
});

module.exports = {
  getAllProblems,
  createProblem,
  getProblem,
  updateProblem,
  runCode,
  submitProblem,
};
