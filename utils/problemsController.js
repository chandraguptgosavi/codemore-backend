const areTestCasesValid = (testCases) => {
  const { count, input, output } = testCases,
    splitedInput = input.split(/,\r?\n/),
    splitedOutput = output.split(/,\r?\n/),
    inputLength = splitedInput.length,
    outputLength = splitedOutput.length;
  return count === inputLength && count === outputLength;
};

const getUpdatedTestCases = (newTestCases, oldTestCases) => {
  return {
    count: !newTestCases
      ? oldTestCases.count
      : oldTestCases.count + newTestCases.count,
    input:
      newTestCases && newTestCases.input !== undefined
        ? `${oldTestCases.input}\n${newTestCases.input.replaceAll(
            /,\r?\n/g,
            `\n`
          )}`
        : oldTestCases.input,
    output:
      newTestCases && newTestCases.output !== undefined
        ? `${oldTestCases.output}\n${newTestCases.output.replaceAll(
            /,\r?\n/g,
            `\n`
          )}`
        : oldTestCases.output,
  };
};

module.exports = {
  areTestCasesValid,
  getUpdatedTestCases,
};
