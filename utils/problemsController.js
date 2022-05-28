const areTestCasesValid = (testCases) => {
  const { count, stdInput, stdOutput } = testCases,
    splitedStdInput = stdInput.split(","),
    splitedStdOutput = stdOutput.split(","),
    stdInputLength = splitedStdInput.length,
    stdOutputLength = splitedStdOutput.length;
  return count === stdInputLength && count === stdOutputLength;
};

module.exports = {
  areTestCasesValid,
};
