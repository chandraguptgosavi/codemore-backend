const asyncHandler = require("express-async-handler");
const axios = require("axios").default;
const { throwError } = require("../utils/errorHandler");
const Problem = require("../models/problem");
const {
  areTestCasesValid,
  getUpdatedTestCases,
} = require("../utils/problemsController");
const User = require("../models/user");

/**
 * @api {get} /problems Get all problems.
 * @apiName getAllProblems
 * @apiGroup Problems
 *
 * @apiParam {Number} [page=1] 
 * @apiParam {Number} [size=50] 
 *
 * @apiSuccess {Number} totalProblems Total available problems in the database.
 * @apiSuccess {Object[]} problems List of problems on given page.
 * @apiSuccess {String} problems._id Problem id.
 * @apiSuccess {String} problems.title  Problem title.
 * @apiSuccess {String} problems.statement Problem statement.
 * @apiSuccess {String} problems.input Input taking instructions for the problem.
 * @apiSuccess {String} problems.output Output printing instructions for the problem.
 * @apiSuccess {Object} problems.sampleTestCases Sample Testcases for the problem.
 * @apiSuccess {Number} problems.sampleTestCases.count Sample Testcase count.
 * @apiSuccess {String} problems.sampleTestCases.input Sample Testcase input.
 * @apiSuccess {String} problems.sampleTestCases.output Sample Testcase output.
 * @apiSuccess {Object} problems.testCases Main Testcases for the problem.
 * @apiSuccess {Number} problems.testCases.count Main Testcase count.
 * @apiSuccess {String} problems.testCases.input Main Testcase input.
 * @apiSuccess {String} problems.testCases.output Main Testcase output.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "totalProblems": 200,
 *       "problems": [
 *          {
 *              "_id": "example_id- 343adresraedfe4re",
 *              "title": "Problem title",
 *              "statement": "Problem statement",
 *              "input": "Input instructions",
 *              "output": "Output instructions",
 *              "sampleTestCases": {
 *                 "count": 2,
 *                 "input": "example input",
 *                 "output" : "example output"
 *              },
 *              "testCases": {
 *                 "count": 2,
 *                 "input": "example input",
 *                 "output" : "example output"
 *              }
 *          }
 *          .
 *          .
 *          .
 *        ]
 *     }
 *
 * @apiError ProblemsError Problems not available or Internal Server Error.
 */
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

/**
 * @api {post} /problems Create a problem.
 * @apiName createProblem
 * @apiGroup Problems
 * 
 * @apiBody {String} title  Problem title.
 * @apiBody {String} statement Problem statement.
 * @apiBody {String} input Input taking instructions for the problem.
 * @apiBody {String} output Output printing instructions for the problem.
 * @apiBody {Object} sampleTestCases Sample Testcases for the problem.
 * @apiBody {Number} sampleTestCases.count Sample Testcase count.
 * @apiBody {String} sampleTestCases.input Sample Testcase input.
 * @apiBody {String} sampleTestCases.output Sample Testcase output.
 * @apiBody {Object} testCases Main Testcases for the problem.
 * @apiBody {Number} testCases.count Main Testcase count.
 * @apiBody {String} testCases.input Main Testcase input.
 * @apiBody {String} testCases.output Main Testcase output.
 *
 * @apiSuccess {Object} problem Newly created problem.
 * @apiSuccess {String} problem._id Problem id.
 * @apiSuccess {String} problem.title  Problem title.
 * @apiSuccess {String} problem.statement Problem statement.
 * @apiSuccess {String} problem.input Input taking instructions for the problem.
 * @apiSuccess {String} problem.output Output printing instructions for the problem.
 * @apiSuccess {Object} problem.sampleTestCases Sample Testcases for the problem.
 * @apiSuccess {Number} problem.sampleTestCases.count Sample Testcase count.
 * @apiSuccess {String} problem.sampleTestCases.input Sample Testcase input.
 * @apiSuccess {String} problem.sampleTestCases.output Sample Testcase output.
 * @apiSuccess {Object} problem.testCases Main Testcases for the problem.
 * @apiSuccess {Number} problem.testCases.count Main Testcase count.
 * @apiSuccess {String} problem.testCases.input Main Testcase input.
 * @apiSuccess {String} problem.testCases.output Main Testcase output.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
*              "_id": "example_id- 343adresraedfe4re",
*              "title": "Problem title",
*              "statement": "Problem statement",
*              "input": "Input instructions",
*              "output": "Output instructions",
*              "sampleTestCases": {
*                 "count": 2,
*                 "input": "example input",
*                 "output" : "example output"
*              },
*              "testCases": {
*                 "count": 2,
*                 "input": "example input",
*                 "output" : "example output"
*              }
*          }
 *
 * @apiError CreateProblemError Fields are missing or Invalid test case format or Internal Server Error.
 */
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
      input: sampleTestCases.input.replaceAll(/,\r?\n/g, `\n`),
      output: sampleTestCases.output.replaceAll(/,\r?\n/g, `\n`),
    },
    testCases: {
      count: testCases.count,
      input: testCases.input.replaceAll(/,\r?\n/g, `\n`),
      output: testCases.output.replaceAll(/,\r?\n/g, `\n`),
    },
  });
  res.status(200).json(problem);
});

/**
 * @api {get} /problems/:id Get a problem.
 * @apiName getProblem
 * @apiGroup Problems
 * 
 * @apiParam {String} id  Problem id.
 *
 * @apiSuccess {Object} problem Problem with given id.
 * @apiSuccess {String} problem._id Problem id.
 * @apiSuccess {String} problem.title  Problem title.
 * @apiSuccess {String} problem.statement Problem statement.
 * @apiSuccess {String} problem.input Input taking instructions for the problem.
 * @apiSuccess {String} problem.output Output printing instructions for the problem.
 * @apiSuccess {Object} problem.sampleTestCases Sample Testcases for the problem.
 * @apiSuccess {Number} problem.sampleTestCases.count Sample Testcase count.
 * @apiSuccess {String} problem.sampleTestCases.input Sample Testcase input.
 * @apiSuccess {String} problem.sampleTestCases.output Sample Testcase output.
 * @apiSuccess {Object} problem.testCases Main Testcases for the problem.
 * @apiSuccess {Number} problem.testCases.count Main Testcase count.
 * @apiSuccess {String} problem.testCases.input Main Testcase input.
 * @apiSuccess {String} problem.testCases.output Main Testcase output.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
*              "_id": "example_id- 343adresraedfe4re",
*              "title": "Problem title",
*              "statement": "Problem statement",
*              "input": "Input instructions",
*              "output": "Output instructions",
*              "sampleTestCases": {
*                 "count": 2,
*                 "input": "example input",
*                 "output" : "example output"
*              },
*              "testCases": {
*                 "count": 2,
*                 "input": "example input",
*                 "output" : "example output"
*              }
*          }
 *
 * @apiError ProblemError Problem doesn't exist or Internal Server Error.
 */
const getProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const problem = await Problem.findById(id).exec();
  if (!problem) {
    throwError(res, 404, "Problem doesn't exists!");
  }
  res.status(200).json(problem);
});

/**
 * @api {put} /problems/:id Update a problem.
 * @apiName updateProblem
 * @apiGroup Problems
 * 
 * @apiParam {String} id  Problem id.
 * 
 * @apiBody {String} [title]  Problem title.
 * @apiBody {String} [statement] Problem statement.
 * @apiBody {String} [input] Input taking instructions for the problem.
 * @apiBody {String} [output] Output printing instructions for the problem.
 * @apiBody {Object} [testCases] Main Testcases for the problem.
 * @apiBody {Number} testCases.count Main Testcase count.
 * @apiBody {String} testCases.input Main Testcase input.
 * @apiBody {String} testCases.output Main Testcase output.
 *
 * @apiSuccess {Object} problem Updated problem.
 * @apiSuccess {String} problem._id Problem id.
 * @apiSuccess {String} problem.title  Problem title.
 * @apiSuccess {String} problem.statement Problem statement.
 * @apiSuccess {String} problem.input Input taking instructions for the problem.
 * @apiSuccess {String} problem.output Output printing instructions for the problem.
 * @apiSuccess {Object} problem.sampleTestCases Sample Testcases for the problem.
 * @apiSuccess {Number} problem.sampleTestCases.count Sample Testcase count.
 * @apiSuccess {String} problem.sampleTestCases.input Sample Testcase input.
 * @apiSuccess {String} problem.sampleTestCases.output Sample Testcase output.
 * @apiSuccess {Object} problem.testCases Main Testcases for the problem.
 * @apiSuccess {Number} problem.testCases.count Main Testcase count.
 * @apiSuccess {String} problem.testCases.input Main Testcase input.
 * @apiSuccess {String} problem.testCases.output Main Testcase output.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
*              "_id": "example_id- 343adresraedfe4re",
*              "title": "Updaed problem title",
*              "statement": "Updaed problem statement",
*              "input": "Input instructions",
*              "output": "Output instructions",
*              "sampleTestCases": {
*                 "count": 2,
*                 "input": "example input",
*                 "output" : "example output"
*              },
*              "testCases": {
*                 "count": 2,
*                 "input": "example input",
*                 "output" : "example output"
*              }
*          }
 *
 * @apiError UpdateProblemError No data is provided or Invalid test case format or Internal Server Error.
 */
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

/**
 * @api {post} /problems/run Run code
 * @apiName runCode
 * @apiGroup Problems
 * 
 * @apiBody {String} srcCode  Source code.
 * @apiBody {Number} langID id for language used to code.
 * @apiBody {String} userInput Input provided by user.
 *
 * @apiSuccess {Object} response Judge0 api response.
 *
 * @apiError RunCodeError No data is provided or Rapid-API limit exceeded or Internal Server Error.
 */
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

/**
 * @api {put} /problems/:id/submit Submit solution
 * @apiName submitProblem
 * @apiGroup Problems
 * 
 * @apiParam {String} id Problem id.
 * 
 * @apiBody {String} srcCode  Source code.
 * @apiBody {String} porblemTitle Title of given problem.
 * @apiBody {Object} language Language used for solution.
 * @apiBody {Number} language.id Language id.
 * @apiBody {String} language.name Language name.
 *
 * @apiSuccess {Object} response Judge0 api response.
 *
 * @apiError SubmitProblemError No data is provided or Rapid-API limit exceeded or Internal Server Error.
 */
const submitProblem = asyncHandler(async (req, res) => {
  const { id } = req.params,
    { problemTitle, srcCode, language } = req.body;
  if (!srcCode || !language || !problemTitle) {
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
        stdin: `${problem.testCases.count}\n${problem.testCases.input}`,
        expected_output: problem.testCases.output,
        cpu_time_limit: "2.0",
        memory_limit: "262144",
      },
    };
    const submissionRes = (await axios(axiosConfig)).data;
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        submissions: {
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
